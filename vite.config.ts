import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// bhupin.com is served from the repo root on GitHub Pages (custom domain), so base stays "/".
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    target: 'es2020',
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/](three|@react-three)[\\/]/ },
            { name: 'gsap', test: /node_modules[\\/]gsap[\\/]/ },
          ],
        },
      },
    },
  },
})
