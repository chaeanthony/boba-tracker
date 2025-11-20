import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { users } from "../config/mongoCollections.js";
import { NotFoundError, ValidationError } from "../errors.js";
import {
	validateDisplayName,
	validateEmail,
	validateId,
	validatePassword,
} from "../helpers.js";

// Salt is a random string added to the password before hashing. Its purpose is to ensure that identical passwords result in different hashes, and more
const SALT_ROUNDS = 10;

const createUser = async (email, password, displayName) => {
	// normalize and validate email and password
	const normalizedEmail = validateEmail(email);
	const trimmedPassword = validatePassword(password);
	const trimmedDisplayName = validateDisplayName(displayName);
	const passwordHash = await bcrypt.hash(trimmedPassword, SALT_ROUNDS);

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
		displayName: trimmedDisplayName,
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
		display_name: newUser.displayName,
		created_at: newUser.createdAt,
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
