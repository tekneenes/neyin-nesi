#!/usr/bin/env bash
set -e

# Neyin Nesi? — Veritabanı Yedekleme ve Geri Yükleme Aracı
DB_NAME="neyinnesi"
DB_USER="${USER:-muhammed}"
REMOTE_HOST="tekne@192.168.1.163"
REMOTE_BACKUP_DIR="/home/tekne/backups"
LOCAL_BACKUP_DIR="$(pwd)/backups"

mkdir -p "$LOCAL_BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$LOCAL_BACKUP_DIR/${DB_NAME}_backup_${TIMESTAMP}.dump"

echo "=================================================="
echo "📦 PostgreSQL Yedekleme Başlatılıyor: $DB_NAME"
echo "=================================================="

# 1. pg_dump ile sıkıştırılmış custom format yedek al
pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc -f "$BACKUP_FILE"

FILE_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
echo "✅ Yerel yedek başarıyla oluşturuldu:"
echo "   Dosya: $BACKUP_FILE"
echo "   Boyut: $FILE_SIZE"

# 2. Uzak sunucuya kopyala (varsa ve erişilebilirse)
echo "📡 Yedek yerel sunucuya (tekne) aktarılıyor..."
if scp -o ConnectTimeout=5 "$BACKUP_FILE" "$REMOTE_HOST:$REMOTE_BACKUP_DIR/"; then
    echo "✅ Uzak sunucuya güvenle kopyalandı: $REMOTE_HOST:$REMOTE_BACKUP_DIR/"
else
    echo "⚠️ Uyarı: Uzak sunucuya kopyalanamadı, ancak yerel yedek güvende."
fi

echo "🎉 Yedekleme tamamlandı!"
