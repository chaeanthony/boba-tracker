import { ObjectId } from "mongodb";
import { boba } from "../config/mongoCollections.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { VALID_STORE_SORTS } from "../helpers.js";

const maxPerPage = 100;

const getAll = async (page = 1, perPage = 10, sort = "SORT_HIGHEST_RATED") => {
	const parsedPage = parseInt(page, 10);
	if (Number.isNaN(parsedPage) || parsedPage < 1) {
		throw new ValidationError("page must be a valid integer");
	}

	const parsedPerPage = parseInt(perPage, 10);
	if (
		Number.isNaN(parsedPerPage) ||
		parsedPerPage < 1 ||
		parsedPerPage > maxPerPage
	) {
		throw new ValidationError(
			`per page must be an integer between 1 and ${maxPerPage}`,
		);
	}

	if (!VALID_STORE_SORTS.includes(sort)) {
		sort = "SORT_HIGHEST_RATED";
	}

	const validatedPage = parsedPage;
	const validatedPerPage = parsedPerPage;

	const bobaCollection = await boba();

	const skip = (validatedPage - 1) * validatedPerPage;

	let sortSpecification;
	switch (sort) {
		case "SORT_LOWEST_RATED":
			sortSpecification = { "stats.avg_rating": 1 };
			break;
		case "SORT_NEWEST":
			sortSpecification = { "stats.updated_at": -1 };
			break;
		case "SORT_TRENDING":
			sortSpecification = { "stats.trending_score": -1 };
			break;
		case "SORT_MOST_REVIEWS":
			sortSpecification = { "stats.n_ratings": -1 };
			break;
		default:
			sortSpecification = { "stats.avg_rating": -1 };
			break;
	}

	const bobaList = await bobaCollection
		.find({})
		.sort(sortSpecification)
		.skip(skip)
		.limit(validatedPerPage + 1)
		.toArray();

	if (bobaList.length === 0) {
		throw new NotFoundError("No boba stores found");
	}

	const more = bobaList.length > validatedPerPage;

	const stores = bobaList.slice(0, validatedPerPage).map((store) => {
		store._id = store._id.toString();
		if (store.stats?.avg_rating) {
			store.stats.avg_rating = store.stats.avg_rating.toFixed(1);
		}
		return store;
	});

	return { stores, more, page: validatedPage, perPage: validatedPerPage };
};

const getById = async (id) => {
	if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
		throw new ValidationError("invalid ID provided");
	}

	const bobaCollection = await boba();
	const store = await bobaCollection.findOne({ _id: new ObjectId(id) });

	if (!store) {
		throw new NotFoundError(`could not find store with ID ${id}`);
	}

	store._id = store._id.toString();
	if (store.stats?.avg_rating) {
		store.stats.avg_rating = store.stats.avg_rating.toFixed(1);
	}
	return store;
};

const exportedMethods = {
	getAll,
	getById,
};

export default exportedMethods;
