import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'data', 'arguments');
const files = readdirSync(DIR).filter((f) => f.endsWith('.json'));

// Authors that appeared in source records but could not be matched to a real
// publication. They must not come back without a verified citation.
const REMOVED_AUTHORS = [
  'Dr. Sarah Chen',
  'Dr. Michael Park',
  'Dr. James Okoro',
  'Dr. Sarah Martinez',
  'Prof. Wei Chen',
  'Prof. Randall Field',
  'Dr. Lisa Berkman',
  'Dr. Michael Chen',
  'Dr. Amanda Rodriguez',
  'Dr. Ambika Satija',
  'Dr. Marshall Steinbaum',
  'Dr. Michael Stynes',
  'Dr. Anthony Carnevale',
];

const DOI_PATTERN = /^10\.\d{4,9}\/\S+$/;

// No network: this checks DOI shape and removed authors only. A shape match does
// not prove the DOI resolves; that was checked against Crossref when the records
// were audited.
describe('argument source records', () => {
  it('finds the argument files', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s has a well-formed DOI or none', (file) => {
    const data = JSON.parse(readFileSync(join(DIR, file), 'utf8'));
    const doi = data.sourceMetadata?.doi;
    if (doi !== undefined) {
      expect(doi).toMatch(DOI_PATTERN);
    }
    for (const c of data.citations ?? []) {
      const m = /doi\.org\/(.+)$/.exec(c.url ?? '');
      if (m) expect(m[1]).toMatch(DOI_PATTERN);
    }
  });

  it.each(files)('%s carries no removed fabricated authors', (file) => {
    const raw = readFileSync(join(DIR, file), 'utf8');
    for (const author of REMOVED_AUTHORS) {
      expect(raw).not.toContain(author);
    }
  });

  it.each(files)('%s does not claim peer review without a named source', (file) => {
    const data = JSON.parse(readFileSync(join(DIR, file), 'utf8'));
    const sm = data.sourceMetadata;
    if (sm?.publicationType === 'peer-reviewed') {
      expect(sm.doi).toBeTruthy();
      expect(sm.authors.length).toBeGreaterThan(0);
    }
    if (sm?.publicationType === 'unverified') {
      expect(sm.authors).toEqual([]);
      expect(sm.doi).toBeUndefined();
      expect(sm.citationCount).toBeUndefined();
    }
  });
});
