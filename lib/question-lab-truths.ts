/**
 * Hidden truth for each scenario. SERVER ONLY: import this from API routes and tests,
 * never from a client component or from question-lab-briefs.ts. A test enforces this.
 * The model reveals these facts only in response to earned questions.
 */

export const TRUTHS: Readonly<Record<string, string>> = {
  'supply-chain':
    'Cause: the only supplier of a specific casing part moved production to a new plant on March 3 and the new plant failed its quality audit. Timeline: the audit failure was reported March 10, stock ran out March 17, and late orders began March 19. Owners: procurement owns the supplier contract, and the planning team was never told about the audit. Dependencies: only two product lines use this casing, and a backup supplier exists but needs a 3 week lead time to qualify.',
  'legal-discovery':
    'Cause: an automatic mailbox retention rule deleted emails older than 365 days for the sales group. Timeline: the rule was enabled in January of last year, and the legal hold notice was issued in August, after the earliest emails were already purged. Owners: IT owns the retention policy and legal owns hold notices, and neither group had a handoff step. Dependencies: nightly backups kept for 90 days could hold part of the data, and one executive archived mail locally.',
  'hospital-workflow':
    'Cause: discharge medication orders wait for a single pharmacist who verifies them in batches at 11:00 and 15:00. Timeline: the batch schedule began after a staffing cut in the spring, and delays grew from then. Owners: pharmacy owns the verification schedule and the ward nurses own discharge paperwork. Dependencies: transport and bed cleaning start only after the medication step, so one late batch delays about six beds.',
  'web-outage':
    'Cause: a marketing email drove a traffic spike at 14:05 while a database migration held a table lock on the orders table. Timeline: the migration began at 14:00, the lock lasted 22 minutes, and checkout errors peaked at 14:20. Owners: the data team owns migrations and marketing owns campaign sends, with no shared calendar. Dependencies: the payment provider is healthy, and the checkout service retries failed writes, which made the queue worse.',
  'account-takeover':
    'Cause: credentials leaked in an unrelated breach were reused on this site, and the login endpoint had no rate limit or breach check. Timeline: the leaked list circulated in early May, the first fraudulent login was May 9, and attacks ran in bursts overnight. Owners: the security team owns login protections and support owns customer notices, and support had already seen the pattern twice. Dependencies: accounts with saved payment methods were targeted first, and only accounts without two step sign in were affected.',
};
