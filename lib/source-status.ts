import type { Argument } from '@/lib/types';

// Source records whose citation could not be checked against a published work
// carry publicationType "unverified" instead of invented authors, DOI or journal.
export function isUnverifiedSource(source?: Argument['sourceMetadata']): boolean {
  return source?.publicationType === 'unverified';
}
