import { ObjectId } from "mongodb";
import { boba, reviews, userNotes, users } from "../config/mongoCollections.js";
import { closeConnection } from "../config/mongoConnection.js";
import { calculateTrendingScores, updateStoreStats } from "../data/scores.js";
import usersService from "../data/users.js";

const seedDatabase = async () => {
	console.log("Starting database seed...");

	const usersCollection = await users();
	const bobaCollection = await boba();
	const reviewsCollection = await reviews();
	const userNotesCollection = await userNotes();

	console.log("Dropping existing collections...");
	await usersCollection
		.drop()
		.catch(() => console.log("Users collection didn't exist"));
	await bobaCollection
		.drop()
		.catch(() => console.log("Boba collection didn't exist"));
	await reviewsCollection
		.drop()
		.catch(() => console.log("Reviews collection didn't exist"));
	await userNotesCollection
		.drop()
		.catch(() => console.log("User notes collection didn't exist"));
	console.log("Collections dropped");

	console.log("Creating indexes...");

	await usersCollection.createIndex({ email: 1 }, { unique: true });

	// should only be one note per user per store
	await userNotesCollection.createIndex(
		{ user_id: 1, store_id: 1 },
		{ unique: true },
	);

	console.log("Indexes created");

	console.log("Seeding users...");
	const adminUser = await usersService.createUser(
		"admin@bobatracker.com",
		"password",
		"Admin User",
	);
	console.log(`Inserted admin user with ID: ${adminUser._id}`);

	const testUser1 = await usersService.createUser(
		"test@bobatracker.com",
		"password",
		"Test User 1",
	);
	console.log(`Inserted test user 1 with ID: ${testUser1._id}`);

	const testUser2 = await usersService.createUser(
		"test2@bobatracker.com",
		"password",
		"Test User 2",
	);
	console.log(`Inserted test user 2 with ID: ${testUser2._id}`);

	console.log("Seeding boba stores...");

	const stores = [
		{
			name: "Gong Cha",
			address: {
				street: "527 Washington Street",
				city: "Hoboken",
				state: "NJ",
				zip: "07030",
			},
			location: {
				lat: 40.7439,
				lng: -74.0293,
			},
			website: "https://gongchausa.com/nj-hoboken/",
			grand_open_date: null,
			tags: {
				non_dairy: true,
				gluten_free: false,
			},
			stats: {
				avg_rating: 0,
				n_ratings: 0,
				trending_score: 0,
				updated_at: new Date(),
			},
			created_at: new Date(),
			updated_at: new Date(),
		},
		{
			name: "Kung Fu Tea",
			address: {
				street: "536 Washington Street",
				city: "Hoboken",
				state: "NJ",
				zip: "07030",
			},
			location: {
				lat: 40.7441,
				lng: -74.0295,
			},
			website: "https://www.kungfutea.com/",
			grand_open_date: null,
			tags: {
				non_dairy: true,
				gluten_free: false,
			},
			stats: {
				avg_rating: 0,
				n_ratings: 0,
				trending_score: 0,
				updated_at: new Date(),
			},
			created_at: new Date(),
			updated_at: new Date(),
		},
		{
			name: "Vivi Bubble Tea",
			address: {
				street: "117 Washington Street",
				city: "Hoboken",
				state: "NJ",
				zip: "07030",
			},
			location: {
				lat: 40.7366,
				lng: -74.0291,
			},
			website: null,
			grand_open_date: null,
			tags: {
				non_dairy: false,
				gluten_free: false,
			},
			stats: {
				avg_rating: 0,
				n_ratings: 0,
				trending_score: 0,
				updated_at: new Date(),
			},
			created_at: new Date(),
			updated_at: new Date(),
		},
	];

	// Generate 12 additional test stores to reach 15 total
	for (let i = 1; i <= 12; i++) {
		stores.push({
			name: `Test Store ${i}`,
			stats: {
				avg_rating: 0,
				n_ratings: 0,
				trending_score: 0,
				updated_at: new Date(),
			},
			created_at: new Date(),
			updated_at: new Date(),
		});
	}

	const storesResult = await bobaCollection.insertMany(stores);
	console.log(`Inserted ${storesResult.insertedCount} stores`);

	const gongChaId = storesResult.insertedIds[0];
	const kungFuTeaId = storesResult.insertedIds[1];
	const viviId = storesResult.insertedIds[2];

	console.log("Seeding reviews...");

	const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

	const user1Id = new ObjectId(testUser1._id);
	const user2Id = new ObjectId(testUser2._id);

	const reviewsData = [
		// Gong Cha
		{
			store_id: gongChaId,
			user_id: user1Id,
			rating: 5,
			comment: "delicious!",
			created_at: daysAgo(1),
			updated_at: daysAgo(1),
		},
		{
			store_id: gongChaId,
			user_id: user1Id,
			rating: 4,
			comment: "great stuff",
			created_at: daysAgo(3),
			updated_at: daysAgo(3),
		},
		{
			store_id: gongChaId,
			user_id: user2Id,
			rating: 5,
			created_at: daysAgo(5),
			updated_at: daysAgo(5),
		},
		{
			store_id: gongChaId,
			user_id: user1Id,
			rating: 4,
			created_at: daysAgo(7),
			updated_at: daysAgo(7),
		},
		{
			store_id: gongChaId,
			user_id: user2Id,
			rating: 5,
			created_at: daysAgo(10),
			updated_at: daysAgo(10),
		},
		{
			store_id: gongChaId,
			user_id: user1Id,
			rating: 4,
			created_at: daysAgo(14),
			updated_at: daysAgo(14),
		},
		{
			store_id: gongChaId,
			user_id: user2Id,
			rating: 5,
			created_at: daysAgo(20),
			updated_at: daysAgo(20),
		},
		{
			store_id: gongChaId,
			user_id: user1Id,
			rating: 4,
			created_at: daysAgo(25),
			updated_at: daysAgo(25),
		},

		// Kung Fu Tea
		{
			store_id: kungFuTeaId,
			user_id: user1Id,
			rating: 4,
			created_at: daysAgo(2),
			updated_at: daysAgo(2),
		},
		{
			store_id: kungFuTeaId,
			user_id: user2Id,
			rating: 3,
			created_at: daysAgo(8),
			updated_at: daysAgo(8),
		},
		{
			store_id: kungFuTeaId,
			user_id: user1Id,
			rating: 4,
			created_at: daysAgo(15),
			updated_at: daysAgo(15),
		},

		// Vivi Bubble Tea
		{
			store_id: viviId,
			user_id: user2Id,
			rating: 3,
			created_at: daysAgo(4),
			updated_at: daysAgo(4),
		},
		{
			store_id: viviId,
			user_id: user1Id,
			rating: 2,
			created_at: daysAgo(12),
			updated_at: daysAgo(12),
		},
	];

	const reviewsResult = await reviewsCollection.insertMany(reviewsData);
	console.log(`Inserted ${reviewsResult.insertedCount} reviews`);

	console.log("Updating store stats...");
	await updateStoreStats(gongChaId);
	await updateStoreStats(kungFuTeaId);
	await updateStoreStats(viviId);

	console.log("Calculating trending scores...");
	await calculateTrendingScores();

	console.log("Database seeding completed!");
	console.log(`Total stores: ${await bobaCollection.countDocuments()}`);
	console.log(`Total users: ${await usersCollection.countDocuments()}`);
	console.log(`Total reviews: ${await reviewsCollection.countDocuments()}`);

	await closeConnection();
};

seedDatabase().catch((error) => {
	console.error("Error seeding database:", error);
	process.exit(1);
});
