/**
 * Generate every raster icon from the vector mark.
 *
 * Run manually and commit the output; this is not part of the build.
 *   node scripts/gen-icons.mjs
 *
 * Two sources, both in public/:
 *   logo.svg        the full mark, used at 64px and up
 *   logo-small.svg  the same mark without the inner hexagon, bridge and glow,
 *                   with heavier strokes, for 16-48px where the fine lines
 *                   blur into mush
 *
 * The mark is a hexagon on a transparent background. Android applies a
 * circular mask to maskable icons and crops roughly 10% off each edge, and iOS
 * fills transparency with black, so those variants are composited onto the
 * brand navy with the mark inside the safe zone.
 */
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(here, '../public')
const APP = join(here, '../app')
const ICONS = join(PUBLIC, 'icons')
const FULL = join(PUBLIC, 'logo.svg')
const SMALL = join(PUBLIC, 'logo-small.svg')

const NAVY = '#1a2535' // manifest background_color
const SAFE_ZONE = 0.8 // maskable spec: keep content within the middle 80%

function render(source, size) {
  // Rasterise at a high density first so the downscale is a clean resample.
  return sharp(source, { density: 600 }).resize(size, size).png()
}

async function transparent(source, size, file) {
  await render(source, size).toFile(file)
  console.log(`  ${file.replace(join(here, '..') + '/', '')}`)
}

async function onNavy(size, scale, file) {
  const inner = Math.round(size * scale)
  const art = await render(FULL, inner).toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: NAVY } })
    .composite([{ input: art, gravity: 'centre' }])
    .png()
    .toFile(file)
  console.log(`  ${file.replace(join(here, '..') + '/', '')}  (mark at ${Math.round(scale * 100)}%)`)
}

/** An ICO is a small directory of embedded PNGs. */
async function ico(sizes, file) {
  const pngs = await Promise.all(sizes.map((s) => render(SMALL, s).toBuffer()))
  const header = Buffer.alloc(6 + 16 * sizes.length)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(sizes.length, 4)
  let offset = header.length
  sizes.forEach((s, i) => {
    const e = 6 + 16 * i
    header.writeUInt8(s >= 256 ? 0 : s, e)
    header.writeUInt8(s >= 256 ? 0 : s, e + 1)
    header.writeUInt16LE(1, e + 4) // colour planes
    header.writeUInt16LE(32, e + 6) // bits per pixel
    header.writeUInt32LE(pngs[i].length, e + 8)
    header.writeUInt32LE(offset, e + 12)
    offset += pngs[i].length
  })
  await writeFile(file, Buffer.concat([header, ...pngs]))
  console.log(`  ${file.replace(join(here, '..') + '/', '')}  (${sizes.join(', ')})`)
}

await mkdir(ICONS, { recursive: true })
console.log('Generating icons from public/logo.svg and public/logo-small.svg')

// Browser tab. Browsers that take an SVG favicon use public/logo-small.svg
// directly (linked in app/layout.js).
await ico([16, 32, 48], join(APP, 'favicon.ico'))

// PWA manifest.
await transparent(FULL, 192, join(ICONS, 'icon-192.png'))
await transparent(FULL, 512, join(ICONS, 'icon-512.png'))
await onNavy(192, SAFE_ZONE, join(ICONS, 'icon-maskable-192.png'))
await onNavy(512, SAFE_ZONE, join(ICONS, 'icon-maskable-512.png'))
// iOS does not mask, but rounds the corners; a little less padding than the
// maskable variant keeps the mark from looking lost.
await onNavy(180, 0.84, join(ICONS, 'apple-touch-icon.png'))

// A large transparent export for anywhere outside the site (email, socials).
await transparent(FULL, 1024, join(PUBLIC, 'logo.png'))
console.log('Done.')
