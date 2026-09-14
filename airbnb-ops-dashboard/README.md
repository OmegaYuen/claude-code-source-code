# Acelence Ops Board

One-page daily operations board for the Airbnb portfolio: today's check-outs and arrivals,
a colour-coded unit board, guest requests / cleaning issues that pop up for action, and a
team feed that replaces the WhatsApp updates.

Works as a web page and as an iPad home-screen app.

## Open it

**Web:** the published claude.ai link. **iPad app:** open that link in Safari → Share →
*Add to Home Screen*. It launches full screen with the Ops Board icon.

**Self-hosted:** serve this folder from any static host (GitHub Pages works). Without the
claude.ai database it runs in *This device only* mode, storing state in the browser and
starting from `data/seed.js`.

## How the teams get notified

The teams do not use the app. Every update becomes a WhatsApp message to the right group.

| Tap in the app | WhatsApp message | Goes to |
|---|---|---|
| **Checked out** on a departure | `CHECKED OUT · T2-22-2` + guest, time, "free for cleaning", next arrival | Cleaning team chat |
| **Update arrival** on an arrival | `ARRIVAL UPDATE · T1-20-02` + new time and note | Airbnb team group |
| **Guest arrived** | `ARRIVED · T2-11-09` + guest, pax, time, "please attend" | Airbnb team group |
| **Cleaning done · unit ready** on a unit box | `UNIT READY · T2-22-2` + time and next guest | Airbnb team group |
| **Needs cleaning again** on a unit box | `CLEANING NEEDED · …` | Cleaning team chat |
| **WhatsApp → Cleaning Team / Airbnb Team** on a request or issue | `GUEST REQUEST · …` or `ISSUE · …` + the text | The group you chose |
| **Send** in the updates pane | `NOTE` + your text | The group you chose |

Three delivery modes (⋯ → WhatsApp groups):

- **Automatic (default).** The message is queued in the database and a Claude Code session on
  the Mac mini posts it into the WhatsApp group by driving WhatsApp Desktop. Zero taps. Setup
  and operation: [`dispatcher/README.md`](dispatcher/README.md). The header shows the sender's
  heartbeat; if it goes stale the tap buttons reappear so nothing is stuck.
- **Tap.** Each update opens WhatsApp on the device with the message pre-filled; you pick the
  group and send. On iPad this opens the WhatsApp app directly.
- **Batch.** Updates collect behind the two green header buttons and go out per group in one
  message.

Group names are editable so they match the real chat names; the Mac mini sender reads them
from the same place.

Cleaning team updates still come back through the Airbnb cleaning chat: when they say a unit
is done, tap the unit box → *Cleaning done · unit ready* and the box turns green.

## Where the data comes from

| Data | Source today | How it gets in |
|---|---|---|
| Today's check-outs / check-ins | `today schedule/DDMMYY.xlsx` in Google Drive (Type, Unit Number, Listing Name, Guest, Date, Note) | ⋯ → *Import today's schedule*: paste the rows. Same confirmation code updates, never duplicates. |
| Guest requirements, arrival-time changes | Airbnb emails in the Hotmail inbox | Read automatically by the Mac mini loop (`dispatcher/README.md`, Hotmail reader). New requests pop up on the board; ETA changes update the reservation and notify the Airbnb team. Manual fallback: *+ Add* on the requests pane. |
| Cleaning issues | Airbnb cleaning chat | *Report issue* on the unit box, then WhatsApp it to management |
| Unit list | `Listing Unit Map (1).xlsx` | Built into `index.html` (`UNIT_MAP`). Edit there when units are added. |
| Booking amount | Booking monitoring file (not wired yet) | *Edit* next to Booking in the reservation sheet. The header tile sums whatever is entered. |

The board is date-aware (Kuala Lumpur time). Reservations carry their own date, so tomorrow's
rows can be imported today and show up when the date rolls over. Cleaning states reset each day.

## Files

- `index.html` – the whole app (CSS + JS inline). Runs in *live* mode (state saved to the claude.ai
  database, so the same board shows on iPad and Mac) when `claude.use("db")` is available,
  otherwise in *local* mode.
- `data/seed.js` – local-mode demo data (today's real schedule as of 14 Sep 2026).
- `manifest.webmanifest`, `sw.js`, `icons/` – PWA install and offline shell for self-hosting.
- `dispatcher/` – AppleScript that posts into a WhatsApp group on the Mac, plus setup notes;
  the Claude Code skill that runs it lives at `.claude/skills/dispatch-whatsapp/SKILL.md`.
- `tools/build-artifact.py` – strips the document skeleton and local seed to produce the
  fragment published on claude.ai.

## Shared database layout (live mode)

Collections: `reservations/<confirmation code>`, `requests/<id>`, `units/<unit code>`
(spaces become `_`), `feed/<id>` (`wa` = time sent, `via` = tap | dispatcher), `meta/config`
(group names, delivery mode) and `meta/dispatcher` (sender heartbeat). The feed keeps the
latest 200 messages on screen.

## Not yet wired (next steps)

- Automatic pull of the daily schedule file from Drive each morning.
- Reading the WhatsApp cleaning chat so "unit done" and issues update the board by themselves.
- Booking amounts from the booking monitoring file.
