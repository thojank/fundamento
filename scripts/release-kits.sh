#!/usr/bin/env sh
# The release path of the Make kits, shared by release.yml (publish) and ci.yml (pack), so the two
# cannot drift apart (Spec 003 F23). Builds both kits exactly as a release would, checks that each
# exists and carries no font file (Q2: the fictitious font of ekzemplo is a name, never a file),
# then runs the dry run of the given mode in every kit.
#
# Usage: scripts/release-kits.sh dry-run|publish|pack [--print]
#   dry-run  `pnpm publish --dry-run --tag next --provenance --access public` — the preview
#            (release.yml, mode dry-run)
#   publish  the same without --dry-run: the real release, only from release.yml on main, mode
#            publish, chosen by the maintainer; needs FUNDAMENTO_KIT_VERSION (e.g. 0.1.0-next.1)
#   pack     `pnpm pack --dry-run` (ci.yml, every PR)
#   --print  builds nothing, prints the command the mode would run in every kit — pnpm shows
#            --provenance nowhere in a dry run's output, so the assembled line is what a test holds.
# Exit 1 with the path names what is missing. No token anywhere: publish goes through npm Trusted
# Publishing (OIDC) of the workflow.
set -eu

mode="${1:-}"
case "$mode" in
  dry-run|publish|pack) ;;
  *) echo "Usage: $0 dry-run|publish|pack [--print]" >&2; exit 2 ;;
esac
print="${2:-}"

# The real release names its pre-release number; the build writes it into every kit.
if [ "$mode" = "publish" ] && [ -z "${FUNDAMENTO_KIT_VERSION:-}" ]; then
  echo "publish braucht FUNDAMENTO_KIT_VERSION (z. B. 0.1.0-next.1): die Vorabnummer des Releases." >&2
  exit 2
fi
version="${FUNDAMENTO_KIT_VERSION:-<modelo>-next.0}"

out=".fundamento/release"
KITS="$out/repo/make-kit/komuna $out/ekzemplo/make-kit/ekzemplo"

# The one command of each mode, in every kit. Kept in one place so what --print shows is what runs.
command_for() {
  case "$1" in
    dry-run) echo "pnpm publish --dry-run --tag next --provenance --access public --no-git-checks" ;;
    publish) echo "pnpm publish --tag next --provenance --access public --no-git-checks" ;;
    pack) echo "pnpm pack --dry-run" ;;
  esac
}

if [ "$print" = "--print" ]; then
  echo "version: $version"
  for kit in $KITS; do
    echo "$kit: $(command_for "$mode")"
  done
  exit 0
fi

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
  echo "== $dir: $(command_for "$mode")"
  (cd "$dir" && sh -c "$(command_for "$mode")")
}

for kit in $KITS; do
  check_kit "$kit"
done
for kit in $KITS; do
  dry_run "$kit"
done
echo "Beide Kits gebaut und im Probelauf ($mode) durch: komuna, ekzemplo."
