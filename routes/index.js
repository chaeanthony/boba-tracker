import express from "express";
import exphbs from "express-handlebars";
import session from "express-session";
import reviewsAPI from "../api/reviews.js";
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
					const month = String(d.getUTCMonth() + 1).padStart(2, "0");
					const day = String(d.getUTCDate()).padStart(2, "0");
					const year = d.getUTCFullYear();
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
				
				calculateStoreAge: (grandOpenDate) => {
                if (!grandOpenDate) return "N/A";
                
                const grandOpen = new Date(grandOpenDate);
                const today = new Date();
                
                // Calculate difference in years and months
                let years = today.getFullYear() - grandOpen.getFullYear();
                let months = today.getMonth() - grandOpen.getMonth();
                
                // Adjust for negative months
                if (months < 0) {
                    years--;
                    months += 12;
                }
                
                // Calculate total months for more precise calculation
                const totalMonths = years * 12 + months;
                
                if (years === 0 && months === 0) {
                    // Store opened this month
                    const daysDiff = Math.floor((today - grandOpen) / (1000 * 60 * 60 * 24));
                    if (daysDiff === 0) return "Opened today!";
                    if (daysDiff === 1) return "Opened yesterday";
                    if (daysDiff < 7) return `Opened ${daysDiff} days ago`;
                    if (daysDiff < 30) return `Opened ${Math.floor(daysDiff/7)} weeks ago`;
                    return `Opened ${months} month${months !== 1 ? 's' : ''} ago`;
                } else if (years === 0) {
                    return `${months} month${months !== 1 ? 's' : ''} old`;
                } else if (months === 0) {
                    return `${years} year${years !== 1 ? 's' : ''} old`;
                } else {
                    return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''} old`;
                }
			   },
				
			},
		}),
	);
	app.set("view engine", "handlebars");

	// Routes
	app.use("/", bobaRoutes);
	app.use("/users", usersRoutes);

	// API
	app.use("/api/reviews", reviewsAPI);

	// 404 catch-all
	app.use((_req, res) => {
		res.status(404).render("error", {
			title: "Page Not Found",
			errorMessage: "Uh oh, we couldn't find that page.",
		});
	});
};

export default constructRoutes;
