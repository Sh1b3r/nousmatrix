import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mihomo-dev-proxy',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/mihomo')) {
            try {
              const url = new URL(req.url, 'http://localhost:3000');
              const uid = url.searchParams.get('uid');
              const lang = url.searchParams.get('lang') || 'en';
              const targetLang = (lang === 'ru' || lang === 'uk') ? 'ru' : 'en';

              if (!uid) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'UID is required' }));
                return;
              }

              const upstream = await fetch(`https://api.mihomo.me/sr_info_parsed/${uid}?lang=${targetLang}`, {
                headers: {
                  'User-Agent': 'NousMatrix/1.0'
                }
              });

              res.statusCode = upstream.status;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              const text = await upstream.text();
              res.end(text);
              return;
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
              return;
            }
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 3000
  }
});
