import { boba, reviews, userNotes, users } from "../config/mongoCollections.js";
import { closeConnection } from "../config/mongoConnection.js";

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
	await usersCollection.insertOne({
		email: "admin@bobatracker.com",
		display_name: "Admin User",
		is_admin: true,
		created_at: new Date(),
		updated_at: new Date(),
	});

	const testUser1 = {
		email: "test@bobatracker.com",
		display_name: "Test User 1",
		is_admin: false,
		created_at: new Date(),
		updated_at: new Date(),
	};
	const testUser1Result = await usersCollection.insertOne(testUser1);
	console.log(`Inserted test user 1 with ID: ${testUser1Result.insertedId}`);

	const testUser2 = {
		email: "test2@bobatracker.com",
		display_name: "Test User 2",
		is_admin: false,
		created_at: new Date(),
		updated_at: new Date(),
	};
	const testUser2Result = await usersCollection.insertOne(testUser2);
	console.log(`Inserted test user 2 with ID: ${testUser2Result.insertedId}`);

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
				popularity_score: 0,
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
				popularity_score: 0,
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
				popularity_score: 0,
				trending_score: 0,
				updated_at: new Date(),
			},
			created_at: new Date(),
			updated_at: new Date(),
		},
	];

	const storesResult = await bobaCollection.insertMany(stores);
	console.log(`Inserted ${storesResult.insertedCount} stores`);

	const gongChaId = storesResult.insertedIds[0];
	const kungFuTeaId = storesResult.insertedIds[1];

	console.log("Seeding reviews...");

	const reviewsData = [
		{
			store_id: gongChaId,
			user_id: testUser1Result.insertedId,
			rating: 3,
			comment: "Good boba",
			created_at: new Date("2024-01-15"),
			updated_at: new Date("2024-01-15"),
		},
		{
			store_id: gongChaId,
			user_id: testUser1Result.insertedId,
			rating: 4,
			comment: "unique tea flavor",
			created_at: new Date("2024-02-10"),
			updated_at: new Date("2024-02-10"),
		},
		{
			store_id: gongChaId,
			user_id: testUser1Result.insertedId,
			rating: 4,
			comment: "nice",
			created_at: new Date("2024-03-05"),
			updated_at: new Date("2024-03-05"),
		},
		{
			store_id: gongChaId,
			user_id: testUser1Result.insertedId,
			rating: 5,
			comment: "yummy",
			created_at: new Date("2024-04-20"),
			updated_at: new Date("2024-04-20"),
		},
		{
			store_id: gongChaId,
			user_id: testUser2Result.insertedId,
			rating: 4,
			comment: "good",
			created_at: new Date("2024-05-12"),
			updated_at: new Date("2024-05-12"),
		},
		// Kung Fu Tea review (1 review, 4.5)
		{
			store_id: kungFuTeaId,
			user_id: testUser1Result.insertedId,
			rating: 4.5,
			comment: "cool drinks",
			created_at: new Date("2024-03-22"),
			updated_at: new Date("2024-03-22"),
		},
	];

	const reviewsResult = await reviewsCollection.insertMany(reviewsData);
	console.log(`Inserted ${reviewsResult.insertedCount} reviews`);

	// Update store stats based on reviews
	await bobaCollection.updateOne(
		{ _id: gongChaId },
		{
			$set: {
				"stats.avg_rating": 4.0,
				"stats.n_ratings": 5,
				"stats.updated_at": new Date(),
			},
		},
	);

	await bobaCollection.updateOne(
		{ _id: kungFuTeaId },
		{
			$set: {
				"stats.avg_rating": 4.5,
				"stats.n_ratings": 1,
				"stats.updated_at": new Date(),
			},
		},
	);

	console.log("Updated store stats");

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
