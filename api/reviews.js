import express from "express";
import reviewsService from "../data/reviews.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { requireLogin } from "../routes/users.js";

const router = express.Router();

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
