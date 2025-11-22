import express from "express";
import exphbs from "express-handlebars";
import session from "express-session";
import { SESSION_NAME } from "../config/settings.js";
import bobaRoutes from "./boba.js";
import usersRoutes from "./users.js";

const constructRoutes = (app) => {
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use("/public", express.static("public"));

	app.use(
		session({
			name: SESSION_NAME,
			secret: process.env.SESSION_SECRET || "devSecret",
			resave: false,
			saveUninitialized: false,
			cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
		}),
	);

	// Make current user available in templates
	app.use((req, res, next) => {
		res.locals.currentUser = req.session?.user ? req.session.user : null;
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
				formatDateTime: (date) => {
					if (!date) return "";
					const d = new Date(date);
					return d.toLocaleString("en-US", {
						month: "short",
						day: "numeric",
						year: "numeric",
						hour: "numeric",
						minute: "2-digit",
					});
				},
			},
		}),
	);
	app.set("view engine", "handlebars");

	// Routes
	app.use("/", bobaRoutes);
	app.use("/users", usersRoutes);

	// 404 catch-all
	app.use((_req, res) => {
		res.status(404).render("error", {
			title: "Page Not Found",
			errorMessage: "Uh oh, we couldn't find that page.",
		});
	});
};

export default constructRoutes;
