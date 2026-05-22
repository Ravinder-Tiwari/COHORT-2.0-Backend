import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server:{
    proxy:{ // when frontend makes a request to /api, it will be forwarded to http://localhost:3000
      "/api":{
        target:"http://localhost:3000",
        changeOrigin:true, // for virtual hosted sites
        secure:false //set to false if your backend is running on http and not https
      }
    }
  }
})
