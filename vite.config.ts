import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    base: './', 
    define: {
      // Define 'process.env' object to prevent "process is not defined" errors
      'process.env': {},
      // Inject the API Key. Check VITE_API_KEY first, then API_KEY. Default to empty string to prevent crash.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY || ''),
    },
    build: {
      outDir: 'docs',
      assetsDir: 'assets',
      sourcemap: false,
      emptyOutDir: true
    }
  };
});