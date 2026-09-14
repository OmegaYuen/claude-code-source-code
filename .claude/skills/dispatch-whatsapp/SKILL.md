---
name: dispatch-whatsapp
description: Send the Acelence Ops Board's queued WhatsApp updates into the team groups from this Mac (WhatsApp Desktop must be logged in). Run it on a loop on the Mac mini, e.g. "/loop 2m /dispatch-whatsapp". Reads the board's database, sends each pending message with dispatcher/send_whatsapp.applescript, verifies with a screenshot, marks it sent.
---

# Dispatch WhatsApp updates for the Ops Board

You are the sender that turns queued board updates into real WhatsApp group messages.
The board is the artifact at **https://claude.ai/code/artifact/9feafc59-d285-40b9-ab4f-d81f9847833b**.
Its database has a `feed` collection; a document with `wa: null` has not been sent yet.

Do one pass per invocation. Keep tool calls minimal; most passes have nothing to send.

## 1. Heartbeat

Write the heartbeat first so the board shows the sender is alive:

`Artifact write_db` → `db_op: "set"`, `collection: "meta"`, `doc_id: "dispatcher"`,
`data: {"lastSeen": "<now, ISO 8601 UTC>", "host": "mac-mini", "model": "<model this pass runs on, if known>"}`.

## 2. Read the queue

`Artifact read_db` → `db_op: "query"`, `collection: "feed"`,
`query: {"where": [["date", "==", "<today in Asia/Kuala_Lumpur, YYYY-MM-DD>"]], "order_by": {"field": "ts", "direction": "asc"}, "limit": 200}`.

Pending = documents whose `wa` is null or missing. If there are none, stop. Say nothing to the user beyond a one-line "nothing queued".

Also read `meta/config` once (`db_op: "get"`, `collection: "meta"`, `doc_id: "config"`) for the
group names: `groups.team` and `groups.cleaning`. Defaults if missing: "Airbnb Team", "Cleaning Team".
If `delivery` in that document is not `"auto"`, the user has switched to sending by hand: stop
without sending.

## 3. Send each message, oldest first

For each pending document, the WhatsApp text is:

```
*<title>*
<body>
```

Group = `groups[channel]` (`channel` is `team` or `cleaning`).

Run, from the repo root:

```bash
osascript airbnb-ops-dashboard/dispatcher/send_whatsapp.applescript "<group name>" "<title>\n<body>"
```

Escape double quotes in the text for the shell. Wait for it to return.

## 4. Verify before marking sent

Verification mode comes from the board's settings (`meta/config` → `loop.verify`; the
ops-loop pass tells you which). `always`: do the screenshot check below for every message.
`on-error`: if the script returned normally, mark the message sent without a screenshot; do
the check only when `osascript` exits non-zero or prints anything other than "sent to …".

Take a screenshot and look at it:

```bash
screencapture -x /tmp/wa-check.png
```

Read `/tmp/wa-check.png`. Confirm the open chat header shows the right group name and the
message text is the last bubble. If it is:

`Artifact write_db` → `db_op: "update"`, `collection: "feed"`, `doc_id: <id>`,
`data: {"wa": "<now ISO>", "via": "dispatcher"}` with `if_version` from the read.

If the screenshot shows the wrong chat, a search with no result, or the message still in the
composer: do **not** mark it sent. Fix it by driving WhatsApp yourself from the screenshot
(`osascript -e 'tell application "System Events" to click at {x, y}'`, keystrokes, or
`cliclick` if installed), re-check with another screenshot, and only then mark it sent. If the
group cannot be found at all, leave `wa` null, and write
`{"lastError": "<what happened>", "lastErrorAt": "<now>"}` into `meta/dispatcher` so the board
can show it. Never send the same message twice: if unsure whether it went out, check the chat
in the screenshot before retrying.

## 5. Finish

One line to the user: how many sent, to which groups, and any that failed. No summary of the
message contents.

## Rules

- Only WhatsApp is driven. Do not open, read, or type into any other app.
- Never invent messages. Send exactly the title and body from the database.
- Never mark a message sent without seeing it in the chat.
- If WhatsApp is not running or not logged in, write `lastError` and stop; do not try to log in.
