import { ObjectId } from "mongodb";
import { reviews } from "../config/mongoCollections.js";
import { ValidationError } from "../errors.js";

const getByStoreId = async (storeId) => {
	if (!storeId || typeof storeId !== "string" || !ObjectId.isValid(storeId)) {
		throw new ValidationError("invalid store ID provided");
	}

	const reviewsCollection = await reviews();
	const storeReviews = await reviewsCollection
		.find({ store_id: new ObjectId(storeId) })
		.sort({ updated_at: -1 })
		.toArray();

	return storeReviews.map((review) => {
		review._id = review._id.toString();
		review.store_id = review.store_id.toString();
		review.user_id = review.user_id.toString();
		return review;
	});
};

const exportedMethods = {
	getByStoreId,
};

export default exportedMethods;
