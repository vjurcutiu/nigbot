const isProd = process.env.NODE_ENV === 'production';

export default {
  info:  (...args) => { if (!isProd) console.log('[INFO]', ...args) },
  warn:  (...args) => { if (!isProd) console.warn('[WARN]', ...args) },
  error: (...args) => { console.error('[ERROR]', ...args) },
};
