import { ObjectId } from "mongodb";
import { ValidationError } from "./errors.js";

export const validateEmail = (email) => {
	if (typeof email !== "string")
		throw new ValidationError("email must be a non-empty string");
	const normalizedEmail = email.trim().toLowerCase();
	if (normalizedEmail.length === 0)
		throw new ValidationError("email must be a non-empty string");

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(normalizedEmail))
		throw new ValidationError("email must be a valid email address");

	return normalizedEmail;
};

export const validateId = (id) => {
	if (typeof id !== "string") throw new ValidationError("invalid ID provided");
	const trimmedId = id.trim();
	if (trimmedId.length === 0) throw new ValidationError("invalid ID provided");
	if (!ObjectId.isValid(trimmedId))
		throw new ValidationError("invalid ID provided");

	return trimmedId;
};

export const validatePassword = (password) => {
	if (typeof password !== "string")
		throw new ValidationError("password must be a non-empty string");
	const trimmedPassword = password.trim();
	if (trimmedPassword.length < 6)
		throw new ValidationError("password must be at least 6 characters long");

	return trimmedPassword;
};
