import { defineConfig } from "vite";

export default defineConfig({
  root: "./src", // Point to the 'src' folder
  server: {
    port: 3000,  // or your preferred port
    host: true,  // Allows external access
    allowedHosts: ['x.jaseci.org'],  // Allow your domain
  }
});