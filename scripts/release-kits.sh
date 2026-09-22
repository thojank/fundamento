#!/usr/bin/env sh
# The release path of the Make kits, shared by release.yml (publish) and ci.yml (pack), so the two
# cannot drift apart (Spec 003 F23). Builds both kits exactly as a release would, checks that each
# exists and carries no font file (Q2: the fictitious font of ekzemplo is a name, never a file),
# then runs the dry run of the given mode in every kit.
#
# Usage: scripts/release-kits.sh publish|pack
#   publish  `pnpm publish --dry-run --tag next --provenance --access public` (release.yml)
#   pack     `pnpm pack --dry-run` (ci.yml, every PR)
# Nothing here publishes: every command is a dry run. Exit 1 with the path names what is missing.
set -eu

mode="${1:-}"
case "$mode" in
  publish|pack) ;;
  *) echo "Usage: $0 publish|pack" >&2; exit 2 ;;
esac

out=".fundamento/release"
rm -rf "$out"

# komuna from the Modelo of this repository; ekzemplo from its fixture — `fm projekcioj build`
# without --config knows only the Aspektoj of the repository, and ekzemplo is not one of them.
pnpm fm projekcioj build --celo make-kit --out "$out/repo"
pnpm fm projekcioj build \
  --config packages/modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json \
  --celo make-kit --out "$out/ekzemplo"

check_kit() {
  dir="$1"
  if [ ! -f "$dir/package.json" ]; then
    echo "Kit fehlt: $dir (kein package.json). Der Bau hat es nicht geschrieben." >&2
    exit 1
  fi
  fonts=$(find "$dir" -type f \( -iname '*.woff' -o -iname '*.woff2' -o -iname '*.ttf' -o -iname '*.otf' \) || true)
  if [ -n "$fonts" ]; then
    echo "Schriftdateien im Kit $dir — eine Schrift reist als Name, nie als Datei (Q2):" >&2
    echo "$fonts" >&2
    exit 1
  fi
}

dry_run() {
  dir="$1"
  echo "== $dir ($mode, dry run)"
  case "$mode" in
    publish) (cd "$dir" && pnpm publish --dry-run --tag next --provenance --access public --no-git-checks) ;;
    pack) (cd "$dir" && pnpm pack --dry-run) ;;
  esac
}

for kit in "$out/repo/make-kit/komuna" "$out/ekzemplo/make-kit/ekzemplo"; do
  check_kit "$kit"
done
for kit in "$out/repo/make-kit/komuna" "$out/ekzemplo/make-kit/ekzemplo"; do
  dry_run "$kit"
done
echo "Beide Kits gebaut und im Probelauf ($mode) durch: komuna, ekzemplo."
