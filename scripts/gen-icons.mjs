/**
 * Generate PWA icons from the native app's artwork.
 *
 * Run manually and commit the output; this is not part of the build.
 *   node scripts/gen-icons.mjs
 *
 * The source (peptora-android/assets/icon.png) is 512x512 RGB with no alpha
 * and no maskable safe zone. Android applies a circular mask to maskable
 * icons and crops roughly 10% off each edge, so those variants are
 * re-composited at 80% on a brand-coloured canvas rather than simply resized —
 * a plain resize would clip the artwork.
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const SOURCE = join(here, '../../peptora-android/assets/icon.png')
const OUT = join(here, '../public/icons')

const SAFE_ZONE = 0.8 // maskable spec: keep content within the middle 80%

/**
 * The artwork already carries its own background. Sampling a corner pixel
 * means the padded canvas matches it exactly — hardcoding the brand navy
 * leaves a visible square seam where the two backgrounds meet.
 */
async function sampleBackground() {
  const { data, info } = await sharp(SOURCE).raw().toBuffer({ resolveWithObject: true })
  const i = (2 * info.width + 2) * info.channels
  return { r: data[i], g: data[i + 1], b: data[i + 2], alpha: 1 }
}

const BRAND_BG = await sampleBackground()

async function plain(size) {
  await sharp(SOURCE)
    .resize(size, size, { fit: 'cover' })
    .png()
    .toFile(join(OUT, `icon-${size}.png`))
  console.log(`  icon-${size}.png`)
}

async function maskable(size) {
  const inner = Math.round(size * SAFE_ZONE)
  const art = await sharp(SOURCE).resize(inner, inner, { fit: 'contain' }).toBuffer()

  await sharp({
    create: { width: size, height: size, channels: 4, background: BRAND_BG },
  })
    .composite([{ input: art, gravity: 'centre' }])
    .png()
    .toFile(join(OUT, `icon-maskable-${size}.png`))
  console.log(`  icon-maskable-${size}.png  (art at ${Math.round(SAFE_ZONE * 100)}%)`)
}

async function appleTouch() {
  // iOS ignores manifest icons for the home-screen icon in several versions,
  // and does not apply a mask — so this one is full-bleed on the brand colour.
  const inner = 180
  const art = await sharp(SOURCE).resize(inner, inner, { fit: 'cover' }).toBuffer()
  await sharp({
    create: { width: 180, height: 180, channels: 4, background: BRAND_BG },
  })
    .composite([{ input: art, gravity: 'centre' }])
    .png()
    .toFile(join(OUT, 'apple-touch-icon.png'))
  console.log('  apple-touch-icon.png')
}

await mkdir(OUT, { recursive: true })
console.log(`Generating icons from ${SOURCE}`)
await plain(192)
await plain(512)
await maskable(192)
await maskable(512)
await appleTouch()
console.log('Done.')
