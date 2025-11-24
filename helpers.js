import { ObjectId } from "mongodb";
import { ValidationError } from "./errors.js";

// Constants
export const MAX_EMAIL_LENGTH = 50;
export const MAX_DISPLAY_NAME_LENGTH = 20;
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 20;
// Review sort options
export const VALID_REVIEW_SORTS = [
	"most_recent",
	"least_recent",
	"highest_rating",
	"lowest_rating",
];
export const VALID_STORE_SORTS = [
	"highest_rated",
	"trending",
	"most_reviews",
	"newest",
];

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
