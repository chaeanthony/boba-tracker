import { ValidationError } from "./errors.js";
import { ObjectId } from "mongodb";

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
    if (typeof id !== "string")
        throw new ValidationError("invalid ID provided");
    const trimmedId = id.trim();
    if (trimmedId.length === 0)
        throw new ValidationError("invalid ID provided");
    if (!ObjectId.isValid(trimmedId))
        throw new ValidationError("invalid ID provided");

    return trimmedId;
};
