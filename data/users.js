import { ObjectId } from "mongodb";
import { users } from "../config/mongoCollections.js";
import { NotFoundError, ValidationError } from "../errors.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createUser = async (email, passwordHash) => {
	// normalize and validate email
	if (typeof email !== "string")
		throw new ValidationError("email must be a non-empty string");
	const normalizedEmail = email.trim().toLowerCase();
	if (normalizedEmail.length === 0)
		throw new ValidationError("email must be a non-empty string");
	if (!emailRegex.test(normalizedEmail))
		throw new ValidationError("email must be a valid email address");

	if (typeof passwordHash !== "string")
		throw new ValidationError("passwordHash must be provided");
	if (passwordHash.trim().length === 0)
		throw new ValidationError("passwordHash must be provided");

	const usersCollection = await users();

	// Check for duplicate
	const existing = await usersCollection.findOne({
		email: normalizedEmail,
	});
	if (existing) {
		throw new ValidationError("A user with that email already exists");
	}

	const newUser = {
		email: normalizedEmail,
		passwordHash,
		createdAt: new Date(),
	};

	const result = await usersCollection.insertOne(newUser);

	if (!result.acknowledged || !result.insertedId) {
		throw new Error("Could not create user");
	}

	newUser._id = result.insertedId.toString();

	return {
		_id: newUser._id,
		email: newUser.email,
		createdAt: newUser.createdAt,
	};
};

const getUserByEmail = async (email) => {
	if (typeof email !== "string")
		throw new ValidationError("email must be provided");
	const normalizedEmail = email.trim().toLowerCase();
	if (normalizedEmail.length === 0)
		throw new ValidationError("email must be provided");
	if (!emailRegex.test(normalizedEmail))
		throw new ValidationError("email must be a valid email address");

	const usersCollection = await users();
	const user = await usersCollection.findOne({ email: normalizedEmail });
	if (!user) throw new NotFoundError("User not found");
	user._id = user._id.toString();
	return user;
};

const getUserById = async (id) => {
	// validate and normalize id string
	if (typeof id !== "string") throw new ValidationError("invalid ID provided");
	const trimmedId = id.trim();
	if (trimmedId.length === 0) throw new ValidationError("invalid ID provided");
	if (!ObjectId.isValid(trimmedId))
		throw new ValidationError("invalid ID provided");

	const usersCollection = await users();
	const user = await usersCollection.findOne({ _id: new ObjectId(trimmedId) });
	if (!user) throw new NotFoundError("User not found");
	user._id = user._id.toString();
	return user;
};

const exportedMethods = {
	createUser,
	getUserByEmail,
	getUserById,
};

export default exportedMethods;
