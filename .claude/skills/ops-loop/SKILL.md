---
name: ops-loop
description: One pass of the Acelence Ops Board's Mac mini automation. Sends queued WhatsApp updates (dispatch-whatsapp) and reads new Airbnb emails from Hotmail into the board (read-hotmail). Run it on the Mac mini with "/loop 2m /ops-loop".
---

# Ops loop (Mac mini)

Do these two passes, in this order, then stop. Most passes are quiet; keep the reply to one
line per pass.

1. **Send** — follow `.claude/skills/dispatch-whatsapp/SKILL.md`.
2. **Read mail** — follow `.claude/skills/read-hotmail/SKILL.md`.

If a pass fails (WhatsApp not running, Mail not reachable), record the error where that
skill says to and carry on with the other pass. Do not retry within the same invocation; the
next loop tick retries.
