import { parseTripData } from "~/lib/utils";
import { getDatabase, appwriteConfig } from "./client";

interface Document {
    [key: string]: any;
}

type FilterByDate = (
    items: Document[],
    key: string,
    start: string,
    end?: string
) => number;

export const getUsersAndTripsStats = async (): Promise<DashboardStats> => {
    const d = new Date();
    const startCurrent = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
    const startPrev = new Date(d.getFullYear(), d.getMonth() -1, 1).toISOString();
    const endPrev = new Date(d.getFullYear(), d.getMonth(), 0).toISOString();

    try {
        const [users, trips] = await Promise.all([
            getDatabase().listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId
            ),
            getDatabase().listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.tripCollectionId
            ),
        ])

        const filterByDate: FilterByDate = (items, key, start, end) => items.filter((item) => (
            item[key] >= start && (!end || item[key] <= end)
        )).length;

        const filterUsersByRole = (role: string) => {
            return users.documents.filter((u: Document) => u.status === role)
        }

        return {
            totalUsers: users.total,
            usersJoined: {
                currentMonth: filterByDate(
                    users.documents,
                    'joinedAt',
                    startCurrent,
                    undefined
                ),
                lastMonth: filterByDate(
                    users.documents,
                    'joinedAt',
                    startPrev,
                    endPrev
                )
            },
            userRole: {
                total: filterUsersByRole('user').length,
                currentMonth: filterByDate(
                    filterUsersByRole('user'),
                    'joinedAt',
                    startCurrent,
                    undefined
                ),
                lastMonth: filterByDate(
                    filterUsersByRole('user'),
                    'joinedAt',
                    startPrev,
                    endPrev
                )
            },
            totalTrips: trips.total,
            tripsCreated: {
                currentMonth: filterByDate(
                    trips.documents,
                    'createdAt',
                    startCurrent,
                    undefined
                ),
                lastMonth: filterByDate(
                    trips.documents,
                    'createdAt',
                    startPrev,
                    endPrev
                )
            },
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            totalUsers: 0,
            usersJoined: { currentMonth: 0, lastMonth: 0 },
            userRole: { total: 0, currentMonth: 0, lastMonth: 0 },
            totalTrips: 0,
            tripsCreated: { currentMonth: 0, lastMonth: 0 },
        }
    }
}

export const getUserGrowthPerDay = async () => {
    try {
        const users = await getDatabase().listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId
        );

        const userGrowth = users.documents.reduce(
            (acc: { [key: string]: number }, user: Document) => {
                const date = new Date(user.joinedAt);
                const day = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                });
                acc[day] = (acc[day] || 0) + 1;
                return acc;
            },
            {}
        );

        return Object.entries(userGrowth).map(([day, count]) => ({
            count: Number(count),
            day,
        }));
    } catch (error) {
        console.error('Error fetching user growth:', error);
        return [];
    }
};

export const getTripsCreatedPerDay = async () => {
    try {
        const trips = await getDatabase().listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId
        );

        const tripsGrowth = trips.documents.reduce(
            (acc: { [key: string]: number }, trip: Document) => {
                const date = new Date(trip.createdAt);
                const day = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                });
                acc[day] = (acc[day] || 0) + 1;
                return acc;
            },
            {}
        );

        return Object.entries(tripsGrowth).map(([day, count]) => ({
            count: Number(count),
            day,
        }));
    } catch (error) {
        console.error('Error fetching trips created per day:', error);
        return [];
    }
};

export const getTripsByTravelStyle = async () => {
    try {
        const trips = await getDatabase().listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId
        );

        const travelStyleCounts = trips.documents.reduce(
            (acc: { [key: string]: number }, trip: Document) => {
                const tripDetail = parseTripData(trip.tripDetails);

                if (tripDetail && tripDetail.travelStyle) {
                    const travelStyle = tripDetail.travelStyle;
                    acc[travelStyle] = (acc[travelStyle] || 0) + 1;
                }
                return acc;
            },
            {}
        );

        return Object.entries(travelStyleCounts).map(([travelStyle, count]) => ({
            count: Number(count),
            travelStyle,
        }));
    } catch (error) {
        console.error('Error fetching trips by travel style:', error);
        return [];
    }
};
