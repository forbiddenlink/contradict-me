import * as fs from 'fs';
import * as path from 'path';
import { toIndexRecord } from '@/lib/argument-index';

describe('toIndexRecord', () => {
  it('derives a stable objectID from the file name', () => {
    expect(toIndexRecord('gun-control-safety.json', {}).objectID).toBe('gun-control-safety');
  });

  it('keeps an objectID the file already has', () => {
    expect(toIndexRecord('remote-work-innovation.json', { objectID: 'arg_1' }).objectID).toBe(
      'arg_1'
    );
  });

  it('gives every argument file a unique objectID', () => {
    const dir = path.join(process.cwd(), 'data', 'arguments');
    const ids = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => toIndexRecord(f, JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'))).objectID);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
