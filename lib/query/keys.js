/**
 * Query key registry.
 *
 * Keys are namespaced so a single prefix invalidation reaches a whole domain:
 * invalidateQueries({ queryKey: ['protocols'] }) hits the list, every detail,
 * and the stats summary. The native app gets this by accident and then
 * forgets it in places — deleting a dose log there never refreshes stats, so
 * the Home counters silently go stale.
 */
export const qk = {
  session: ['auth', 'session'],

  peptides: ['peptides', 'list'],
  peptide: (id) => ['peptides', 'detail', id],

  protocols: ['protocols', 'list'],
  protocol: (id) => ['protocols', 'detail', id],
  protocolStats: ['protocols', 'stats'],
  protocolLogs: (id) => ['protocols', 'logs', id],

  trackerLogs: ['tracker', 'logs'],

  calcHistory: ['calculator', 'history'],
  trial: (fingerprint) => ['calculator', 'trial', fingerprint],
}
