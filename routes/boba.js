import express from "express";
import bobaService from "../data/boba.js";
import reviewsService from "../data/reviews.js";
import { NotFoundError, ValidationError } from "../errors.js";
import {
	REVIEW_SORT_LABELS,
	SORT_HIGHEST_RATED,
	SORT_MOST_RECENT,
	STORE_SORT_LABELS,
	sortReviews,
	VALID_REVIEW_SORTS,
	VALID_STORE_SORTS,
} from "../helpers.js";

const router = express.Router();

// Home page - list all stores
router.get("/", async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;

		// Sort parameter
		let sort = req.query.sort;
		// Validate sort parameter
		if (!VALID_STORE_SORTS.includes(sort)) {
			sort = SORT_HIGHEST_RATED;
		}

		// Label to show up in dropdown menu for selected sort
		const sortLabel = STORE_SORT_LABELS[sort];

		const { stores, more } = await bobaService.getAll(page, 10, sort);

		res.render("home", {
			title: "Boba Tracker",
			stores,
			page,
			prevPage: page > 1 ? page - 1 : null,
			nextPage: more ? page + 1 : null,
			sort,
			sortLabel,
		});
	} catch (e) {
		console.error(e);
		res.render("error", {
			errorMessage: "Uh oh, something went wrong. Please try again later.",
		});
	}
});

// About page
router.get("/about", (_req, res) => {
	res.render("about", { title: "About - Boba Tracker" });
});

// Store detail page
router.get("/stores/:id", async (req, res) => {
	try {
		const store = await bobaService.getById(req.params.id);
		const reviews = await reviewsService.getByStoreId(req.params.id);
		// Sort parameter
		let sort = req.query.sort;
		// Validate sort parameter
		if (!VALID_REVIEW_SORTS.includes(sort)) {
			sort = SORT_MOST_RECENT;
		}
		// Label to show up in dropdown menu for selected sort
		const sortLabel = REVIEW_SORT_LABELS[sort];

		// Sort reviews using helper
		const sortedReviews = sortReviews(reviews, sort);

		res.render("store-detail", {
			title: `${store.name}`,
			store,
			reviews: sortedReviews,
			sort,
			sortLabel,
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

export default router;
