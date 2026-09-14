# Acelence Ops Board — handoff notes

Status: research done, build not started. Continue in a session that can read iCloud Drive
(the booking monitoring file lives there).

## What was found in Google Drive (14 Sep 2026)
- `today schedule/140926.xlsx` — today's file. Columns: Type, Unit Number, Listing Name, Guest, Date, Note.
  5 CHECKOUT + 3 CHECK-IN rows, plus map-gap notes. No same-day turnovers today.
- `Listing Unit Map (1).xlsx` — Airbnb listing name -> unit code (43 distinct units across
  T1, T2, S, N, SH, Eaton, A buildings).
- `2026-09-13.docx` (guest requirements brief for today's arrivals): check-in time, transport,
  flight, door code, special requirements per guest.
- `Offline booking` Google Sheet — columns: Check in Date, Check out date, Unit Number,
  Check in Guest, Check in time, No. of guest, Price, Special Request.
- NOT found in Drive: the "booking monitoring" file (it is in iCloud). Booking amounts are
  therefore left `null` in `data/seed.js`.

## Intended design (agreed with the user)
One HTML app, works as a web page and as an iPad home-screen app (PWA).
- Today: check-outs and check-ins with "Checked out", "Update arrival time", "Guest arrived".
- Unit board: every unit as a box; turns green when cleaning team taps "Cleaning done".
- Requests: guest requirements pop up; one tap sends to Cleaning team or Management team feed.
- Team feed: every update posts automatically, so no WhatsApp typing is needed.
- Booking amount per unit imported from the booking monitoring file.
- Shared live state when published on claude.ai (artifact `db` capability); localStorage
  fallback with `data/seed.js` when self-hosted.

## Files so far
- `data/seed.js` — today's real schedule, requests and unit states as local demo seed.
