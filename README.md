# Vloxx Mechanics Check

Run `npm run dev` and open http://127.0.0.1:4173. Run `npm test` for quiz-engine checks. The deployable website is in `dist/` and needs no build or dependencies.

100 authored questions; 15 unique questions per round, three per category. Question and choice order are shuffled and persisted at start. Every answer is final, saved before revealing feedback, and explained with a guide link. Correct answers use the original Pleasure/Pain emote; incorrect answers show a newly generated Gigachad-style Vloxx emote beside the correct choice.

The one-hour cooldown begins at attempt creation, using localStorage. Incomplete rounds can resume after refreshing. Completed scores and answer review persist. A new attempt becomes available after the hour, including when an old attempt is incomplete. Cross-tab mutations use Web Locks; HTTPS or localhost and a modern browser are required. Storage failures prevent new attempts/answers instead of silently dropping progress.

This is a browser-local assessment, not an authenticated qualification system. Clearing site storage, private windows, another device/browser, editing storage or changing the local clock can bypass the limit. Questions/answers are visible in client code. Share links carry names and score breakdowns in a validated URL fragment, but remain editable and self-reported. They show aggregate results, not a completed attempt’s individual questions. Genuine cooldown enforcement and verified links require backend identities and signed or stored results.

Content source: the user's local Vloxx guide (`LK_VLOXX/review-source-text.txt` and current `github-review/guide-body.html`), with log checks through 19 October 2026; https://narokath.github.io/vloxx-guide/ . WRDL formations are explicitly labelled strategy rather than universal encounter rules. Timing observations are described as approximate/measured, not guaranteed cooldowns. Review with the raid lead after encounter patches.

Assets: `pleasure-pain.png` copied from the user's original Downloads image. `gigachad.png` is a new transparent emote generated from that reference, not a recovery of the old GIF. Fonts use Google Fonts with local fallbacks.
