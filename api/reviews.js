import express from "express";
import reviewsService from "../data/reviews.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { requireLogin } from "../routes/users.js";

const router = express.Router();

// GET /reviews?store_id=X&user_id=Y
router.get("/", async (req, res) => {
	try {
		const { store_id, user_id } = req.query;

		// If user_id is provided, verify it matches the logged-in user
		if (user_id) {
			if (!req.session?.user) {
				return res.status(401).json({ error: "Authentication required" });
			}
			if (user_id !== req.session.user._id) {
				return res
					.status(403)
					.json({ error: "You can only access your own reviews" });
			}
		}

		const allReviews = await reviewsService.getAll(store_id, user_id);

		return res.json({ reviews: allReviews });
	} catch (e) {
		console.error(e);

		if (e instanceof ValidationError) {
			return res.status(400).json({ error: e.message });
		}

		return res.status(500).json({ error: "Internal server error" });
	}
});

// GET /reviews/:id
router.get("/:id", async (req, res) => {
	try {
		const { id } = req.params;

		const review = await reviewsService.getById(id);

		return res.json({ review });
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
});

// POST /reviews
router.post("/", requireLogin, async (req, res) => {
	try {
		const userId = req.session.user._id;
		const { store_id, rating, comment } = req.body;

		const newReview = await reviewsService.createReview(
			store_id,
			userId,
			rating,
			comment,
		);

		return res.json({
			review: newReview,
		});
	} catch (e) {
		console.error(e);

		if (e instanceof ValidationError) {
			return res.status(400).json({ error: e.message });
		}

		return res.status(500).json({ error: "Internal server error" });
	}
});

// PATCH /reviews/:id
router.patch("/:id", requireLogin, async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.session.user._id;
		const { rating, comment } = req.body;

		const updatedReview = await reviewsService.updateReview(
			id,
			userId,
			rating,
			comment,
		);

		return res.json({
			review: updatedReview,
		});
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
});

export default router;
