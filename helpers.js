import { ObjectId } from "mongodb";
import { ValidationError } from "./errors.js";

export const validateEmail = (email) => {
	if (typeof email !== "string")
		throw new ValidationError("Email must be a non-empty string");
	const normalizedEmail = email.trim().toLowerCase();
	if (normalizedEmail.length === 0)
		throw new ValidationError("Email must be a non-empty string");

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
	if (trimmedPassword.length < 6)
		throw new ValidationError("Password must be at least 6 characters long");

	return trimmedPassword;
};
