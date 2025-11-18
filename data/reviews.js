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

const getByUserId = async (userId) => {
	if (!userId || typeof userId !== "string" || !ObjectId.isValid(userId)) {
		throw new ValidationError("invalid user ID provided");
	}

	const reviewsCollection = await reviews();
	const userReviews = await reviewsCollection
		.find({ user_id: new ObjectId(userId) })
		.sort({ updated_at: -1 })
		.toArray();

	return userReviews.map((review) => {
		review._id = review._id.toString();
		review.store_id = review.store_id.toString();
		review.user_id = review.user_id.toString();
		return review;
	});
};

const exportedMethods = {
	getByStoreId,
	getByUserId,
};

export default exportedMethods;
