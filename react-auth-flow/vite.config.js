import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The proxy makes /api/* look like it comes from the same origin as the app
// (localhost:5173). Same origin = the refresh cookie just works, no CORS setup.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:4000' },
  },
});
