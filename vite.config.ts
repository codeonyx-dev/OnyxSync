import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3080,
    strictPort: true,
    open: true,
  },
  preview: {
    port: 3080,
    strictPort: true,
  },
});
