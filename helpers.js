import { ObjectId } from "mongodb";
import { ValidationError } from "./errors.js";

// Constants
export const MAX_EMAIL_LENGTH = 50;
export const MAX_DISPLAY_NAME_LENGTH = 20;
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 20;
// Sort Constants
export const SORT_MOST_RECENT = "most_recent";
export const SORT_LEAST_RECENT = "least_recent";
export const SORT_HIGHEST_RATING = "highest_rating";
export const SORT_LOWEST_RATING = "lowest_rating";

export const VALID_REVIEW_SORTS = [
	SORT_HIGHEST_RATING,
	SORT_LOWEST_RATING,
	SORT_MOST_RECENT,
	SORT_LEAST_RECENT,
];

export const REVIEW_SORT_LABELS = {
	[SORT_MOST_RECENT]: "Most Recent",
	[SORT_LEAST_RECENT]: "Least Recent",
	[SORT_HIGHEST_RATING]: "Highest Rating",
	[SORT_LOWEST_RATING]: "Lowest Rating",
};

export const SORT_HIGHEST_RATED = "highest_rated";
export const SORT_LOWEST_RATED = "lowest_rated";
export const SORT_TRENDING = "trending";
export const SORT_MOST_REVIEWS = "most_reviews";
export const SORT_NEWEST = "newest";

export const VALID_STORE_SORTS = [
	SORT_HIGHEST_RATED,
	SORT_LOWEST_RATED,
	SORT_TRENDING,
	SORT_MOST_REVIEWS,
	SORT_NEWEST,
];

export const STORE_SORT_LABELS = {
	[SORT_HIGHEST_RATED]: "Highest Rated",
	[SORT_LOWEST_RATED]: "Lowest Rated",
	[SORT_TRENDING]: "Trending",
	[SORT_MOST_REVIEWS]: "Most Reviews",
	[SORT_NEWEST]: "Newest",
};

export const validateEmail = (email) => {
	if (typeof email !== "string")
		throw new ValidationError("Email must be a non-empty string");
	const normalizedEmail = email.trim().toLowerCase();
	if (normalizedEmail.length === 0)
		throw new ValidationError("Email must be a non-empty string");
	if (normalizedEmail.length > MAX_EMAIL_LENGTH)
		throw new ValidationError(
			`Email must be at most ${MAX_EMAIL_LENGTH} characters long`,
		);

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(normalizedEmail))
		throw new ValidationError("Email must be a valid email address");

	return normalizedEmail;
};

export const validateDisplayName = (displayName) => {
	if (typeof displayName !== "string")
		throw new ValidationError("Display name must be a non-empty string");
	const trimmedDisplayName = displayName.trim();
	if (trimmedDisplayName.length === 0)
		throw new ValidationError("Display name must be a non-empty string");
	if (trimmedDisplayName.length > MAX_DISPLAY_NAME_LENGTH)
		throw new ValidationError(
			`Display name must be at most ${MAX_DISPLAY_NAME_LENGTH} characters long`,
		);

	return trimmedDisplayName;
};

export const validateId = (id) => {
	if (typeof id !== "string") throw new ValidationError("Invalid ID provided");
	const trimmedId = id.trim();
	if (trimmedId.length === 0) throw new ValidationError("Invalid ID provided");
	if (!ObjectId.isValid(trimmedId))
		throw new ValidationError("Invalid ID provided");

	return trimmedId;
};

export const validatePassword = (password) => {
	if (typeof password !== "string")
		throw new ValidationError("Password must be a non-empty string");
	const trimmedPassword = password.trim();
	if (trimmedPassword.length < MIN_PASSWORD_LENGTH)
		throw new ValidationError(
			`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
		);
	if (trimmedPassword.length > MAX_PASSWORD_LENGTH)
		throw new ValidationError(
			`Password must be at most ${MAX_PASSWORD_LENGTH} characters long`,
		);

	return trimmedPassword;
};

export const validateRating = (rating) => {
	const parsedRating = Number.parseInt(rating, 10);
	if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
		throw new ValidationError("rating must be an integer between 1 and 5");
	}
	return parsedRating;
};

export const validateComment = (comment) => {
	if (typeof comment !== "string")
		throw new ValidationError("comment must be a string");
	const trimmedComment = comment.trim();
	if (trimmedComment.length === 0)
		throw new ValidationError("comment cannot be empty");
	if (trimmedComment.length > 1000)
		throw new ValidationError("comment must be at most 1000 characters");
	return trimmedComment;
};

export const sortReviews = (reviews, sortOption) => {
	if (!Array.isArray(reviews)) return reviews;

	// Create a copy to avoid mutating the original array
	const reviewsCopy = [...reviews];

	switch (sortOption) {
		case SORT_LEAST_RECENT:
			return reviewsCopy.sort(
				(a, b) => new Date(a.updated_at) - new Date(b.updated_at),
			);
		case SORT_HIGHEST_RATING:
			return reviewsCopy.sort((a, b) => b.rating - a.rating);
		case SORT_LOWEST_RATING:
			return reviewsCopy.sort((a, b) => a.rating - b.rating);
		default:
			return reviewsCopy.sort(
				(a, b) => new Date(b.updated_at) - new Date(a.updated_at),
			);
	}
};

export const calculateStoreAgeFunc = (grandOpenDate) => {
	if (!grandOpenDate) return "N/A";

	const grandOpen = new Date(grandOpenDate);
	const today = new Date();

	let years = today.getFullYear() - grandOpen.getFullYear();
	let months = today.getMonth() - grandOpen.getMonth();
	const days = today.getDate() - grandOpen.getDate();

	// Adjust months based on day difference
	if (days < 0) {
		months--; // day hasn't reached yet → month not completed
	}

	// Adjust years if month went negative
	if (months < 0) {
		years--;
		months += 12;
	}

	// Special cases
	if (years === 0 && months === 0) {
		return "Opened this month";
	}

	if (years === 0) {
		return `${months} month${months !== 1 ? "s" : ""} old`;
	}

	if (months === 0) {
		return `${years} year${years !== 1 ? "s" : ""} old`;
	}

	return `${years} year${years !== 1 ? "s" : ""}, ${months} month${months !== 1 ? "s" : ""} old`;
};
