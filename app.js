import express from "express";
import exphbs from "express-handlebars";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

// Handlebars setup
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routes
app.get("/", (req, res) => {
	res.send("Hello World");
});

// Start server
app.listen(3000, () => {
	console.log("Server running on http://localhost:3000");
});
