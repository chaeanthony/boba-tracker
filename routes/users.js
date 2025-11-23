import bcrypt from "bcrypt";
import express from "express";
import { SESSION_NAME } from "../config/settings.js";
import bobaService from "../data/boba.js";
import reviewsService from "../data/reviews.js";
import usersService from "../data/users.js";
import {
	MAX_DISPLAY_NAME_LENGTH,
	MAX_EMAIL_LENGTH,
	MAX_PASSWORD_LENGTH,
	MIN_PASSWORD_LENGTH,
} from "../helpers.js";

const router = express.Router();

// Render signup form
router.get("/signup", (_req, res) => {
	res.render("signup", { title: "Sign up" });
});

// Handle signup
router.post("/signup", async (req, res) => {
	try {
		const { email, password, confirmPassword, displayName } = req.body;

		// only perform basic type and trim checks here
		if (
			typeof email !== "string" ||
			typeof password !== "string" ||
			typeof confirmPassword !== "string" ||
			typeof displayName !== "string"
		) {
			return res.status(400).render("error", {
				title: "Invalid",
				errorMessage: "All fields are required.",
			});
		}

		const trimmedEmail = email.trim();
		const trimmedPassword = password.trim();
		const trimmedConfirm = confirmPassword.trim();
		const trimmedDisplayName = displayName.trim();

		if (
			trimmedEmail.length === 0 ||
			trimmedPassword.length === 0 ||
			trimmedConfirm.length === 0 ||
			trimmedDisplayName.length === 0
		) {
			return res.status(400).render("error", {
				title: "Invalid",
				errorMessage: "All fields are required.",
			});
		}

		if (trimmedEmail.length > MAX_EMAIL_LENGTH) {
			return res.status(400).render("error", {
				title: "Invalid",
				errorMessage: `Email must be at most ${MAX_EMAIL_LENGTH} characters long.`,
			});
		}
		if (
			trimmedPassword.length < MIN_PASSWORD_LENGTH ||
			trimmedPassword.length > MAX_PASSWORD_LENGTH ||
			trimmedConfirm.length < MIN_PASSWORD_LENGTH ||
			trimmedConfirm.length > MAX_PASSWORD_LENGTH
		) {
			return res.status(400).render("error", {
				title: "Invalid",
				errorMessage: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters long.`,
			});
		}
		if (trimmedDisplayName.length > MAX_DISPLAY_NAME_LENGTH) {
			return res.status(400).render("error", {
				title: "Invalid",
				errorMessage: `Display name must be at most ${MAX_DISPLAY_NAME_LENGTH} characters long.`,
			});
		}

		const created = await usersService.createUser(
			trimmedEmail,
			trimmedPassword,
			trimmedDisplayName,
		);

		// store minimal user info in session
		req.session.user = { _id: created._id, email: created.email };

		return res.redirect("/");
	} catch (e) {
		console.error(e);
		return res.status(400).render("error", {
			title: "Error",
			errorMessage: e.message || "Could not create account.",
		});
	}
});

// Render login form
router.get("/login", (_req, res) => {
	res.render("login", { title: "Log in" });
});

// Handle login
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		// basic type + trim checks
		if (typeof email !== "string" || typeof password !== "string") {
			return res.status(400).render("error", {
				title: "Invalid",
				errorMessage: "Email and password are required.",
			});
		}

		const trimmedEmail = email.trim();
		const trimmedPassword = password.trim();

		if (trimmedEmail.length === 0 || trimmedPassword.length === 0) {
			return res.status(400).render("error", {
				title: "Invalid",
				errorMessage: "Email and password are required.",
			});
		}

		let user;
		try {
			user = await usersService.getUserByEmail(trimmedEmail);
		} catch (e) {
			console.error(e);

			if (e instanceof NotFoundError) {
				return res.status(404).json({ error: e.message });
			}

			if (e instanceof ValidationError) {
				return res.status(400).json({ error: e.message });
			}

			return res.status(500).json({ error: "Internal server error" });
		}
		if (!user) {
			return res.status(401).render("error", {
				title: "Unauthorized",
				errorMessage: "Invalid email or password.",
			});
		}

		const match = await bcrypt.compare(trimmedPassword, user.passwordHash);
		if (!match) {
			return res.status(401).render("error", {
				title: "Unauthorized",
				errorMessage: "Invalid email or password.",
			});
		}

		req.session.user = { _id: user._id, email: user.email };
		return res.redirect("/");
	} catch (e) {
		console.error(e);
		return res
			.status(500)
			.render("error", { title: "Error", errorMessage: "Could not log in." });
	}
});

router.get("/profile", requireLogin, async (req, res) => {
	try {
		const userId = req.session.user._id;

		// Get all reviews by this user
		const userReviews = await reviewsService.getByUserId(userId);

		// Get store details for each review
		const reviewsWithStores = await Promise.all(
			userReviews.map(async (review) => {
				const store = await bobaService.getById(review.store_id);
				return {
					...review,
					store: store,
				};
			}),
		);

		return res.render("profile", {
			title: "My Profile",
			email: req.session.user.email,
			reviews: reviewsWithStores,
			reviewCount: userReviews.length,
		});
	} catch (_e) {
		return res.status(500).render("error", {
			title: "Error",
			errorMessage: "Could not load profile.",
		});
	}
});

// Logout
router.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) console.error("Session destroy error:", err);
		res.clearCookie(SESSION_NAME);
		return res.redirect("/");
	});
});

// Middleware to require a logged in user for protected routes
export function requireLogin(req, res, next) {
	if (req.session?.user) return next();
	// if request expects json, return 401, otherwise redirect to login
	if (req.get("Accept")?.includes("application/json")) {
		return res.status(401).json({ error: "Authentication required" });
	}
	return res.redirect("/users/login");
}

export default router;
