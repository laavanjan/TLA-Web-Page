#!/usr/bin/env bash
# Runs every file in supabase/migrations on an empty Postgres, in the order in
# supabase/ci/order.txt, then again the ones that say "Safe to re-run" (they
# must keep that promise).
# Fails on the first SQL error, naming the file. Used by .github/workflows/ci.yml;
# locally: PGHOST=... PGUSER=... supabase/ci/check-migrations.sh
set -euo pipefail
cd "$(dirname "$0")/../.."

PSQL=(psql -X -q -v ON_ERROR_STOP=1 -d "${PGDATABASE:-postgres}")
mapfile -t FILES < <(grep -v '^\s*#' supabase/ci/order.txt | sed '/^\s*$/d')

# Every migration file must be listed, so a new one isn't silently skipped.
for f in supabase/migrations/*.sql; do
  name=$(basename "$f")
  if ! printf '%s\n' "${FILES[@]}" | grep -qx "$name"; then
    echo "::error file=$f::$name isn't listed in supabase/ci/order.txt"
    exit 1
  fi
done

"${PSQL[@]}" -f supabase/ci/supabase-stubs.sql
for round in 1 2; do
  ran=0
  for name in "${FILES[@]}"; do
    if [ "$round" = 2 ] && ! grep -qi "safe to re-run" "supabase/migrations/$name"; then
      continue
    fi
    ran=$((ran + 1))
    if ! "${PSQL[@]}" -f "supabase/migrations/$name" > /dev/null 2> >(grep -v NOTICE >&2); then
      echo "::error file=supabase/migrations/$name::$name failed (run $round)"
      exit 1
    fi
  done
  echo "Run $round: $ran migration files OK"
done
