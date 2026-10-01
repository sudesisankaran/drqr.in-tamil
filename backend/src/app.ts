import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.routes";
import notificationRoutes from "./routes/notification.routes";
import visitRoutes from "./routes/visit.routes";
import treatmentRoutes from "./routes/treatment.routes";
import recordRoutes from "./routes/record.routes";
import healthRoutes from "./routes/health.routes";

const app = express();

app.use(cors());

/* Middleware */
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* Routes */
app.get("/", (_req, res) => {
  res.send("DRQR API Running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/treatments", treatmentRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/health", healthRoutes);

// JSON 404 handler for missing routes
app.use((req, res) => {
  res.status(404).json({ message: "Not Implemented Yet" });
});

export default app;
