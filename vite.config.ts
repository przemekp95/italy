import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/italy/',
  define: {
    __BUILD_SHA__: JSON.stringify(process.env.GITHUB_SHA ?? 'local'),
  },
  plugins: [react()],
});
