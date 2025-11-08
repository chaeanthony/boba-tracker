import express from "express";
const router = express.Router();
import bobaService from "../data/boba.js";
import { NotFoundError } from "../errors.js";

router.route("/")
.get(async (req, res) => {
	try {
		const page = Math.max(1, parseInt(req.query.page) || 1);
		const perPage = Math.max(1, Math.min(100, parseInt(req.query.per_page) || 10)); // 100 is the maximum number of items per page

		const { stores, more } = await bobaService.getAll(page, perPage);

		return res.status(200).json({
			stores,
			page,
			per_page: perPage,
			more
		});
	} catch (e) {
		console.error(e);

		if (e instanceof NotFoundError) {
			return res.status(404).json({ error: e.message });
		}

		return res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
