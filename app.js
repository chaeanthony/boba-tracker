import express from "express";
import exphbs from "express-handlebars";
import bobaService from "./data/boba.js";
import reviewsService from "./data/reviews.js";
import { NotFoundError, ValidationError } from "./errors.js";
import bobaRoutes from "./routes/boba.js";
import usersRoutes from "./routes/users.js";
import session from "express-session";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

// session middleware
app.use(
	session({
		name: "connect.sid",
		secret: process.env.SESSION_SECRET || "devSecret",
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
	}),
);

// make current user available in templates
app.use((req, res, next) => {
	res.locals.currentUser =
		req.session?.user ? req.session.user : null;
	next();
});

// Handlebars setup
app.engine(
	"handlebars",
	exphbs.engine({
		defaultLayout: "main",
		helpers: {
			formatDate: (date) => {
				if (!date) return "";
				const d = new Date(date);
				const month = String(d.getMonth() + 1).padStart(2, "0");
				const day = String(d.getDate()).padStart(2, "0");
				const year = d.getFullYear();
				return `${month}-${day}-${year}`;
			},
		},
	}),
);
app.set("view engine", "handlebars");

// Routes
app.use("/api/stores", bobaRoutes);
app.use("/", usersRoutes);

app.get("/", async (_req, res) => {
	try {
		const { stores } = await bobaService.getAll();
		res.render("home", { title: "Boba Tracker", stores });
	} catch (e) {
		console.error(e);
		res.render("error", {
			errorMessage: "Uh oh, something went wrong. Please try again later.",
		});
	}
});

app.get("/about", (_req, res) => {
	res.render("about", { title: "About - Boba Tracker" });
});

app.get("/stores/:id", async (req, res) => {
	try {
		const store = await bobaService.getById(req.params.id);
		const reviews = await reviewsService.getByStoreId(req.params.id);
		res.render("store-detail", {
			title: `${store.name}`,
			store,
			reviews,
		});
	} catch (e) {
		console.error(e);

		if (e instanceof NotFoundError) {
			return res.status(404).render("error", {
				title: "Boba Store Not Found",
				errorMessage: "Uh oh, we couldn't find this boba store.",
			});
		}

		if (e instanceof ValidationError) {
			return res.status(400).render("error", {
				title: "Invalid Request",
				errorMessage: "Uh oh, we couldn't process your request.",
			});
		}

		return res.status(500).render("error", {
			title: "Error",
			errorMessage: "Uh oh, something went wrong. Please try again later.",
		});
	}
});

// 404 everything else
app.use((_req, res) => {
	res.status(404).render("error", {
		title: "Page Not Found",
		errorMessage: "Uh oh, we couldn't find that page.",
	});
});

app.listen(3000, () => {
	console.log("Server running on http://localhost:3000");
});
