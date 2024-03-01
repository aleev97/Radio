import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  plugins: [
    react(),
    replace({
      'process.env.REACT_APP_API_BASE_URL': JSON.stringify(process.env.REACT_APP_API_BASE_URL),
    }),
  ],
});