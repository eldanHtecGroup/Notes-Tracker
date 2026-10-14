import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // Forward API calls to the backend so the browser only ever talks to one origin
      proxy: {
        '/api': env.API_PROXY_TARGET || 'http://localhost:5000',
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './tests/setup.js',
      include: ['tests/**/*.test.{js,jsx}'],
      restoreMocks: true,
      coverage: {
        include: ['src/**'],
        exclude: ['src/main.jsx'],
      },
    },
  };
});
