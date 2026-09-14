# Mac mini WhatsApp sender

Makes delivery fully automatic: you tap "Checked out" on the iPad, and the Mac mini posts the
message into the WhatsApp group. No tap in WhatsApp.

## How it works

1. The board writes every update into its database as a `feed` document with `wa: null`.
2. A Claude Code session on the Mac mini runs the `dispatch-whatsapp` skill on a loop.
   Each pass: writes a heartbeat, reads the queue, drives WhatsApp Desktop with
   `send_whatsapp.applescript`, takes a screenshot to confirm the message landed in the right
   group, then marks the document `wa: <time>, via: "dispatcher"`.
3. The board shows the sender's status in the header: green *Mac mini sending · checked just now*,
   or amber if the heartbeat is older than 6 minutes. When the sender is not running, the tap
   buttons reappear so nothing is stuck.

## One-time setup on the Mac mini

1. Install WhatsApp from the Mac App Store, log in with the phone that is in both groups.
2. Make sure the two groups are named as in the board's settings (⋯ → WhatsApp groups),
   e.g. *Airbnb Team* and *Cleaning Team*. Exact names matter: the script searches by name.
3. Give Accessibility permission to the terminal app you run Claude Code from:
   System Settings → Privacy & Security → Accessibility → add Terminal (or iTerm).
   Also allow Screen Recording for the same app (needed for the verification screenshot).
4. Test the script by hand once:

   ```bash
   osascript airbnb-ops-dashboard/dispatcher/send_whatsapp.applescript "Cleaning Team" "*TEST*\nHello from the Ops Board."
   ```

   If WhatsApp opens the wrong chat, adjust the delays or the search shortcut at the top of the
   script (`⌘F` focuses chat search in the current Mac app; if a WhatsApp update changes it,
   change that one line).
5. Keep the Mac mini awake: System Settings → Energy → *Prevent automatic sleeping*.

## Hotmail reader (inbound)

The same loop also reads the Hotmail inbox and puts new Airbnb guest messages on the board.

- Guest asks for something (cot, early check-in, parking, "there are ants") → a request pops
  up on the board; one tap sends it to the cleaning team or management by WhatsApp.
- Guest gives or changes an arrival time → the reservation's expected time is updated on the
  board and an `ARRIVAL UPDATE` goes to the Airbnb team group.
- Trip changes, cancellations, guest-count changes → high-priority request.
- Reviews, payouts, marketing → ignored.

It reads through **Apple Mail**, because Outlook.com no longer accepts plain IMAP passwords
and Mail already handles the Microsoft sign-in.

Setup, once:

1. Apple Mail → Settings → Accounts → add the Hotmail account (Microsoft Exchange / Outlook).
   Let it sync the inbox.
2. First run of the reader triggers a macOS prompt "Terminal wants to control Mail" → Allow.
3. Test by hand:

   ```bash
   python3 airbnb-ops-dashboard/dispatcher/fetch_mail.py --hours 24 | head -40
   ```

   You should see the latest Airbnb emails as JSON. If the account name is ambiguous, pass
   `--account "Hotmail"` (the error lists the names Mail knows).

The reader never replies, moves, deletes or marks mail. It remembers which emails it has
handled in the board's database (`meta/mail`), so restarting it never creates duplicates.

## Run it

In this repo on the Mac mini:

```
claude
/loop /ops-loop
```

No interval on the command: each pass reads the board's settings and schedules its own next
wake. Leave that terminal open. (`/dispatch-whatsapp` and `/read-hotmail` also run on their
own for a one-off pass.)

## Credit use, and the settings that control it

Every pass is a Claude turn, so the settings under ⋯ → **Mac mini automation** on the board
are the cost controls. The loop reads them each pass; change them on the iPad, no need to
touch the Mac.

| Setting | Default | Effect |
|---|---|---|
| AI model for the loop | Claude Sonnet 5 | The pass runs in a subagent on this model. Sonnet handles sending and email reading well at a fraction of Opus's cost; Haiku is cheaper still and fine for sending, weaker at reading ambiguous emails. |
| Check every | 5 min | Longer interval = fewer turns. 5 min means a WhatsApp update lands within 5 minutes of your tap. |
| Active from / until | 08:00 – 23:30 | Outside the window the loop sleeps (one tiny wake per hour). |
| Screenshot check | Every message | *Only if the script reports a problem* skips the screenshot on normal sends, which is the costliest part of a busy pass. Switch to it once the sender has proven itself on your Mac. |

With the defaults that is roughly 190 passes a day, most of them a settings read, a couple of
small tool calls and a one-line reply.

To stop: `/loop stop` or close the session. The board falls back to tap delivery
automatically once the heartbeat goes stale.

## Delivery modes (board ⋯ → WhatsApp groups)

- **Automatic** — the Mac mini sender posts every update. Default.
- **Tap** — each update opens WhatsApp on the device with the message pre-filled.
- **Batch** — updates collect behind the header buttons and go out per group in one message.

Switching to Tap or Batch tells the sender to stand down (it reads the mode from the database).
