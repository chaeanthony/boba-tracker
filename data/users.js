import { ObjectId } from "mongodb";
import { users } from "../config/mongoCollections.js";
import { ValidationError, NotFoundError } from "../errors.js";

const createUser = async (email, passwordHash) => {
    if (!email || typeof email !== 'string') throw new ValidationError('email must be a non-empty string');
    if (!passwordHash || typeof passwordHash !== 'string') throw new ValidationError('passwordHash must be provided');

    const usersCollection = await users();

    // Check for duplicate
    const existing = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existing) {
        throw new ValidationError('A user with that email already exists');
    }

    const newUser = {
        email: email.toLowerCase(),
        passwordHash,
        createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    if (!result.acknowledged) throw new Error('Could not create user');

    newUser._id = result.insertedId.toString();

    return { _id: newUser._id, email: newUser.email, createdAt: newUser.createdAt };
};

const getUserByEmail = async (email) => {
    if (!email || typeof email !== 'string') throw new ValidationError('email must be provided');

    const usersCollection = await users();
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    if (!user) return null;
    user._id = user._id.toString();
    return user;
};

const getUserById = async (id) => {
    if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) throw new ValidationError('invalid ID provided');
    const usersCollection = await users();
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!user) throw new NotFoundError('User not found');
    user._id = user._id.toString();
    return user;
};

const exportedMethods = {
    createUser,
    getUserByEmail,
    getUserById,
};

export default exportedMethods