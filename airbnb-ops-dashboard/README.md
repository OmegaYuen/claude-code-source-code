# Acelence Ops Board

One-page daily operations board for the Airbnb portfolio: today's check-outs and arrivals,
a colour-coded unit board, guest requests / cleaning issues that pop up for action, and a
team feed that replaces the WhatsApp updates.

Works as a web page and as an iPad home-screen app.

## Open it

**Shared board (recommended):** the published claude.ai link. Everyone who opens it sees the
same live state. A check-out marked by the attendance team, a "cleaning done" tapped by the
cleaning team, or a request sent by the manager appears on every open iPad within seconds.

**iPad app:** open the link in Safari → Share → *Add to Home Screen*. It launches full screen
with the Ops Board icon.

**Self-hosted:** serve this folder from any static host (GitHub Pages works). Without the
claude.ai database it runs in *This device only* mode, storing state in the browser and
starting from `data/seed.js`.

## What each team does

| Role | Taps | What happens |
|---|---|---|
| Attendance team | **Checked out** on a departure | Unit box turns red *Needs cleaning*, cleaning team feed gets the message |
| Attendance team | **Update arrival** on an arrival | New time/note saved, Airbnb team feed posts the change |
| Attendance team | **Guest arrived** | Unit box turns blue *Guest in*, Airbnb team feed posts "please attend" |
| Cleaning team | **Start cleaning** / **Cleaning done · unit ready** (tap a unit box) | Box turns purple, then green; Airbnb team is told the unit is ready and who arrives next |
| Cleaning team | **Report issue** (tap a unit box) | Issue joins the action list; can be sent straight to management |
| Manager | **→ Cleaning team** / **→ Management** on a request | Request marked *sent*, posted in that team's feed |
| Anyone | **Post** in the team feed | Free-text note to one or both teams |

Every feed message has **WhatsApp** (opens WhatsApp with the text pre-filled) and **Copy**
for anyone still outside the app.

The first time a device opens the board it asks who is using it (Manager, Attendance team,
Cleaning team). Feed messages are signed with that name. Change it from the role chip in
the header.

## Where the data comes from

| Data | Source today | How it gets in |
|---|---|---|
| Today's check-outs / check-ins | `today schedule/DDMMYY.xlsx` in Google Drive (Type, Unit Number, Listing Name, Guest, Date, Note) | ⋯ → *Import today's schedule*: paste the rows. Same confirmation code updates, never duplicates. |
| Guest requirements | Guest brief `.docx` / Airbnb messages / Hotmail | *+ Add* on the requests pane, or *+ Request* inside a reservation. Paste the guest's message. |
| Cleaning issues | Cleaning team, in the app or from the Airbnb cleaning chat | *Report issue* on the unit box |
| Unit list | `Listing Unit Map (1).xlsx` | Built into `index.html` (`UNIT_MAP`). Edit there when units are added. |
| Booking amount | Booking monitoring file (not wired yet) | *Edit* next to Booking in the reservation sheet. The header tile sums whatever is entered. |

The board is date-aware (Kuala Lumpur time). Reservations carry their own date, so tomorrow's
rows can be imported today and show up when the date rolls over. Cleaning states reset each day.

## Files

- `index.html` – the whole app (CSS + JS inline). Runs in *live* mode when `claude.use("db")`
  is available, otherwise in *local* mode.
- `data/seed.js` – local-mode demo data (today's real schedule as of 14 Sep 2026).
- `manifest.webmanifest`, `sw.js`, `icons/` – PWA install and offline shell for self-hosting.
- `tools/build-artifact.py` – strips the document skeleton and local seed to produce the
  fragment published on claude.ai.

## Shared database layout (live mode)

Collections: `reservations/<confirmation code>`, `requests/<id>`, `units/<unit code>`
(spaces become `_`), `feed/<id>`. The feed keeps the latest 200 messages on screen.

## Not yet wired (next steps)

- Automatic pull of the daily schedule file from Drive each morning.
- Hotmail / Airbnb message inbox → automatic request creation.
- Booking amounts from the booking monitoring file.
