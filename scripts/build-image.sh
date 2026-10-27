#!/usr/bin/env bash
set -euo pipefail

command -v docker >/dev/null 2>&1 || {
  printf 'Docker tidak ditemukan. Instal dan jalankan Docker Engine/Desktop terlebih dahulu.\n' >&2
  exit 1
}

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
image_tag="${1:-0.1.0}"
api_url="${NEXT_PUBLIC_API_URL:-http://localhost:4000/api}"

docker build --pull --build-arg "NEXT_PUBLIC_API_URL=${api_url}" --tag "arsipin:${image_tag}" "$project_root"
printf 'Image berhasil dibuat: arsipin:%s\n' "$image_tag"
