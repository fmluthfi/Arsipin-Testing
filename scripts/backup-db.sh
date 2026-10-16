#!/usr/bin/env bash
set -euo pipefail

command -v pg_dump >/dev/null 2>&1 || {
  printf 'pg_dump tidak ditemukan. Instal PostgreSQL client terlebih dahulu.\n' >&2
  exit 1
}

: "${DATABASE_URL:?Isi DATABASE_URL sebelum menjalankan backup}"

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
backup_dir="${BACKUP_DIR:-$project_root/backups}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)-$$"
backup_file="$backup_dir/arsipin-$timestamp.dump"
temporary_file="$backup_file.partial"

mkdir -p "$backup_dir"
chmod 700 "$backup_dir"
trap 'rm -f "$temporary_file"' EXIT

pg_dump --dbname="$DATABASE_URL" --format=custom --no-owner --no-privileges --file="$temporary_file"
chmod 600 "$temporary_file"
mv -- "$temporary_file" "$backup_file"
trap - EXIT
printf 'Backup berhasil dibuat: %s\n' "$backup_file"
