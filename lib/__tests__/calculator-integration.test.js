import { calc_forward, calc_inverse, to_mcg, build_result } from '../reconstitution'
import { formatDoseFromMcg } from '../format'

/**
 * The engine itself is covered by reconstitution.test.js. These tests cover
 * the wiring from engine output to the display object — the exact seam where
 * the native app drifted, since it assembles that object inline in three
 * places instead of using build_result.
 */
describe('calculator display wiring', () => {
  test('spec fixture: 5 mg vial, 2 mL water, 250 mcg dose, U-100', () => {
    const r = calc_forward(5, 2, 250, 'U-100')
    expect(r.ok).toBe(true)

    const display = build_result('forward', r, {
      peptide_name: 'BPC-157',
      unit: 'mcg',
      target_dose: 250,
      syringe_type: 'U-100',
      suggested_frequency: null,
    })

    expect(display.concentration_label).toBe('2500.0 mcg/mL')
    expect(display.target_dose_label).toBe('250 mcg')
    expect(display.doses_per_vial).toBe(20)
    expect(display.syringe.draw_volume_ml).toBeCloseTo(0.1, 5)
    expect(display.syringe.draw_units).toBeCloseTo(10, 5)
    expect(display.syringe.capacity_units).toBe(100)
    expect(display.warnings).toEqual([])
  })

  test('inverse mode recommends 4 mL and reports honest numbers', () => {
    const r = calc_inverse(5, 250, 'U-100', 20)
    const display = build_result('inverse', r, {
      peptide_name: 'BPC-157',
      unit: 'mcg',
      target_dose: 250,
      syringe_type: 'U-100',
    })

    expect(display.recommended_water_ml).toBe(4)
    expect(display.syringe.draw_units).toBeCloseTo(20, 5)
    expect(display.concentration_label).toBe('1250.0 mcg/mL')
    expect(display.alternatives).toHaveLength(4)
  })

  test('draw_units is populated in BOTH modes', () => {
    // Forward exposes `syringe_units`, inverse exposes
    // `resulting_units_per_dose`; build_result must normalise both.
    const fwd = build_result('forward', calc_forward(5, 2, 250, 'U-100'), {
      unit: 'mcg', target_dose: 250, syringe_type: 'U-100',
    })
    const inv = build_result('inverse', calc_inverse(5, 250, 'U-100', 20), {
      unit: 'mcg', target_dose: 250, syringe_type: 'U-100',
    })
    expect(Number.isFinite(fwd.syringe.draw_units)).toBe(true)
    expect(Number.isFinite(inv.syringe.draw_units)).toBe(true)
  })

  test('non-U-100 syringes change the unit reading, not the volume', () => {
    const u100 = calc_forward(5, 2, 250, 'U-100')
    const u40 = calc_forward(5, 2, 250, 'U-40')
    expect(u40.draw_volume_ml).toBeCloseTo(u100.draw_volume_ml, 6)
    expect(u40.syringe_units).toBeCloseTo(4, 5) // 0.1 mL on a U-40
  })

  test('mg dose normalises to mcg before entering the engine', () => {
    // A 5 mg dose is 5000 mcg — the value actually sent to the API.
    expect(to_mcg(5, 'mg')).toBe(5000)
    const r = calc_forward(10, 2, to_mcg(5, 'mg'), 'U-100')
    expect(r.doses_per_vial).toBe(2)
  })

  test('overflow and under-2-unit draws surface as warnings', () => {
    // 10 mg in 5 mL = 2000 mcg/mL; a 3000 mcg dose is 1.5 mL = 150 units.
    const tooBig = calc_forward(10, 5, 3000, 'U-100')
    expect(tooBig.syringe_units).toBeCloseTo(150, 5)
    expect(tooBig.warnings.some((w) => w.includes('exceeds one full syringe'))).toBe(true)

    // 10 mg in 1 mL = 10000 mcg/mL; a 100 mcg dose is 0.01 mL = 1 unit.
    const tooSmall = calc_forward(10, 1, 100, 'U-100')
    expect(tooSmall.syringe_units).toBeCloseTo(1, 5)
    expect(tooSmall.warnings.some((w) => w.includes('under 2 units'))).toBe(true)
  })
})

describe('formatDoseFromMcg — the ProtocolCard bug', () => {
  test('5 mg stored as 5000 mcg renders as "5 mg", not "5000 mg"', () => {
    expect(formatDoseFromMcg(5000, 'mg')).toBe('5 mg')
  })
  test('mcg passes through', () => {
    expect(formatDoseFromMcg(250, 'mcg')).toBe('250 mcg')
  })
  test('IU converts when iu_per_mg is known', () => {
    expect(formatDoseFromMcg(1000, 'IU', 3)).toBe('3 IU')
  })
  test('IU falls back to mcg rather than showing a wrong number', () => {
    expect(formatDoseFromMcg(1000, 'IU', null)).toBe('1000 mcg')
  })
  test('trailing zeros are trimmed', () => {
    expect(formatDoseFromMcg(250.0, 'mcg')).toBe('250 mcg')
    expect(formatDoseFromMcg(250, 'mg')).toBe('0.25 mg')
  })
  test('non-numeric input is safe', () => {
    expect(formatDoseFromMcg(null, 'mcg')).toBe('')
    expect(formatDoseFromMcg(undefined, 'mg')).toBe('')
  })
})
