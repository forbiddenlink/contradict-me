/**
 * Player-facing scenario briefs. Safe to import from client code.
 * The matching hidden truths live in a separate server-only module.
 */

export interface ScenarioBrief {
  id: string;
  domain: string;
  title: string;
  brief: string;
}

export const BRIEFS: readonly ScenarioBrief[] = [
  {
    id: 'supply-chain',
    domain: 'Supply chain',
    title: 'The late shipments',
    brief:
      'A regional retailer says orders for one product line are arriving two weeks late. Customers are complaining. You have been asked to find out what is going on.',
  },
  {
    id: 'legal-discovery',
    domain: 'Legal discovery',
    title: 'The missing emails',
    brief:
      'A company received a document request and cannot produce a set of emails from last year. Opposing counsel is asking why. You have been asked to find out what happened.',
  },
  {
    id: 'hospital-workflow',
    domain: 'Hospital workflow',
    title: 'The discharge delays',
    brief:
      'A hospital ward reports that patients are waiting many hours after being cleared to go home. Beds are backing up. You have been asked to find out why.',
  },
  {
    id: 'web-outage',
    domain: 'Web outage',
    title: 'The slow checkout',
    brief:
      'An online store had a checkout slowdown yesterday afternoon. Some customers could not pay. You have been asked to find out what caused it.',
  },
  {
    id: 'account-takeover',
    domain: 'Account takeover',
    title: 'The hijacked accounts',
    brief:
      'Several customers report purchases they did not make. Their passwords were not obviously guessed. You have been asked to find out how their accounts were accessed.',
  },
];
