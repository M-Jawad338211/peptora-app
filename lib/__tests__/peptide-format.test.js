import {
  fmt,
  matchesQuery,
  formatDoseRange,
  referenceHref,
  evidenceColor,
} from '../peptide-format'

describe('fmt', () => {
  test('kebab-case enum to title case', () => {
    expect(fmt('early-human')).toBe('Early Human')
    expect(fmt('growth-hormone')).toBe('Growth Hormone')
    expect(fmt('not-approved')).toBe('Not Approved')
  })
  test('empty input is safe', () => {
    expect(fmt(null)).toBe('')
    expect(fmt(undefined)).toBe('')
    expect(fmt('')).toBe('')
  })
})

describe('matchesQuery', () => {
  const peptide = {
    name: 'BPC-157',
    category: 'healing',
    aliases: ['Body Protection Compound', 'PL 14736'],
    tags: ['gut', 'tendon'],
  }

  test('empty query matches everything', () => {
    expect(matchesQuery(peptide, '')).toBe(true)
    expect(matchesQuery(peptide, '   ')).toBe(true)
  })
  test('matches on name, case-insensitively', () => {
    expect(matchesQuery(peptide, 'bpc')).toBe(true)
  })
  test('matches on category, alias and tag', () => {
    expect(matchesQuery(peptide, 'healing')).toBe(true)
    expect(matchesQuery(peptide, 'protection')).toBe(true)
    expect(matchesQuery(peptide, 'tendon')).toBe(true)
  })
  test('non-match returns false', () => {
    expect(matchesQuery(peptide, 'semaglutide')).toBe(false)
  })
  test('missing aliases/tags do not throw', () => {
    expect(matchesQuery({ name: 'X', category: 'other' }, 'x')).toBe(true)
  })
})

describe('formatDoseRange', () => {
  test('low and high render as a range', () => {
    expect(formatDoseRange({ low: 250, high: 500, unit: 'mcg' })).toBe('250–500 mcg')
  })
  test('equal bounds collapse to one value', () => {
    expect(formatDoseRange({ low: 250, high: 250, unit: 'mcg' })).toBe('250 mcg')
  })
  test('single bound renders alone', () => {
    expect(formatDoseRange({ low: 250, high: null, unit: 'mcg' })).toBe('250 mcg')
    expect(formatDoseRange({ low: null, high: 500, unit: 'mcg' })).toBe('500 mcg')
  })
  test('no bounds yields null', () => {
    expect(formatDoseRange({ low: null, high: null, unit: 'mcg' })).toBeNull()
  })
})

describe('referenceHref', () => {
  test('prefers explicit url', () => {
    expect(referenceHref({ url: 'https://x.test/a', doi: '10.1/b', pmid: '123' })).toBe(
      'https://x.test/a'
    )
  })
  test('falls back to doi, then pmid', () => {
    expect(referenceHref({ doi: '10.1/b', pmid: '123' })).toBe('https://doi.org/10.1/b')
    expect(referenceHref({ pmid: '123' })).toBe('https://pubmed.ncbi.nlm.nih.gov/123/')
  })
  test('null when nothing resolvable — native never linked these at all', () => {
    expect(referenceHref({ title: 'Untraceable' })).toBeNull()
  })
})

describe('colour maps', () => {
  test('known value maps to its colour', () => {
    expect(evidenceColor('established')).toBe('#00d68f')
  })
  test('unknown value falls back rather than returning undefined', () => {
    expect(evidenceColor('something-new')).toBe('#6b7788')
    expect(evidenceColor(undefined)).toBe('#6b7788')
  })
})
