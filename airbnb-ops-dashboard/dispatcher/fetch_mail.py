#!/usr/bin/env python3
"""Pull recent Airbnb emails from the Hotmail account via Apple Mail on this Mac.

Outlook.com / Hotmail no longer allows plain IMAP passwords, so instead of handling
credentials here we let Apple Mail keep the account signed in and read the messages from it
with JavaScript for Automation. Nothing is modified in the mailbox.

    python3 fetch_mail.py                       # Airbnb mail from the last 24 h, JSON on stdout
    python3 fetch_mail.py --hours 6 --account "Hotmail"
    python3 fetch_mail.py --all-senders --hours 2

Output: a JSON list, newest first:
    [{"id": "12345", "date": "2026-09-14T03:12:00Z", "from": "automated@airbnb.com",
      "subject": "New message from Vincent", "body": "…first 6000 chars of plain text…"}]

Requires: macOS, Apple Mail with the Hotmail account added (Mail handles the Microsoft
sign-in), and Automation permission for the terminal app to control Mail (macOS asks once).
"""
import argparse, json, subprocess, sys

JXA = r"""
function run(argv) {
  const [acctName, mailboxName, hours, senderFilter, maxChars] = argv;
  const Mail = Application("Mail");
  const since = new Date(Date.now() - Number(hours) * 3600 * 1000);
  let accounts = Mail.accounts();
  if (acctName) accounts = accounts.filter(a => a.name() === acctName);
  if (!accounts.length) throw new Error("Mail account not found: " + acctName + ". Accounts: " + Mail.accounts().map(a => a.name()).join(", "));
  const out = [];
  for (const acct of accounts) {
    let boxes = acct.mailboxes();
    boxes = boxes.filter(b => b.name().toUpperCase() === mailboxName.toUpperCase());
    for (const box of boxes) {
      const msgs = box.messages.whose({dateReceived: {_greaterThan: since}})();
      for (const m of msgs) {
        let sender = "";
        try { sender = m.sender(); } catch (e) {}
        if (senderFilter && !sender.toLowerCase().includes(senderFilter.toLowerCase())) continue;
        let body = "";
        try { body = m.content(); } catch (e) {}
        body = (body || "").replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
        out.push({
          id: String(m.id()),
          date: m.dateReceived().toISOString(),
          from: sender,
          subject: m.subject(),
          read: m.readStatus(),
          body: body.slice(0, Number(maxChars))
        });
      }
    }
  }
  out.sort((a, b) => b.date.localeCompare(a.date));
  return JSON.stringify(out);
}
"""

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--account", default="", help="Apple Mail account name (default: all accounts)")
    ap.add_argument("--mailbox", default="INBOX")
    ap.add_argument("--hours", type=float, default=24)
    ap.add_argument("--sender", default="airbnb", help="substring the sender must contain (default: airbnb)")
    ap.add_argument("--all-senders", action="store_true")
    ap.add_argument("--max-chars", type=int, default=6000)
    a = ap.parse_args()
    if sys.platform != "darwin":
        sys.exit("fetch_mail.py must run on the Mac that has Apple Mail signed in to the Hotmail account.")
    sender = "" if a.all_senders else a.sender
    r = subprocess.run(["osascript", "-l", "JavaScript", "-e", JXA, "--", a.account, a.mailbox, str(a.hours), sender, str(a.max_chars)],
                       capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit("Mail read failed: " + r.stderr.strip())
    data = json.loads(r.stdout.strip() or "[]")
    json.dump(data, sys.stdout, ensure_ascii=False, indent=1)
    print()

if __name__ == "__main__":
    main()
