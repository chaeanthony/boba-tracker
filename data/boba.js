import { boba } from "../config/mongoCollections.js";
import { NotFoundError } from "../errors.js";

const getAll = async (page = 1, perPage = 10) => {
	const bobaCollection = await boba();

	const skip = (page - 1) * perPage;

	const bobaList = await bobaCollection
		.find({})
		.skip(skip)
		.limit(perPage + 1)
		.toArray();

	if (bobaList.length === 0) {
		throw new NotFoundError("No boba stores found");
	}

	const more = bobaList.length > perPage;

	const stores = bobaList.slice(0, perPage).map((store) => {
		store._id = store._id.toString();
		return store;
	});

	return { stores, more };
};

const exportedMethods = {
	getAll,
};

export default exportedMethods;
