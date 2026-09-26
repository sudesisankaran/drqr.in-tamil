"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_1 = __importDefault(require("http"));
// import os from "os";
const app_1 = __importDefault(require("./app"));
const supabase_1 = require("./config/supabase");
const socket_1 = require("./socket");
// import fs from "fs";
// import path from "path";
// const keyPath = path.join(__dirname, "../10.77.96.177+3-key.pem");
// const certPath = path.join(__dirname, "../10.77.96.177+3.pem");
const PORT = Number(process.env.PORT) || 5000;
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
        await (0, supabase_1.connectDB)();
        console.log("Database Connected Successfully");
        let server;
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
        server = http_1.default.createServer(app_1.default);
        (0, socket_1.initSocket)(server);
        server.listen(PORT, HOST, () => {
            console.log(`HTTP Server running at: http://localhost:${PORT}`);
        });
        // }
    }
    catch (error) {
        console.error("Server Failed to Start:", error);
        process.exit(1);
    }
};
startServer();
