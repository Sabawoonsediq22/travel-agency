import Header from "../../../components/Header";
import TripCard from "../../../components/TripCard";
import {type LoaderFunctionArgs, useSearchParams} from "react-router";
import {getAllTrips} from "~/appwrite/trips";
import {parseTripData} from "~/lib/utils";
import type {Route} from './+types/trips'
import {useState} from "react";
import {Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious} from "@/components/ui/pagination";
import EmptyState from "../../../components/EmptyState";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const limit = 8;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || "1", 10);
    const offset = (page - 1) * limit;

    const { allTrips, total } = await getAllTrips(limit, offset);

    return {
        trips: allTrips.map(({ $id, tripDetails, imageUrls }) => ({
            id: $id,
            ...parseTripData(tripDetails),
            imageUrls: imageUrls ?? []
        })),
        total
    }
}

const Trips = ({ loaderData }: Route.ComponentProps) => {
    const trips = loaderData.trips as Trip[] | [];

    const [searchParams] = useSearchParams();
    const initialPage = Number(searchParams.get('page') || '1')

    const [currentPage, setCurrentPage] = useState(initialPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.location.search = `?page=${page}`
    }

    return (
        <main className="all-users wrapper fade-in">
            <Header
                title="Trips"
                description="View and edit AI-generated travel plans"
                ctaText="Create a trip"
                ctaUrl="/trips/create"
            />

            <section>
                <h1 className="p-24-semibold text-dark-100 mb-4">
                    Manage Created Trips
                </h1>

                {trips.length > 0 ? (
                    <>
                        <div className="trip-grid mb-4">
                            {trips.map((trip) => (
                                <TripCard
                                    key={trip.id}
                                    id={trip.id}
                                    name={trip.name}
                                    imageUrl={trip.imageUrls[0]}
                                    location={trip.itinerary?.[0]?.location ?? ""}
                                    tags={[trip.interests, trip.travelStyle]}
                                    price={trip.estimatedPrice}
                                />
                            ))}
                        </div>

                        <Pagination className="!mb-4">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage > 1) handlePageChange(currentPage - 1);
                                        }}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink
                                        href={`?page=${currentPage}`}
                                        isActive
                                    >
                                        {currentPage}
                                    </PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const totalPages = Math.ceil(loaderData.total / 8);
                                            if (currentPage < totalPages) handlePageChange(currentPage + 1);
                                        }}
                                        className={currentPage >= Math.ceil(loaderData.total / 8) ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </>
                ) : (
                    <EmptyState
                        title="No trips created yet"
                        description="Start by creating your first AI-generated travel itinerary."
                        icon="/assets/icons/itinerary.svg"
                        ctaText="Create a trip"
                        ctaUrl="/trips/create"
                    />
                )}
            </section>
        </main>
    )
}
export default Trips
