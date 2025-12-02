import { ObjectId } from "mongodb";
import { reviews } from "../config/mongoCollections.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { validateComment, validateId, validateRating } from "../helpers.js";
import { updateStoreStats } from "./scores.js";

const getByStoreId = async (storeId) => {
	const valStoreID = validateId(storeId);

	const reviewsCollection = await reviews();
	const storeReviews = await reviewsCollection
		.find({ store_id: new ObjectId(valStoreID) })
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
	const valUserID = validateId(userId);

	const reviewsCollection = await reviews();
	const userReviews = await reviewsCollection
		.find({ user_id: new ObjectId(valUserID) })
		.sort({ updated_at: -1 })
		.toArray();

	return userReviews.map((review) => {
		review._id = review._id.toString();
		review.store_id = review.store_id.toString();
		review.user_id = review.user_id.toString();
		return review;
	});
};

const getUserReviewForStore = async (userId, storeId) => {
	const valUserID = validateId(userId);
	const valStoreID = validateId(storeId);

	const reviewsCollection = await reviews();
	const review = await reviewsCollection.findOne({
		user_id: new ObjectId(valUserID),
		store_id: new ObjectId(valStoreID),
	});

	if (!review) throw new NotFoundError("Review not found");

	review._id = review._id.toString();
	review.store_id = review.store_id.toString();
	review.user_id = review.user_id.toString();
	return review;
};

const createReview = async (storeId, userId, rating, comment) => {
	const valStoreID = validateId(storeId);
	const valUserID = validateId(userId);
	const parsedRating = validateRating(rating);
	const trimmedComment = validateComment(comment);

	try {
		const existingReview = await getUserReviewForStore(userId, storeId);
		if (existingReview) {
			throw new ValidationError("You already reviewed this store");
		}
	} catch (e) {
		// NotFoundError means no existing review - this is expected for new reviews
		if (!(e instanceof NotFoundError)) {
			throw e;
		}
	}

	const reviewsCollection = await reviews();

	const newReview = {
		store_id: new ObjectId(valStoreID),
		user_id: new ObjectId(valUserID),
		rating: parsedRating,
		comment: trimmedComment,
		created_at: new Date(),
		updated_at: new Date(),
	};

	const result = await reviewsCollection.insertOne(newReview);

	if (!result.acknowledged || !result.insertedId) {
		throw new Error("Could not create review");
	}

	await updateStoreStats(storeId);

	newReview._id = result.insertedId.toString();
	newReview.store_id = newReview.store_id.toString();
	newReview.user_id = newReview.user_id.toString();

	return newReview;
};

const updateReview = async (reviewId, userId, rating, comment) => {
	const valReviewID = validateId(reviewId);
	const valUserID = validateId(userId);
	const parsedRating = validateRating(rating);
	const trimmedComment = validateComment(comment);

	const reviewsCollection = await reviews();

	const existingReview = await reviewsCollection.findOne({
		_id: new ObjectId(valReviewID),
	});

	if (!existingReview) {
		throw new NotFoundError("Review not found");
	}

	if (existingReview.user_id.toString() !== valUserID) {
		throw new ValidationError("You can only edit your own reviews");
	}

	const result = await reviewsCollection.updateOne(
		{ _id: new ObjectId(valReviewID) },
		{
			$set: {
				rating: parsedRating,
				comment: trimmedComment,
				updated_at: new Date(),
			},
		},
	);

	if (!result.acknowledged || result.matchedCount === 0) {
		throw new Error("Could not update review");
	}

	await updateStoreStats(existingReview.store_id);

	const updatedReview = await reviewsCollection.findOne({
		_id: new ObjectId(reviewId),
	});

	updatedReview._id = updatedReview._id.toString();
	updatedReview.store_id = updatedReview.store_id.toString();
	updatedReview.user_id = updatedReview.user_id.toString();

	return updatedReview;
};

const exportedMethods = {
	getByStoreId,
	getByUserId,
	getUserReviewForStore,
	createReview,
	updateReview,
};

export default exportedMethods;
