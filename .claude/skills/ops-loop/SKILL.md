---
name: ops-loop
description: One pass of the Acelence Ops Board's Mac mini automation, paced and staffed by the settings saved in the board (AI model, check interval, active hours). Sends queued WhatsApp updates and reads new Airbnb emails from Hotmail. Run it on the Mac mini with "/loop /ops-loop" (no interval; the pass schedules its own next wake).
---

# Ops loop (Mac mini)

The board's settings decide how this loop runs. Read them, do the work on the chosen model,
schedule the next wake, stop. Keep your own turn tiny: the work happens in the subagent.

## 1. Read the settings (one call)

`Artifact read_db` → `db_op: "get"`, `collection: "meta"`, `doc_id: "config"` on
https://claude.ai/code/artifact/9feafc59-d285-40b9-ab4f-d81f9847833b

Fields, with defaults if missing:

| Field | Default | Meaning |
|---|---|---|
| `loop.model` | `sonnet` | model for the work: `sonnet`, `opus` or `haiku` |
| `loop.intervalMin` | `5` | minutes between passes |
| `loop.activeFrom` / `loop.activeTo` | `08:00` / `23:30` | active window, Asia/Kuala_Lumpur |
| `loop.verify` | `always` | `always` = screenshot-check every WhatsApp send; `on-error` = only when the script fails |
| `delivery` | `auto` | if not `auto`, do not send WhatsApp (the manager is sending by hand); still read mail |

## 2. Outside active hours

If the current Kuala Lumpur time is outside the window: do nothing, and schedule the next wake
for the earlier of `activeFrom` and 60 minutes from now (`ScheduleWakeup`, `noop: true`,
`prompt: "/ops-loop"`, reason "outside active hours"). Stop.

## 3. Inside active hours: delegate the pass

Launch ONE subagent with the `Agent` tool, `subagent_type: "general-purpose"`,
`model: <loop.model>`, `run_in_background: false`, and this prompt (fill the placeholders):

> You are one pass of the Acelence Ops Board automation on this Mac. Settings: delivery=<delivery>, verify=<verify>.
> 1. If delivery is "auto", follow `.claude/skills/dispatch-whatsapp/SKILL.md` exactly (verify mode: <verify>).
> 2. Then follow `.claude/skills/read-hotmail/SKILL.md` exactly.
> When writing the `meta/dispatcher` heartbeat, include `"model": "<loop.model>"`.
> If one step fails, record the error where that skill says and still do the other step. Do not retry within this pass.
> Reply with one line per step: what was sent or read, or "nothing".

Relay the subagent's two lines to the user, nothing more.

## 4. Schedule the next pass

`ScheduleWakeup` with `delaySeconds: intervalMin × 60`, `prompt: "/ops-loop"`,
`noop: true` if both steps reported nothing, else `noop: false`, reason "next ops pass".

## Rules

- Never change the model, interval or hours yourself; only the board's settings do.
- One subagent per pass. Never launch it twice, even if it errors.
- If the settings read fails, use the defaults for this pass and try again next time.
