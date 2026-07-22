import {appwriteConfig, getDatabase} from "~/appwrite/client";
import {Query} from "appwrite";

export const getAllTrips = async (limit: number, offset: number) => {
    try {
        const allTrips = await getDatabase().listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            [Query.limit(limit), Query.offset(offset), Query.orderDesc('createdAt')]
        )

        if(allTrips.total === 0) {
            console.error('No trips found');
            return { allTrips: [], total: 0 }
        }

        return {
            allTrips: allTrips.documents,
            total: allTrips.total,
        }
    } catch (error) {
        console.error('Error fetching trips:', error);
        return { allTrips: [], total: 0 }
    }
}

export const getTripById = async (tripId: string) => {
    try {
        const trip = await getDatabase().getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            tripId
        );

        if(!trip.$id) {
            console.log('Trip not found')
            return null;
        }

        return trip;
    } catch (error) {
        console.error('Error fetching trip:', error);
        return null;
    }
}