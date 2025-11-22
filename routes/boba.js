import express from "express";
import bobaService from "../data/boba.js";
import reviewsService from "../data/reviews.js";
import { NotFoundError, ValidationError } from "../errors.js";

const router = express.Router();

// Home page - list all stores
router.get("/", async (_req, res) => {
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

// About page
router.get("/about", (_req, res) => {
	res.render("about", { title: "About - Boba Tracker" });
});

// Store detail page
router.get("/stores/:id", async (req, res) => {
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

export default router;
