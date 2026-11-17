import {
  MAX_TURNS,
  MAX_MATERIAL_CHARS,
  applyAssessment,
  buildCoachPrompt,
  initialState,
  masteryPercent,
  parseCoachReply,
  redactPii,
  sanitizeState,
} from '@/lib/socratic-coach';

describe('socratic-coach state', () => {
  it('starts empty at the chosen level', () => {
    expect(initialState('some foundation')).toEqual({
      level: 'some foundation',
      turn: 0,
      shallow_streak: 0,
      covered: [],
      mastery: {},
    });
  });

  it('counts shallow answers in a row and resets on a good one', () => {
    let s = initialState('complete beginner');
    s = applyAssessment(s, { quality: 'shallow', concept: 'a' });
    s = applyAssessment(s, { quality: 'shallow', concept: 'a' });
    expect(s.shallow_streak).toBe(2);
    expect(s.turn).toBe(2);
    s = applyAssessment(s, { quality: 'adequate', concept: 'a' });
    expect(s.shallow_streak).toBe(0);
    expect(s.mastery.a).toBe(1);
    expect(s.covered).toEqual(['a']);
  });

  it('caps mastery at 3 and adds more for strong answers', () => {
    let s = initialState('advanced');
    s = applyAssessment(s, { quality: 'strong', concept: 'x' });
    expect(s.mastery.x).toBe(2);
    s = applyAssessment(s, { quality: 'strong', concept: 'x' });
    expect(s.mastery.x).toBe(3);
  });

  it('computes progress from mastery only', () => {
    const s = { ...initialState('advanced'), mastery: { a: 3, b: 0 } };
    expect(masteryPercent(s)).toBe(50);
    expect(masteryPercent(initialState('advanced'))).toBe(0);
  });

  it('rejects malformed client state and clamps values', () => {
    expect(sanitizeState(null)).toBeNull();
    expect(sanitizeState({ level: 'wizard' })).toBeNull();
    const s = sanitizeState({
      level: 'advanced',
      turn: 4.7,
      shallow_streak: -2,
      covered: ['a', 5, 'b'],
      mastery: { a: 9, b: 'x', c: 2 },
    });
    expect(s).toEqual({
      level: 'advanced',
      turn: 4,
      shallow_streak: 0,
      covered: ['a', 'b'],
      mastery: { a: 3, c: 2 },
    });
  });

  it('exposes sane caps', () => {
    expect(MAX_TURNS).toBeGreaterThan(5);
    expect(MAX_MATERIAL_CHARS).toBeGreaterThan(1000);
  });
});

describe('parseCoachReply', () => {
  it('reads a JSON reply', () => {
    const r = parseCoachReply('{"reply":"Why?","quality":"strong","concept":"cells"}');
    expect(r).toEqual({ reply: 'Why?', quality: 'strong', concept: 'cells' });
  });
  it('finds JSON inside fences or prose', () => {
    const r = parseCoachReply('```json\n{"reply":"Why?","quality":"shallow","concept":"c"}\n```');
    expect(r.quality).toBe('shallow');
  });
  it('falls back to plain text as an adequate answer', () => {
    const r = parseCoachReply('Just a question?');
    expect(r).toEqual({ reply: 'Just a question?', quality: 'adequate', concept: '' });
  });
  it('treats an unknown quality as adequate', () => {
    expect(parseCoachReply('{"reply":"Q","quality":"wow","concept":"c"}').quality).toBe('adequate');
  });
});

describe('redactPii', () => {
  it('removes emails and phone numbers', () => {
    const out = redactPii('mail me at a.b@example.com or call +1 (555) 123-4567 ok');
    expect(out).not.toMatch(/example\.com/);
    expect(out).not.toMatch(/555/);
    expect(out).toContain('[removed]');
  });
});

describe('buildCoachPrompt', () => {
  const state = { ...initialState('some foundation'), turn: 3 };
  it('includes the material, level and the one-question rule', () => {
    const p = buildCoachPrompt({ material: 'Photosynthesis makes sugar.', state, explain: false });
    expect(p).toContain('Photosynthesis makes sugar.');
    expect(p).toContain('some foundation');
    expect(p).toMatch(/exactly one question/i);
    expect(p).toMatch(/never say "wrong"/i);
  });
  it('adds the kind redirect after three shallow answers', () => {
    const p = buildCoachPrompt({
      material: 'm',
      state: { ...state, shallow_streak: 3 },
      explain: false,
    });
    expect(p).toMatch(/avoiding deeper thinking/i);
  });
  it('switches to a direct explanation on request', () => {
    const p = buildCoachPrompt({ material: 'm', state, explain: true });
    expect(p).toMatch(/explain directly/i);
    expect(p).not.toMatch(/exactly one question/i);
  });
  it('contains no em dash', () => {
    expect(buildCoachPrompt({ material: 'm', state, explain: false })).not.toContain(String.fromCharCode(8212));
  });
});
