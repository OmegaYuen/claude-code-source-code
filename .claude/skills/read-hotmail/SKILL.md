---
name: read-hotmail
description: Read new Airbnb emails from the Hotmail account (via Apple Mail on this Mac) and turn guest requests, arrival-time changes and reservation changes into items on the Acelence Ops Board. Run on the Mac mini, usually inside "/ops-loop". One pass per invocation; safe to repeat.
---

# Read Hotmail → Ops Board

Airbnb sends every guest message, special request, trip change and arrival update to the
Hotmail inbox. This pass reads the new ones and puts them on the board so they pop up on the
iPad.

Board: **https://claude.ai/code/artifact/9feafc59-d285-40b9-ab4f-d81f9847833b**

## 1. What has already been handled

`Artifact read_db` → `db_op: "get"`, `collection: "meta"`, `doc_id: "mail"`.
It holds `{"processed": ["<mail id>", …], "lastRun": "<ISO>"}`. Missing document = nothing
processed yet. Keep `if_version` from this read for the write at the end.

## 2. Fetch new mail

From the repo root:

```bash
python3 airbnb-ops-dashboard/dispatcher/fetch_mail.py --hours 6
```

(`--account "<name>"` if Apple Mail has several accounts; the error message lists them.)
Skip any message whose `id` is in `processed`. If nothing is left, write `lastRun` into
`meta/mail` and stop with a one-line "no new mail".

## 3. Classify each new email

Read subject and body. Decide one of:

| Email | Action on the board |
|---|---|
| Guest message asking for something (cot, early/late check-in, parking, extra towels, complaint such as ants, aircon, wifi) | Create a **request** |
| Guest gives or changes an arrival time / flight / "landing at" / "arriving around" | **Update the reservation's ETA** and queue an arrival update for the Airbnb team |
| Reservation change, trip change, cancellation, date change, guest count change | Create a **request** with priority `high` so it pops up |
| New booking confirmation for today or tomorrow that is not on the board | Create a **request** "New booking – add to schedule" |
| Reviews, payouts, marketing, newsletters, "your listing performance", tax | Ignore, but still mark processed |

Identify the unit: find the listing name in the email (it is usually near the top or in the
subject) and look it up in `airbnb-ops-dashboard/dispatcher/listing_unit_map.json`. Match
loosely (case-insensitive, ignore punctuation and a leading "[New!]"). If no match, use
`"UNMAPPED"` and put the listing name in the request text.

Identify the reservation: the confirmation code looks like `HM` + 8 letters/digits. Read the
board's `reservations` collection (`db_op: "list"`) once per pass if you need to match by guest
name or unit.

## 4. Write to the board

**Request** → `Artifact write_db`, `db_op: "set"`, `collection: "requests"`, `doc_id: "mail-<mail id>"`:

```json
{"id": "mail-<mail id>", "guest": "<guest first + last name>", "unit": "<unit code or UNMAPPED>",
 "resId": "<confirmation code or null>", "text": "<one or two sentences, the guest's actual ask, plus listing name if unmapped>",
 "source": "Hotmail", "receivedAt": "<email date ISO>", "priority": "normal|high",
 "status": "new", "assignedTo": null, "kind": "request", "emailSubject": "<subject>"}
```

Using the mail id in `doc_id` makes re-runs idempotent.

**Arrival update** → find the reservation (`reservations/<confirmation code>`; read it to get
`if_version`), then `db_op: "update"` with `{"eta": "<time as the guest wrote it, e.g. 3:15 PM>",
"etaNote": "<flight / transport detail from the email>"}`, and queue the WhatsApp message by
`db_op: "set"` on `collection: "feed"`, `doc_id: "m-mail-<mail id>"`:

```json
{"id": "m-mail-<mail id>", "ts": "<now ISO>", "date": "<today YYYY-MM-DD, Asia/Kuala_Lumpur>",
 "kind": "eta", "channel": "team", "unit": "<unit>",
 "title": "ARRIVAL UPDATE · <unit>", "body": "<guest> now expected <time>. <detail>",
 "text": "ARRIVAL UPDATE · <unit> — <guest> now expected <time>", "by": "Hotmail reader", "wa": null}
```

The WhatsApp sender picks it up from there.

## 5. Record progress

`db_op: "set"` on `meta/mail` with `processed` = previous list plus the ids handled this pass
(keep only the newest 500) and `lastRun` = now. Use the `if_version` from step 1.

## 6. Finish

One line: how many emails read, how many requests created, how many arrival updates, how many
ignored. Never quote door codes or guest phone numbers in that line.

## Rules

- Read only. Never reply to, move, delete or mark emails.
- Never invent a request. If an email is ambiguous, create a request quoting the guest's own
  words so the manager decides.
- One request per email. Do not create a second request for an email whose id is already in
  `processed` or whose `requests/mail-<id>` document exists.
