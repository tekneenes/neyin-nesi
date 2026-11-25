import fs from 'fs';
import os from 'os';

export interface HardwareStatus {
  cpuTemp: number; // Santigrat (°C)
  totalRamMB: number;
  freeRamMB: number;
  usedRamPercent: number;
  isThrottled: boolean;
  status: 'optimal' | 'warning' | 'critical';
}

/**
 * Tekne sunucusundaki Linux /sys/class/hwmon veya sysfs donanım sensörlerinden
 * anlık CPU çekirdek sıcaklığını okur.
 */
export function getCpuTemperature(): number {
  try {
    // 1. Linux hwmon sensörlerini kontrol et (coretemp, k10temp vb.)
    if (fs.existsSync('/sys/class/hwmon')) {
      const hwmonDirs = fs.readdirSync('/sys/class/hwmon');
      for (const dir of hwmonDirs) {
        const dirPath = `/sys/class/hwmon/${dir}`;
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          if (file.startsWith('temp') && file.endsWith('_input')) {
            const raw = fs.readFileSync(`${dirPath}/${file}`, 'utf-8').trim();
            const milliDeg = parseInt(raw, 10);
            if (!isNaN(milliDeg) && milliDeg > 0) {
              return Math.round(milliDeg / 1000);
            }
          }
        }
      }
    }

    // 2. Fallback: thermal_zone
    if (fs.existsSync('/sys/class/thermal/thermal_zone0/temp')) {
      const raw = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf-8').trim();
      const milliDeg = parseInt(raw, 10);
      if (!isNaN(milliDeg) && milliDeg > 0) {
        return Math.round(milliDeg / 1000);
      }
    }
  } catch {
    // macOS veya sensörsüz ortamlarda varsayılan güvenli değer
  }
  return 48; // Standart oda sıcaklığı / güvenli seviye
}

/**
 * Sunucu donanım durumunu (RAM & Termal) raporlar.
 */
export function getHardwareStatus(): HardwareStatus {
  const cpuTemp = getCpuTemperature();
  let totalRamMB = Math.round(os.totalmem() / 1024 / 1024);
  let freeRamMB = Math.round(os.freemem() / 1024 / 1024);

  // Linux üzerinde MemAvailable en doğru kullanılabilir RAM göstergesidir
  if (process.platform === 'linux' && fs.existsSync('/proc/meminfo')) {
    try {
      const meminfo = fs.readFileSync('/proc/meminfo', 'utf-8');
      const match = meminfo.match(/MemAvailable:\s+(\d+)\s+kB/);
      if (match) {
        freeRamMB = Math.round(parseInt(match[1], 10) / 1024);
      }
    } catch {}
  } else if (process.platform === 'darwin') {
    // macOS sanal bellek yönetiminde serbest RAM'i güvenli seviye olarak varsay
    freeRamMB = Math.max(freeRamMB, 3000);
  }

  const usedRamPercent = Math.round(((totalRamMB - freeRamMB) / totalRamMB) * 100);

  let status: 'optimal' | 'warning' | 'critical' = 'optimal';
  let isThrottled = false;

  if (cpuTemp >= 76 || freeRamMB < 1000) {
    status = 'critical';
    isThrottled = true;
  } else if (cpuTemp >= 66 || freeRamMB < 1800) {
    status = 'warning';
  }

  return {
    cpuTemp,
    totalRamMB,
    freeRamMB,
    usedRamPercent,
    isThrottled,
    status,
  };
}

/**
 * Termal dar boğaz veya RAM tıkanması durumunda güvenli mola verdirir.
 * Donanım aşırı ısındığında fanın soğutmasına izin vermek için bekler.
 */
export async function enforceHardwareSafety(): Promise<void> {
  const status = getHardwareStatus();

  // 1. Termal Acil Durum Kontrolü (>= 76°C)
  if (status.cpuTemp >= 76) {
    console.warn(`\n🔥 [TERMAL FREN AKTİF] CPU Sıcaklığı: ${status.cpuTemp}°C! Donanım korunuyor, fan soğutana kadar duraklatılıyor...`);
    let currentTemp = status.cpuTemp;
    while (currentTemp > 58) {
      await sleep(10000); // 10 saniye bekle
      currentTemp = getCpuTemperature();
      console.log(`   ⏳ Soğuma bekleniyor... Mevcut: ${currentTemp}°C (Hedef: <58°C)`);
    }
    console.log(`❄️ [TERMAL NORMAL] CPU sıcaklığı ${currentTemp}°C seviyesine indi. Güvenle devam ediliyor.\n`);
  } else if (status.cpuTemp >= 67) {
    // Hafif ısınma -> 8 saniye dinlenme molası
    console.log(`⚠️ [SICAKLIK UYARISI] CPU: ${status.cpuTemp}°C. 8 saniye dinlenme molası veriliyor...`);
    await sleep(8000);
  }

  // 2. RAM Koruma Kontrolü (< 1.2 GB boş alan)
  if (status.freeRamMB < 1200) {
    console.warn(`\n🧹 [RAM KORUMASI] Kullanılabilir RAM ${status.freeRamMB} MB seviyesine düştü. Garbage collection çalıştırılıyor...`);
    if (global.gc) {
      try {
        global.gc();
      } catch {}
    }
    await sleep(2000);

    const refreshedFree = Math.round(os.freemem() / 1024 / 1024);
    if (refreshedFree < 800) {
      console.error(`🚨 [KRİTİK RAM TIKANMASI] RAM boşaltılamadı (${refreshedFree} MB)! OOM crash engellemek için işlem güvenle yeniden başlatılıyor.`);
      process.exit(0); // PM2 taze başlatacak
    }
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
