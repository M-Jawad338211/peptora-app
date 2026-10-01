/**
 * Geometry for the vial and syringe picture in the calculator.
 *
 * Pure numbers and functions, kept apart from the component so they can be
 * tested. The values match peptora-android/src/components/VialSyringe.js, so
 * both apps draw the same instrument.
 */

// Syringe, in viewBox units.
export const SW = 340
export const SH = 92
export const B_X = 60 // barrel left edge (the full mark)
export const B_W = 232 // barrel length
export const B_Y = 22
export const B_H = 32
export const B_RIGHT = B_X + B_W // needle end (the 0 mark)
export const CY = B_Y + B_H / 2

// Vial, in viewBox units.
export const VW = 84
export const VH = 118
export const V_BODY = { x: 12, y: 30, w: 60, h: 80, r: 10 }
export const V_INNER = { x: 14.5, y: 32.5, w: 55, h: 75 }

export function clamp(n, lo, hi) {
  return Math.min(Math.max(n, lo), hi)
}

/** Position of the plunger stopper for a number of units. */
export function stopperX(units, maxUnits = 100) {
  return B_RIGHT - (clamp(units, 0, maxUnits) / maxUnits) * B_W
}

/**
 * Units for a horizontal position on the rendered syringe: the inverse of
 * stopperX. `x` is measured from the left edge of the picture, in the same
 * pixels as `renderedWidth`.
 */
export function unitsAtX(x, renderedWidth, maxUnits = 100) {
  if (!renderedWidth) return 0
  const vx = (x / renderedWidth) * SW
  return clamp(Math.round(((B_RIGHT - vx) / B_W) * maxUnits), 0, maxUnits)
}

/**
 * How full to draw the vial, from 0 to 1. A vial is rarely filled to the
 * brim, so the scale is the smallest common vial size that holds the water
 * entered.
 */
export function vialLevel(waterMl) {
  if (!waterMl || waterMl <= 0) return 0
  const capacity = waterMl <= 3 ? 3 : waterMl <= 5 ? 5 : waterMl <= 10 ? 10 : waterMl
  return clamp(waterMl / capacity, 0, 1) * 0.92
}
