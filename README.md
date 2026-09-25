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
- `.github/workflows/autofix.yml` — runs Claude Code headlessly against the
  reported error, following `CLAUDE.md`, then opens the fix PR itself if
  (and only if) the tests actually pass. ♥

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

## Trying the full loop on your own fork

Want to see the agent actually open a PR, not just watch the app crash?
Everyone needs their own credentials for this — nothing here is shared with
the original repo, GitHub never copies secrets to forks.

1. **Fork this repo.**
2. **GitHub token for the local backend.** Create a [fine-grained personal
   access token](https://github.com/settings/personal-access-tokens/new)
   scoped to just your fork, with repository permissions **Issues: Read and
   write** and **Contents: Read and write** (the second one is what lets it
   fire `repository_dispatch`). Put it in `apps/api/.env` — see
   `apps/api/.env.example` — as `GITHUB_TOKEN`, with `GITHUB_REPOSITORY` set
   to `your-user/your-fork`.
3. **Anthropic API key for the agent.** Grab one from
   [console.anthropic.com](https://console.anthropic.com/settings/keys) —
   copy it the moment it's created, the dashboard only shows it once — and
   set it as a secret on **your fork** (not your `.env`, this one only the
   CI runner needs):
   ```bash
   gh secret set ANTHROPIC_API_KEY --repo your-user/your-fork
   ```
   Setting a spend limit for it on the Console is cheap insurance and takes
   30 seconds.
4. **The gotcha that will get you too:** GitHub disables "Allow GitHub
   Actions to create and approve pull requests" on every new repo by
   default. Without it, the workflow does everything right and then fails
   on the very last step. Flip it on: your fork's **Settings → Actions →
   General → Workflow permissions**, tick that box, Save.
5. `pnpm dev`, reproduce the bug (two-plus description-less tasks, then
   "Sort by urgency"), and watch an issue — and, a bit later, a PR — show up
   on your fork.

## Tests

```bash
pnpm test
```

All green. The bug, obviously, isn't covered — if it were, we wouldn't have
a demo. ☠♥
