export default function manifest() {
  return {
    id: '/app',
    name: 'Peptora',
    short_name: 'Peptora',
    description:
      'Peptide reconstitution calculator, protocol tracker and research encyclopedia.',
    // Installing drops the user straight into the app, never the marketing site.
    start_url: '/app/home',
    // Scoped to /app so marketing pages are not part of the installed app.
    scope: '/app/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#1a2535',
    theme_color: '#1a2535',
    categories: ['health', 'medical', 'education'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      { name: 'Dose calculator', url: '/app/calculator' },
      { name: 'Protocols', url: '/app/protocols' },
      { name: 'Log a dose', url: '/app/tracker' },
    ],
  }
}
