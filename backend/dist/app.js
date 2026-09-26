"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const emergency_routes_1 = __importDefault(require("./routes/emergency.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const contact_routes_1 = __importDefault(require("./routes/contact.routes"));
const record_routes_1 = __importDefault(require("./routes/record.routes"));
const visit_routes_1 = __importDefault(require("./routes/visit.routes"));
const app = (0, express_1.default)();
// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://127.0.0.1:5173",
// ];
app.use((0, cors_1.default)());
/* Middleware */
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
/* Routes */
app.get("/", (_req, res) => {
    res.send("DRQR API Running...");
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/user", user_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/settings", settings_routes_1.default);
app.use("/api/health", health_routes_1.default);
app.use("/api/emergency", emergency_routes_1.default);
app.use("/api/appointments", appointment_routes_1.default);
app.use("/api/notifications", notification_routes_1.default);
app.use("/api/chat", chat_routes_1.default);
app.use("/api/contact", contact_routes_1.default);
app.use("/api/records", record_routes_1.default);
app.use("/api/visits", visit_routes_1.default);
exports.default = app;
