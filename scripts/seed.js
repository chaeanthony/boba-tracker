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
			grand_open_date: new Date("2019-08-18"),
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
			grand_open_date: new Date("2023-05-15"),
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
			grand_open_date: new Date("2025-02-25"),
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
		{
			name: "Bubble Bliss",
			address: {
				street: "14 Grove Street",
				city: "Jersey City",
				state: "NJ",
				zip: "07302",
			},
			location: {
				lat: 40.7209,
				lng: -74.0436,
			},
			website: "https://bubbleblissjc.com",
			grand_open_date: new Date("2021-04-10"),
			tags: {
				non_dairy: true,
				gluten_free: true,
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
			name: "Tea Orbit",
			address: {
				street: "88 Newark Street",
				city: "Hoboken",
				state: "NJ",
				zip: "07030",
			},
			location: {
				lat: 40.7371,
				lng: -74.0306,
			},
			website: "https://teaorbitnj.com",
			grand_open_date: new Date("2020-09-15"),
			tags: {
				non_dairy: false,
				gluten_free: true,
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
			name: "Honeydew Haven",
			address: {
				street: "301 Bloomfield Avenue",
				city: "Montclair",
				state: "NJ",
				zip: "07042",
			},
			location: {
				lat: 40.8132,
				lng: -74.2196,
			},
			website: "https://honeydewhaven.com",
			grand_open_date: new Date("2022-01-22"),
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
			name: "Maple Moon Tea House",
			address: {
				street: "52 East Ridgewood Avenue",
				city: "Ridgewood",
				state: "NJ",
				zip: "07450",
			},
			location: {
				lat: 40.9793,
				lng: -74.1196,
			},
			website: "https://maplemoontea.com",
			grand_open_date: new Date("2018-06-30"),
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

		{
			name: "Boba Boulevard",
			address: {
				street: "190 Route 17 South",
				city: "Paramus",
				state: "NJ",
				zip: "07652",
			},
			location: {
				lat: 40.9382,
				lng: -74.0703,
			},
			website: "https://bobablvd.com",
			grand_open_date: new Date("2017-11-05"),
			tags: {
				non_dairy: true,
				gluten_free: true,
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
			name: "Pearl Potion",
			address: {
				street: "230 Main Street",
				city: "Fort Lee",
				state: "NJ",
				zip: "07024",
			},
			location: {
				lat: 40.8509,
				lng: -73.9701,
			},
			website: "https://pearlpotiontea.com",
			grand_open_date: new Date("2023-03-12"),
			tags: {
				non_dairy: false,
				gluten_free: true,
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
			name: "Urban Steeps",
			address: {
				street: "75 Church Street",
				city: "New Brunswick",
				state: "NJ",
				zip: "08901",
			},
			location: {
				lat: 40.4932,
				lng: -74.4442,
			},
			website: "https://urbansteepsnb.com",
			grand_open_date: new Date("2016-08-01"),
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
			name: "Tea Tonic Lab",
			address: {
				street: "412 Valley Road",
				city: "Clifton",
				state: "NJ",
				zip: "07013",
			},
			location: {
				lat: 40.8594,
				lng: -74.1615,
			},
			website: "https://teatoniclab.com",
			grand_open_date: new Date("2020-02-19"),
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

		{
			name: "Mocha Motea",
			address: {
				street: "102 South Street",
				city: "Morristown",
				state: "NJ",
				zip: "07960",
			},
			location: {
				lat: 40.7962,
				lng: -74.48,
			},
			website: "https://mochamotea.com",
			grand_open_date: new Date("2019-10-04"),
			tags: {
				non_dairy: true,
				gluten_free: true,
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
			name: "Cloud Cup Tea Co.",
			address: {
				street: "58 Quimby Street",
				city: "Westfield",
				state: "NJ",
				zip: "07090",
			},
			location: {
				lat: 40.6528,
				lng: -74.3475,
			},
			website: "https://cloudcupteaco.com",
			grand_open_date: new Date("2021-07-17"),
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
			name: "Velvet Sip",
			address: {
				street: "29 Kings Highway East",
				city: "Haddonfield",
				state: "NJ",
				zip: "08033",
			},
			location: {
				lat: 39.8978,
				lng: -75.031,
			},
			website: "https://velvetsip.com",
			grand_open_date: new Date("2018-03-21"),
			tags: {
				non_dairy: false,
				gluten_free: true,
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
			name: "Brew’d Bubbles",
			address: {
				street: "5 Washington Avenue",
				city: "Dunellen",
				state: "NJ",
				zip: "08812",
			},
			location: {
				lat: 40.589,
				lng: -74.471,
			},
			website: "https://brewd-bubbles.com",
			grand_open_date: new Date("2022-11-05"),
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
	];

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
			displayName: "BobaLover123",
			rating: 3,
			comment: "delicious!",
			created_at: daysAgo(1),
			updated_at: daysAgo(1),
		},
		{
			store_id: gongChaId,
			user_id: user1Id,
			displayName: "Boba Cat",
			rating: 4,
			comment: "great stuff",
			created_at: daysAgo(3),
			updated_at: daysAgo(3),
		},
		{
			store_id: gongChaId,
			user_id: user2Id,
			displayName: "Boba Dude",
			rating: 5,
			comment: "great boba!",
			created_at: daysAgo(5),
			updated_at: daysAgo(5),
		},
		{
			store_id: gongChaId,
			user_id: user1Id,
			displayName: "Bubble Tea Fan",
			rating: 4,
			comment: "good stuff",
			created_at: daysAgo(7),
			updated_at: daysAgo(7),
		},
		{
			store_id: gongChaId,
			user_id: user2Id,
			displayName: "Bubbler",
			rating: 2,
			comment: "not great",
			created_at: daysAgo(10),
			updated_at: daysAgo(10),
		},
		{
			store_id: gongChaId,
			user_id: user1Id,
			displayName: "Boy in the Bubble",
			rating: 4,
			comment: "really good",
			created_at: daysAgo(14),
			updated_at: daysAgo(14),
		},
		{
			store_id: gongChaId,
			user_id: user2Id,
			displayName: "Boba Enthusiast",
			rating: 1,
			comment: "bad experience",
			created_at: daysAgo(20),
			updated_at: daysAgo(20),
		},
		{
			store_id: gongChaId,
			user_id: user1Id,
			displayName: "LuvBoba",
			rating: 4,
			comment: "pretty good",
			created_at: daysAgo(25),
			updated_at: daysAgo(25),
		},

		// Kung Fu Tea
		{
			store_id: kungFuTeaId,
			user_id: user1Id,
			displayName: "Boba Fanatic",
			rating: 4,
			comment: "loved it",
			created_at: daysAgo(2),
			updated_at: daysAgo(2),
		},
		{
			store_id: kungFuTeaId,
			user_id: user2Id,
			displayName: "Boba Gal 123",
			rating: 3,
			comment: "it was ok",
			created_at: daysAgo(8),
			updated_at: daysAgo(8),
		},
		{
			store_id: kungFuTeaId,
			user_id: user1Id,
			displayName: "Bubbleroo",
			rating: 4,
			comment: "nice place",
			created_at: daysAgo(15),
			updated_at: daysAgo(15),
		},

		// Vivi Bubble Tea
		{
			store_id: viviId,
			user_id: user2Id,
			displayName: "Boba Guy",
			rating: 3,
			comment: "it was fine",
			created_at: daysAgo(4),
			updated_at: daysAgo(4),
		},
		{
			store_id: viviId,
			user_id: user1Id,
			displayName: "Boba Boba Boba",
			rating: 4,
			comment: "really good",
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
