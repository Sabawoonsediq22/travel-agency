import Header from "../../../components/Header";
import StatsCard from "../../../components/StatsCard";
import TripCard from "../../../components/TripCard";
import {getAllUsers, getUser} from "~/appwrite/auth";
import type { Route } from './+types/dashboard';
import {getTripsByTravelStyle, getUserGrowthPerDay, getUsersAndTripsStats} from "~/appwrite/dashboard";
import {getAllTrips} from "~/appwrite/trips";
import {parseTripData} from "~/lib/utils";
import EmptyState from "../../../components/EmptyState";

export const clientLoader = async () => {
    const [
        user,
        dashboardStats,
        trips,
        userGrowth,
        tripsByTravelStyle,
        allUsers,
    ] = await Promise.all([
        await getUser(),
        await getUsersAndTripsStats(),
        await getAllTrips(4, 0),
        await getUserGrowthPerDay(),
        await getTripsByTravelStyle(),
        await getAllUsers(4, 0),
    ])

    const allTrips = trips.allTrips.map(({ $id, tripDetails, imageUrls }) => ({
        id: $id,
        ...parseTripData(tripDetails),
        imageUrls: imageUrls ?? []
    }))

    const mappedUsers: UsersItineraryCount[] = allUsers.users.map((user) => ({
        imageUrl: user.imageUrl,
        name: user.name,
        count: user.itineraryCount ?? Math.floor(Math.random() * 10),
    }))

    return {
        user,
        dashboardStats,
        allTrips,
        userGrowth,
        tripsByTravelStyle,
        allUsers: mappedUsers
    }
}


const Dashboard = ({ loaderData }: Route.ComponentProps) => {
    const user = loaderData.user as User | null;
    const { dashboardStats, allTrips, userGrowth, tripsByTravelStyle, allUsers } = loaderData;

    const trips = allTrips.map((trip) => ({
        imageUrl: trip.imageUrls[0],
        name: trip.name,
        interest: trip.interests,
    }))

    const usersAndTrips = [
        {
            title: 'Latest user signups',
            dataSource: allUsers,
            field: 'count',
            headerText: 'Trips created'
        },
        {
            title: 'Trips based on interests',
            dataSource: trips,
            field: 'interest',
            headerText: 'Interests'
        }
    ]

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <main className="dashboard wrapper fade-in">
            <div className="welcome-banner">
                <h1>Welcome back, {user?.name ?? 'Admin'} 👋</h1>
                <p>Here's what's happening with your travel agency today &mdash; {today}</p>
            </div>

            <section className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                    <StatsCard
                        headerTitle="Total Users"
                        total={dashboardStats.totalUsers}
                        currentMonthCount={dashboardStats.usersJoined.currentMonth}
                        lastMonthCount={dashboardStats.usersJoined.lastMonth}
                    />
                    <StatsCard
                        headerTitle="Total Trips"
                        total={dashboardStats.totalTrips}
                        currentMonthCount={dashboardStats.tripsCreated.currentMonth}
                        lastMonthCount={dashboardStats.tripsCreated.lastMonth}
                    />
                    <StatsCard
                        headerTitle="Active Users"
                        total={dashboardStats.userRole.total}
                        currentMonthCount={dashboardStats.userRole.currentMonth}
                        lastMonthCount={dashboardStats.userRole.lastMonth}
                    />
                </div>
            </section>

            <section className="container">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-dark-100">Created Trips</h1>
                    {allTrips.length > 0 && (
                        <a href="/trips" className="text-sm font-medium text-primary-100 hover:text-primary-500 transition-colors">
                            View all
                        </a>
                    )}
                </div>

                {allTrips.length > 0 ? (
                    <div className='trip-grid'>
                        {allTrips.map((trip) => (
                            <TripCard
                                key={trip.id}
                                id={trip.id.toString()}
                                name={trip.name!}
                                imageUrl={trip.imageUrls[0]}
                                location={trip.itinerary?.[0]?.location ?? ''}
                                tags={[trip.interests!, trip.travelStyle!]}
                                price={trip.estimatedPrice!}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No trips yet"
                        description="AI-generated trips will appear here once they are created."
                        icon="/assets/icons/itinerary.svg"
                    />
                )}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="dashboard-chart-card">
                    <h3>User Growth</h3>
                    <div className="flex items-end gap-1.5 h-44">
                        {userGrowth.length > 0 ? userGrowth.map((item: any, i: number) => {
                            const maxCount = Math.max(...userGrowth.map((u: any) => u.count));
                            const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                                    <span className="text-[10px] font-medium text-dark-200">{item.count}</span>
                                    <div className="w-full bg-primary-100/20 rounded-t-lg relative overflow-hidden" style={{ height: '100%' }}>
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-100 to-primary-50 rounded-t-lg transition-all duration-500"
                                            style={{ height: `${heightPercent}%` }}
                                        />
                                    </div>
                                    <span className="text-[11px] font-medium text-gray-100">{item.day}</span>
                                </div>
                            );
                        }) : (
                            <p className="text-gray-100 text-sm w-full text-center py-8">No growth data available</p>
                        )}
                    </div>
                </div>

                <div className="dashboard-chart-card">
                    <h3>Trip Trends</h3>
                    <div className="flex items-end gap-1.5 h-44">
                        {tripsByTravelStyle.length > 0 ? tripsByTravelStyle.map((item: any, i: number) => {
                            const maxCount = Math.max(...tripsByTravelStyle.map((t: any) => t.count));
                            const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                                    <span className="text-[10px] font-medium text-dark-200">{item.count}</span>
                                    <div className="w-full bg-success-700/10 rounded-t-lg relative overflow-hidden" style={{ height: '100%' }}>
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-success-700 to-success-500 rounded-t-lg transition-all duration-500"
                                            style={{ height: `${heightPercent}%` }}
                                        />
                                    </div>
                                    <span className="text-[11px] font-medium text-gray-100 truncate w-full text-center">{item.travelStyle}</span>
                                </div>
                            );
                        }) : (
                            <p className="text-gray-100 text-sm w-full text-center py-8">No trip trend data available</p>
                        )}
                    </div>
                </div>
            </section>

            <section className="user-trip">
                {usersAndTrips.map(({ title, dataSource, field, headerText}, i) => (
                    <div key={i} className="flex flex-col gap-4 bg-white rounded-xl p-5 shadow-300">
                        <h3 className="p-20-semibold text-dark-100">{title}</h3>

                        <div className="overflow-x-auto">
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>{headerText}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataSource.length > 0 ? dataSource.map((item: any, idx: number) => (
                                        <tr key={idx}>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <img src={item.imageUrl} alt={item.name} className="rounded-full size-8 aspect-square" referrerPolicy="no-referrer" />
                                                    <span className="font-medium text-dark-100">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="text-dark-200">{item[field]}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={2} className="text-center text-gray-100 py-8">No data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </section>
        </main>
    )
}
export default Dashboard
