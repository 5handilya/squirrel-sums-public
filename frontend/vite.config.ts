import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dotenv from 'dotenv';

dotenv.config();
export default defineConfig({
  base: '/',
  plugins: [vue()],
  build: {
    outDir: "dist" 
  },
  server: {
	  host: '0.0.0.0',
	  port: 5173,
  },
})

