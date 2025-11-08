import { closeConnection } from "../config/mongoConnection.js";
import { users, boba, reviews, userNotes } from "../config/mongoCollections.js";

const seedDatabase = async () => {
	console.log("Starting database seed...");

	const usersCollection = await users();
	const bobaCollection = await boba();
	const reviewsCollection = await reviews();
	const userNotesCollection = await userNotes();

	console.log("Dropping existing collections...");
	await usersCollection.drop().catch(() => console.log("Users collection didn't exist"));
	await bobaCollection.drop().catch(() => console.log("Boba collection didn't exist"));
	await reviewsCollection.drop().catch(() => console.log("Reviews collection didn't exist"));
	await userNotesCollection.drop().catch(() => console.log("User notes collection didn't exist"));
	console.log("Collections dropped");

	console.log("Creating indexes...");

	await usersCollection.createIndex({ username: 1 }, { unique: true });
	await usersCollection.createIndex({ email: 1 }, { unique: true });

	// want unique google_place_id for each store
	// sparse index allows multiple stores to have null google_place_id
	await bobaCollection.createIndex({ google_place_id: 1 }, { unique: true, sparse: true });

	// should only be one note per user per store
	await userNotesCollection.createIndex(
		{ user_id: 1, store_id: 1 },
		{ unique: true }
	);

	console.log("Indexes created");

	// Seed admin user
	console.log("Seeding users...");
	const adminUser = {
		username: "admin",
		email: "admin@bobatracker.com",
		display_name: "Admin User",
		is_admin: true,
		created_at: new Date(),
		updated_at: new Date(),
	};

	const adminResult = await usersCollection.insertOne(adminUser);
	console.log(`Admin user created with ID: ${adminResult.insertedId}`);

	console.log("Seeding boba stores...");

	const stores = [
		{
			google_place_id: "gong-cha-hoboken",
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
			google_place_id: "kung-fu-tea-hoboken",
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
			google_place_id: "the-whale-tea-hoboken",
			name: "The Whale Tea",
			address: {
				street: "303B 1st Street",
				city: "Hoboken",
				state: "NJ",
				zip: "07030",
			},
			location: {
				lat: 40.7398,
				lng: -74.0294,
			},
			website: null,
			grand_open_date: new Date("2022-09-01"),
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
		{
			google_place_id: "vivi-bubble-tea-hoboken",
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

	console.log("Database seeding completed!");
	console.log(`Total stores: ${await bobaCollection.countDocuments()}`);
	console.log(`Total users: ${await usersCollection.countDocuments()}`);

	await closeConnection();
};

seedDatabase().catch((error) => {
	console.error("Error seeding database:", error);
	process.exit(1);
});
