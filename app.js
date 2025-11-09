import express from "express";
import exphbs from "express-handlebars";
import bobaService from "./data/boba.js";
import bobaRoutes from "./routes/boba.js";
import { NotFoundError, ValidationError } from "./errors.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

// Handlebars setup
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routes
app.use("/api/stores", bobaRoutes);

app.get("/", async (_req, res) => {
	try {
		const { stores } = await bobaService.getAll();
		res.render("home", { title: "Boba Tracker", stores });
	} catch (e) {
		console.error(e);
		res.render("error", { errorMessage: "Uh oh, something went wrong. Please try again later." });
	}
});

app.get("/about", (_req, res) => {
	res.render("about", { title: "About - Boba Tracker" });
});

// Start server
app.listen(3000, () => {
	console.log("Server running on http://localhost:3000");
});
