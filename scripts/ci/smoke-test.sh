#!/usr/bin/env bash
# Checks the live site after a deploy: each page must come back as the real
# app (not Vercel's 404 page), and the sitemap, robots.txt and /api/geo must
# answer. Used by .github/workflows/smoke-test.yml.
#   scripts/ci/smoke-test.sh https://tlauom.com
set -uo pipefail
BASE="${1:-https://tlauom.com}"
BASE="${BASE%/}"
failed=0

# Pages that must load the site. /admin and /admin/traffic are built in the
# browser, so they also prove that unknown addresses reach the app.
PAGES=(
  /
  /admin
  /admin/login
  /admin/traffic
  /books
  /teams
  /members
  /history
  /contact
  /faq
  /privacy
  /events/thamilaruvi
  /events/brammam
  /events/brammam/meerigai
)

fetch() { # url -> sets CODE and BODY, retrying a few times while a deploy settles
  local url="$1" try
  for try in 1 2 3; do
    BODY=$(curl -sS -L --max-time 20 -w '\n%{http_code}' "$url" 2>/dev/null) || BODY=$'\n000'
    CODE="${BODY##*$'\n'}"
    BODY="${BODY%$'\n'*}"
    [ "$CODE" = 200 ] && return 0
    sleep 10
  done
  return 1
}

check() { # name, ok?
  if [ "$2" = ok ]; then
    echo "✓ $1"
  else
    echo "::error::✗ $1"
    failed=1
  fi
}

for path in "${PAGES[@]}"; do
  if fetch "$BASE$path" && grep -q '<div id="root">' <<<"$BODY"; then
    check "$path" ok
  else
    check "$path (HTTP $CODE, not the site)" bad
  fi
done

if fetch "$BASE/sitemap.xml" && grep -q "<urlset" <<<"$BODY" && grep -q "<loc>" <<<"$BODY"; then
  check "/sitemap.xml ($(grep -o '<loc>' <<<"$BODY" | wc -l | tr -d ' ') pages)" ok
else
  check "/sitemap.xml (HTTP $CODE)" bad
fi

if fetch "$BASE/robots.txt" && grep -qi "^sitemap:" <<<"$BODY"; then
  check "/robots.txt" ok
else
  check "/robots.txt (HTTP $CODE)" bad
fi

if fetch "$BASE/api/geo" && grep -q '"country"' <<<"$BODY"; then
  check "/api/geo" ok
else
  check "/api/geo (HTTP $CODE)" bad
fi

# The JavaScript the home page loads must exist too.
if fetch "$BASE/"; then
  js=$(grep -o '/static/js/main\.[a-z0-9]*\.js' <<<"$BODY" | head -1)
  if [ -n "$js" ] && fetch "$BASE$js"; then check "$js" ok; else check "main JavaScript file ($js)" bad; fi
fi

if [ "$failed" = 1 ]; then
  echo "Some checks failed on $BASE."
  exit 1
fi
echo "All checks passed on $BASE."
