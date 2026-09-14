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

## Run it

In this repo on the Mac mini:

```
claude
/loop 2m /dispatch-whatsapp
```

Leave that terminal open. Every two minutes the skill checks the queue. A quiet pass costs one
small tool call.

To stop: `/loop stop` or close the session. The board falls back to tap delivery
automatically once the heartbeat goes stale.

## Delivery modes (board ⋯ → WhatsApp groups)

- **Automatic** — the Mac mini sender posts every update. Default.
- **Tap** — each update opens WhatsApp on the device with the message pre-filled.
- **Batch** — updates collect behind the header buttons and go out per group in one message.

Switching to Tap or Batch tells the sender to stand down (it reads the mode from the database).
