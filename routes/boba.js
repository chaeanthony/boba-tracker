import express from "express";
import bobaService from "../data/boba.js";
import reviewsService from "../data/reviews.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { VALID_REVIEW_SORTS, VALID_STORE_SORTS } from "../helpers.js";

const router = express.Router();

// Home page - list all stores
router.get("/", async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;

		// Sort parameter
		let sort = req.query.sort;
		// Validate sort parameter
		if (!VALID_STORE_SORTS.includes(sort)) {
			sort = "highest_rated";
		}

		// Label to show up in dropdown menu for selected sort
		let sortLabel = "";
		switch (sort) {
			case "newest":
				sortLabel = "Newest";
				break;
			case "trending":
				sortLabel = "Trending";
				break;
			case "most_reviews":
				sortLabel = "Most Reviews";
				break;
			default:
				sortLabel = "Highest Rated";
				break;
		}

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
		let reviews = await reviewsService.getByStoreId(req.params.id);
		// Sort parameter
		let sort = req.query.sort;
		// Validate sort parameter
		if (!VALID_REVIEW_SORTS.includes(sort)) {
			sort = "most_recent";
		}
		// Label to show up in dropdown menu for selected sort
		let sortLabel = "";

		if (reviews && Array.isArray(reviews)) {
			reviews = [...reviews];

			switch (sort) {
				case "least_recent":
					reviews.sort(
						(a, b) => new Date(a.updated_at) - new Date(b.updated_at),
					);
					sortLabel = "Least Recent";
					break;
				case "highest_rating":
					reviews.sort((a, b) => b.rating - a.rating);
					sortLabel = "Highest Rating";
					break;
				case "lowest_rating":
					reviews.sort((a, b) => a.rating - b.rating);
					sortLabel = "Lowest Rating";
					break;
				default:
					reviews.sort(
						(a, b) => new Date(b.updated_at) - new Date(a.updated_at),
					);
					sortLabel = "Most Recent";
					break;
			}
		}

		res.render("store-detail", {
			title: `${store.name}`,
			store,
			reviews,
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
