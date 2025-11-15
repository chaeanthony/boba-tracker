import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { users } from "../config/mongoCollections.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { validateEmail, validateId } from "../helpers.js";

// Salt is a random string added to the password before hashing. Its purpose is to ensure that identical passwords result in different hashes, and more
const SALT_ROUNDS = 10;

const createUser = async (email, password) => {
	// normalize and validate email
	const normalizedEmail = validateEmail(email);
	const trimmedPassword = password.trim();
	const passwordHash = await bcrypt.hash(trimmedPassword, SALT_ROUNDS);
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
	const normalizedEmail = validateEmail(email);

	const usersCollection = await users();
	const user = await usersCollection.findOne({ email: normalizedEmail });
	if (!user) throw new NotFoundError("User not found");
	user._id = user._id.toString();
	return user;
};

const getUserById = async (id) => {
	// validate and normalize id string
	const trimmedId = validateId(id);

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
