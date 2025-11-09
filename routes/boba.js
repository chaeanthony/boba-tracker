import express from "express";

const router = express.Router();

import bobaService from "../data/boba.js";
import { NotFoundError, ValidationError } from "../errors.js";

router.route("/").get(async (req, res) => {
	try {
		const { stores, more, page, perPage } = await bobaService.getAll(
			req.query.page,
			req.query.per_page,
		);

		return res.status(200).json({
			stores,
			page,
			per_page: perPage,
			more,
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

router.route("/:id").get(async (req, res) => {
	try {
		const store = await bobaService.getById(req.params.id);
		return res.status(200).json(store);
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
