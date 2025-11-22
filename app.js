import cron from "node-cron";
import express from "express";
import { calculateTrendingScores } from "./data/scores.js";
import constructRoutes from "./routes/index.js";

const app = express();

constructRoutes(app);

// Cron: recalculate store scores every 5 minutes
cron.schedule("*/5 * * * *", async () => {
	console.log("Recalculating store scores...");
	await calculateTrendingScores();
});

app.listen(3000, () => {
	console.log("Server running on http://localhost:3000");
});
