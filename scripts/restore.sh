#!/usr/bin/env bash
set -e

# Neyin Nesi? — Veritabanı Geri Yükleme Aracı
DB_NAME="neyinnesi"
DB_USER="${USER:-muhammed}"

if [ -z "$1" ]; then
    echo "Kullanım: ./scripts/restore.sh <yedek_dosyasi_yolu>"
    echo "Örnek: ./scripts/restore.sh backups/neyinnesi_backup_20261016_233504.dump"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Hata: '$BACKUP_FILE' dosyası bulunamadı!"
    exit 1
fi

echo "⚠️ DİKKAT: $DB_NAME veritabanına '$BACKUP_FILE' yedeği geri yüklenecektir."
read -p "Devam etmek istiyor musunuz? (e/H): " CONFIRM
if [[ "$CONFIRM" != "e" && "$CONFIRM" != "E" ]]; then
    echo "İşlem iptal edildi."
    exit 0
fi

echo "🔄 Geri yükleme başlatılıyor..."
pg_restore -U "$DB_USER" -d "$DB_NAME" --clean --if-exists -v "$BACKUP_FILE"
echo "✅ Geri yükleme başarıyla tamamlandı!"
