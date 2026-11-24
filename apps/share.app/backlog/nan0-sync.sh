#!/usr/bin/env zsh
# Прототип команди `nan0.sync`: читає шляхи з `nan0.sync.yaml` у поточній директорії (без дублювання конфігу)

set -e
CONFIG_FILE="${1:-./nan0.sync.yaml}"
ROOT_DIR="$(pwd)"
DATE_TAG=$(date +%Y%m%d_%H%M)

if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ Не знайдено $CONFIG_FILE у $ROOT_DIR"
  exit 1
fi

# Витягуємо шлях для usb-backup безпосередньо з YAML (без дублювання в скрипті)
USB_VOL=$(awk -F'"' '/path:/ {print $2; exit}' "$CONFIG_FILE")

echo "🔍 Пошук Git-репозиторіїв у $ROOT_DIR (конфіг: $CONFIG_FILE)..."

find "$ROOT_DIR" -maxdepth 4 -name ".git" -type d 2>/dev/null | while read -r gitdir; do
  repo_dir=$(dirname "$gitdir")
  repo_name=$(basename "$repo_dir")
  echo "📦 Репозиторій: $repo_name"

  if [ -n "$USB_VOL" ] && [ -d "$USB_VOL" ]; then
    bundle_file="$USB_VOL/${repo_name}_${DATE_TAG}.bundle"
    git -C "$repo_dir" bundle create "$bundle_file" --all
    echo "   ✅ Bundle збережено: $bundle_file"
  fi

  if git -C "$repo_dir" remote get-url origin >/dev/null 2>&1; then
    if ping -c 1 -t 2 github.com >/dev/null 2>&1; then
      git -C "$repo_dir" push origin --all || echo "   ⚠️ Помилка push для $repo_name"
    fi
  fi
done
