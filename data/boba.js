import { ObjectId } from "mongodb";
import { boba } from "../config/mongoCollections.js";
import { NotFoundError } from "../errors.js";

const maxPerPage = 100;

const getAll = async (page = 1, perPage = 10) => {
	const parsedPage = parseInt(page, 10);
	if (isNaN(parsedPage) || parsedPage < 1) {
		throw new ValidationError("page must be a valid integer");
	}

	const parsedPerPage = parseInt(perPage, 10);
	if (isNaN(parsedPerPage) || parsedPerPage < 1 || parsedPerPage > maxPerPage) {
		throw new ValidationError(`per page must be an integer between 1 and ${maxPerPage}`);
	}

	const validatedPage = parsedPage;
	const validatedPerPage = parsedPerPage;

	const bobaCollection = await boba();

	const skip = (validatedPage - 1) * validatedPerPage;

	const bobaList = await bobaCollection
		.find({})
		.skip(skip)
		.limit(validatedPerPage + 1)
		.toArray();

	if (bobaList.length === 0) {
		throw new NotFoundError("No boba stores found");
	}

	const more = bobaList.length > validatedPerPage;

	const stores = bobaList.slice(0, validatedPerPage).map((store) => {
		store._id = store._id.toString();
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
	return store;
};

const exportedMethods = {
	getAll,
	getById,
};

export default exportedMethods;
