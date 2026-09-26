// import fs from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // https: {
    //   key: fs.readFileSync("./10.77.96.177+3-key.pem"),
    //   cert: fs.readFileSync("./10.77.96.177+3.pem"),
    // },
    host: "0.0.0.0",
    port: 3001,
  },
});
