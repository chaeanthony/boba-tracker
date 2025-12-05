import { ObjectId } from "mongodb";
import { userNotes } from "../config/mongoCollections.js";
import { validateComment, validateId } from "../helpers.js";

const getUserNoteForStore = async (userId, storeId) => {
	const valUserID = validateId(userId);
	const valStoreID = validateId(storeId);

	const notesCollection = await userNotes();

	const note = await notesCollection.findOne({
		user_id: new ObjectId(valUserID),
		store_id: new ObjectId(valStoreID),
	});

	if (!note) return null;

	note._id = note._id.toString();
	note.user_id = note.user_id.toString();
	note.store_id = note.store_id.toString();

	return note;
};

const upsertUserNoteForStore = async (storeId, userId, text) => {
	const valStoreID = validateId(storeId);
	const valUserID = validateId(userId);

	const trimmedText = validateComment(text);

	const notesCollection = await userNotes();

	const now = new Date();

	const filter = {
		store_id: new ObjectId(valStoreID),
		user_id: new ObjectId(valUserID),
	};

	const update = {
		$set: {
			text: trimmedText,
			updated_at: now,
		},
		$setOnInsert: {
			created_at: now,
		},
	};

	const result = await notesCollection.updateOne(filter, update, {
		upsert: true,
	});

	if (!result.acknowledged) {
		throw new Error("Could not save private note");
	}

	const saved = await notesCollection.findOne(filter);

	saved._id = saved._id.toString();
	saved.user_id = saved.user_id.toString();
	saved.store_id = saved.store_id.toString();

	return saved;
};

const getByUserId = async (userId) => {
	const valUserID = validateId(userId);

	const notesCollection = await userNotes();
	const notes = await notesCollection
		.find({ user_id: new ObjectId(valUserID) })
		.sort({ updated_at: -1 })
		.toArray();

	return notes.map((note) => {
		note._id = note._id.toString();
		note.user_id = note.user_id.toString();
		note.store_id = note.store_id.toString();
		return note;
	});
};

const exportedMethods = {
	getUserNoteForStore,
	upsertUserNoteForStore,
	getByUserId,
};

export default exportedMethods;
