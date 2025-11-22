import { ObjectId } from "mongodb";
import { boba, reviews } from "../config/mongoCollections.js";

// used to weight recent reviews more heavily
const TRENDING_WINDOW_DAYS = 15;

/**
 * Updates store's avg_rating and n_ratings
 */
export const updateStoreStats = async (storeId) => {
    const bobaCollection = await boba();
    const reviewsCollection = await reviews();

    const storeObjectId =
        typeof storeId === "string" ? new ObjectId(storeId) : storeId;

    const storeReviews = await reviewsCollection
        .find({ store_id: storeObjectId })
        .toArray();

    const n = storeReviews.length;
    const avgRating =
        n > 0 ? storeReviews.reduce((sum, r) => sum + r.rating, 0) / n : 0;

    await bobaCollection.updateOne(
        { _id: storeObjectId },
        {
            $set: {
                "stats.avg_rating": Math.round(avgRating * 100) / 100,
                "stats.n_ratings": n,
                "stats.updated_at": new Date(),
            },
        }
    );
};

/**
 * Calculate trending scores for ALL stores based on recent activity.
 * Formula: trending = recent_count × recent_avg_rating
 * Run on a cron job
 */
export const calculateTrendingScores = async () => {
    const bobaCollection = await boba();
    const reviewsCollection = await reviews();

    const cutoffDate = new Date(
        Date.now() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000
    );

    const stores = await bobaCollection.find({}).toArray();

    for (const store of stores) {
        const recentReviews = await reviewsCollection
            .find({
                store_id: store._id,
                created_at: { $gte: cutoffDate },
            })
            .toArray();

        const recentCount = recentReviews.length;
        const recentAvg =
            recentCount > 0
                ? recentReviews.reduce((sum, r) => sum + r.rating, 0) /
                  recentCount
                : 0;

        const trendingScore = recentCount * recentAvg;

        await bobaCollection.updateOne(
            { _id: store._id },
            {
                $set: {
                    "stats.trending_score":
                        Math.round(trendingScore * 100) / 100,
                    "stats.updated_at": new Date(),
                },
            }
        );
    }
};
