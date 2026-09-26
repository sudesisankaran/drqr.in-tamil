import https from "https";
import dotenv from "dotenv";
dotenv.config();

import http from "http";
// import os from "os";
import app from "./app";
import { connectDB } from "./config/supabase";
import { initSocket } from "./socket";

// import fs from "fs";
// import path from "path";

// const keyPath = path.join(__dirname, "../10.77.96.177+3-key.pem");
// const certPath = path.join(__dirname, "../10.77.96.177+3.pem");

const PORT: number = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";

// const getLocalIP = () => {
//   const nets = os.networkInterfaces();
//   for (const name of Object.keys(nets)) {
//     for (const net of nets[name] || []) {
//       if (net.family === "IPv4" && !net.internal) {
//         return net.address;
//       }
//     }
//   }
//   return "localhost";
// };

const startServer = async () => {
  try {
    console.log("Connecting to Database...");
    await connectDB();
    console.log("Database Connected Successfully");
    let server: http.Server | https.Server;

    // if (process.env.USE_HTTPS === "true") {
    //   const key = fs.readFileSync(keyPath);
    //   const cert = fs.readFileSync(certPath);

    //   const ip = getLocalIP();
    //   console.log(`Mobile Portal: https://${ip}:${PORT}`);

    //   server = https.createServer({ key, cert }, app);
    //   initSocket(server);
    //   server.listen(PORT, HOST, () => {
    //     console.log(`HTTPS Server running at: https://localhost:${PORT}`);
    //   });
    // } else {
    server = http.createServer(app);
    initSocket(server);
    server.listen(PORT, HOST, () => {
      console.log(`HTTP Server running at: http://localhost:${PORT}`);
    });
    // }
  } catch (error) {
    console.error("Server Failed to Start:", error);
    process.exit(1);
  }
};

startServer();
