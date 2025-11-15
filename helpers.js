export const emailCheck = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (typeof email !== "string")
		throw new ValidationError("email must be a non-empty string");
	const normalizedEmail = email.trim().toLowerCase();
	if (normalizedEmail.length === 0)
		throw new ValidationError("email must be a non-empty string");
	if (!emailRegex.test(normalizedEmail))
		throw new ValidationError("email must be a valid email address");
};

export const idCheck = (id) => {
	if (typeof id !== "string") throw new ValidationError("invalid ID provided");
	const trimmedId = id.trim();
	if (trimmedId.length === 0) throw new ValidationError("invalid ID provided");
	if (!ObjectId.isValid(trimmedId))
		throw new ValidationError("invalid ID provided");
};
