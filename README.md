# todo-autofix

```
                         ______
                    .-"      "-.
                   /            \
       _          |              |          _
      ( \         |,  .-.  .-.  ,|         / )
       > "=._     | )(__/  \__)( |     _.=" <
      (_/"=._"=._ |/     /\     \| _.="_.="\_)
             "=._ (_     ^^     _)"_.="
                 "=\__|IIIIII|__/="
                _.="| \IIIIII/ |"=._
      _     _.="_.="\          /"=._"=._     _
     ( \_.="_.="     `--------`     "=._"=._/ )
      > _.="                            "=._ <
     

        TODO-AUTOFIX
   made with <3 and one
   very avoidable crash
```

A deliberately mediocre todo list, with a deliberate bug, that deliberately
ships its errors to a backend that deliberately deduplicates them. Everything
is deliberate. The end goal is an agent that fixes the bug on its own — today
it doesn't, today it just watches things break and takes very tidy notes.

## What this actually is

- `apps/web` — React + Vite. A Windows 95 / Geocities-flavored UI for
  writing down tasks you will (´｡• ᵕ •｡`) never (ﾉ´ з `)ﾉ do.
- `apps/api` — Fastify + SQLite. Stores the tasks and, more importantly,
  collects front-end errors (via the Sentry SDK, no real Sentry account
  involved) and deduplicates them by fingerprint.
- `.github/workflows/autofix.yml` — a stub that, for now, just prints the
  payload when a `repository_dispatch` shows up. Tomorrow that's where the
  agent that opens the fix PR will live. ♥

## Running it

```bash
pnpm install
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:3001

## The bug (spoiler alert, it's on purpose)

☠ Somewhere in the front-end there's a `.trim()` called on something that
can very much be `null`. We're not telling you where. Go hit "Sort by
urgency" with a couple of description-less tasks and enjoy the
`ErrorBoundary`. ♥ The error lands in the `error_events` table on the back
end, deduplicated by fingerprint, patiently waiting for a robot to fix it
someday so nobody has to read a stack trace on a Saturday night.

## Reporting to GitHub (optional)

Once an error is fingerprinted for the first time, `onNewError` will open a
GitHub issue and fire the `repository_dispatch` the workflow listens for —
but only if it knows where to send it. Copy `apps/api/.env.example` to
`apps/api/.env` and fill in `GITHUB_TOKEN` and `GITHUB_REPOSITORY`. Without
that file, everything above still works — GitHub reporting is just skipped
with a log line instead.

## Tests

```bash
pnpm test
```

All green. The bug, obviously, isn't covered — if it were, we wouldn't have
a demo. ☠♥
