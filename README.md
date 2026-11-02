# Vloxx Mechanics Check

Source repository: https://github.com/Narokath/vloxx-trivia . GitHub rejected Pages from a private repository on the account's current plan, so the user explicitly authorized making this repository public and publishing through GitHub Pages. No ChatGPT Sites deployment is authorized.

The Pages workflow runs the quiz checks, then uploads only `dist/`. Tests, documentation and repository history are not included in the website artifact, but are visible in the public repository. Visitors can inspect the delivered HTML, CSS, JavaScript and question data.

The **Publish Vloxx trivia** workflow deploys pushes to `main` automatically and can also be run manually from the Actions tab. Pages uses GitHub Actions as its publishing source.

Double-click `../Start-Trivia.cmd`, then open http://127.0.0.1:4173. Keep the terminal window open while playing; press Ctrl+C to stop. Alternatively, run `node server.js` from this folder. Run `node --test test/engine.test.js` for quiz-engine checks. The game is in `dist/` and needs no build or dependencies. The server listens only on `127.0.0.1`, not your network interfaces. Fonts and images load locally; guide links only open an external website when clicked.

100 authored questions; 15 unique questions per round, three per category. Question and choice order are shuffled and persisted at start. Every answer is final, saved before revealing feedback, and explained with a guide link. Correct answers use the original Pleasure/Pain emote; incorrect answers show a newly generated Gigachad-style Vloxx emote beside the correct choice.

The one-hour cooldown begins at attempt creation, using localStorage. Incomplete rounds can resume after refreshing. Completed scores and answer review persist. A new attempt becomes available after the hour, including when an old attempt is incomplete. Cross-tab mutations use Web Locks; HTTPS or localhost and a modern browser are required. Storage failures prevent new attempts/answers instead of silently dropping progress.

Question-bank revisions replace rounds saved under previous supported banks with fresh questions, preserving the original start time and hourly unlock time. Old answers are never applied to revised questions or choices. The previous saved attempt is backed up locally under `vloxx-mechanics-attempt-v1:previous-bank`, and an update banner explains the restart.

All 100 questions use plausible distractors from the same mechanic or context: reordered P2 abilities, nearby timings, different count conventions, or competing targeting rules. Distractors must remain unambiguously wrong for the stated question; making the quiz harder must not introduce squad-specific strategies or multiple valid answers.

This is a browser-local assessment, not an authenticated qualification system. Clearing site storage, private windows, another device/browser, editing storage or changing the local clock can bypass the limit. Questions/answers are visible in client code. Share links carry names and score breakdowns in a validated URL fragment, but remain editable and self-reported. They show aggregate results, not a completed attempt’s individual questions. A localhost score link only works on a computer running its own local copy on the same port; it is not an Internet-hosted result. Genuine cooldown enforcement and verified links require backend identities and signed or stored results.

Content source: the user's local Vloxx guide (`LK_VLOXX/review-source-text.txt` and current `github-review/guide-body.html`), with log checks through 19 October 2026; https://narokath.github.io/vloxx-guide/ . Questions cover encounter mechanics only, including targeting, soak requirements, attack behaviour and CM/LCM differences. Squad-specific assignments, formations, baiting plans and movement routes are excluded. Timing observations are described as approximate/measured, not guaranteed cooldowns. Review after encounter patches.

Assets: `pleasure-pain.png` copied from the user's original Downloads image. `gigachad.png` is a new transparent emote generated from that reference, not a recovery of the old GIF. Fonts use local system fallbacks; no external font request is made.
