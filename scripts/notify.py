#!/usr/bin/env python3
"""Email the team (and the person who applied) when new form submissions arrive.

Uses only the Python standard library. Run it once, or keep it running with --every.

    python scripts/notify.py --dry-run          # print the emails, send nothing
    python scripts/notify.py                    # send once
    python scripts/notify.py --every 60         # check every 60 seconds

Environment variables (keep these OFF the website, never in public/):
    SUPABASE_URL, SUPABASE_SERVICE_KEY          service role key from Project Settings > API
    SMTP_HOST, SMTP_PORT (default 587), SMTP_USER, SMTP_PASS
    MAIL_FROM, ADMIN_EMAIL                      sender address and where team alerts go
"""
import argparse, json, os, smtplib, ssl, sys, time, urllib.parse, urllib.request
from datetime import datetime, timezone
from email.message import EmailMessage

# table -> (label, column holding the submitter's email, fields to list in the team alert)
TABLES = {
    "guest_applications": ("Guest application", "email",
        ["full_name", "company_name", "job_title", "email", "phone", "industry", "reason"]),
    "sponsorship_enquiries": ("Sponsorship enquiry", "email",
        ["company_name", "contact_name", "email", "partnership_type", "budget_range", "message"]),
    "contact_messages": ("Contact message", None, ["name", "email", "topic", "message"]),
    "contributions": ("Contribution pledge", "contributor_email",
        ["contributor_name", "contributor_email", "category", "amount", "currency", "status"]),
}
CONFIRM = {
    "guest_applications": "Thank you for applying to appear on The Redface Exchange. Our team will review your application and contact you by email.",
    "contributions": "Thank you for supporting The Redface Exchange. We have recorded your pledge and will be in touch about payment.",
}


def env(name, default=None, required=True):
    v = os.environ.get(name, default)
    if required and not v:
        sys.exit(f"Missing environment variable: {name}")
    return v


def rest(method, path, body=None):
    url = env("SUPABASE_URL").rstrip("/") + "/rest/v1/" + path
    key = env("SUPABASE_SERVICE_KEY")
    req = urllib.request.Request(url, method=method, data=None if body is None else json.dumps(body).encode(),
        headers={"apikey": key, "Authorization": "Bearer " + key, "Content-Type": "application/json", "Prefer": "return=minimal"})
    with urllib.request.urlopen(req, timeout=20) as r:
        raw = r.read()
        return json.loads(raw) if raw else None


def build_messages(table, row):
    label, email_col, fields = TABLES[table]
    lines = [f"{f}: {row.get(f) or ''}" for f in fields]
    team = EmailMessage()
    team["Subject"] = f"New {label.lower()}: " + str(row.get(fields[0]) or row.get("email") or "")
    team.set_content(f"A new {label.lower()} arrived.\n\n" + "\n".join(lines) + "\n\nOpen the admin dashboard to review it.")
    out = [(team, env("ADMIN_EMAIL", required=False))]
    to = row.get(email_col) if email_col else None
    if to and table in CONFIRM:
        c = EmailMessage()
        c["Subject"] = "We received your submission"
        c.set_content(CONFIRM[table] + "\n\nThe Redface Exchange")
        out.append((c, to))
    return out


def send(msgs, dry):
    if dry:
        for m, to in msgs:
            print(f"--- would send to {to}\nSubject: {m['Subject']}\n{m.get_content()}")
        return
    host, port = env("SMTP_HOST"), int(env("SMTP_PORT", "587", required=False))
    with smtplib.SMTP(host, port, timeout=30) as s:
        s.starttls(context=ssl.create_default_context())
        s.login(env("SMTP_USER"), env("SMTP_PASS"))
        for m, to in msgs:
            if not to:
                continue
            m["From"], m["To"] = env("MAIL_FROM"), to
            s.send_message(m)


def run_once(dry):
    sent = 0
    for table in TABLES:
        for row in rest("GET", f"{table}?notified_at=is.null&select=*&order=created_at.asc&limit=50") or []:
            send(build_messages(table, row), dry)
            if not dry:
                rest("PATCH", f"{table}?id=eq.{urllib.parse.quote(row['id'])}", {"notified_at": datetime.now(timezone.utc).isoformat()})
            sent += 1
    return sent


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="print emails instead of sending")
    ap.add_argument("--every", type=int, help="repeat every N seconds")
    a = ap.parse_args()
    while True:
        print(f"Processed {run_once(a.dry_run)} new submission(s)")
        if not a.every:
            break
        time.sleep(a.every)
