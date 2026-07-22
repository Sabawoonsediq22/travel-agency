import Header from "../../../components/Header";
import {cn, formatDate} from "~/lib/utils";
import {getAllUsers} from "~/appwrite/auth";
import type {Route} from "./+types/all-users"

export const loader = async () => {
    const { users, total } = await getAllUsers(10, 0);

    return { users, total };
}

const AllUsers = ({ loaderData }: Route.ComponentProps) => {
    const { users } = loaderData as unknown as { users: UserData[]; total: number };

    return (
        <main className="all-users wrapper">
            <Header
                title="Manage Users"
                description="Filter, sort, and access detailed user profiles"
            />

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-light-200">
                            <th className="text-left p-4 font-medium text-dark-100">Name</th>
                            <th className="text-left p-4 font-medium text-dark-100">Email Address</th>
                            <th className="text-left p-4 font-medium text-dark-100">Date Joined</th>
                            <th className="text-left p-4 font-medium text-dark-100">Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user: UserData) => (
                            <tr key={user.$id} className="border-b border-light-200 hover:bg-light-300/50">
                                <td className="p-4">
                                    <div className="flex items-center gap-1.5">
                                        <img src={user.imageUrl} alt={user.name} className="rounded-full size-8 aspect-square" referrerPolicy="no-referrer" />
                                        <span>{user.name}</span>
                                    </div>
                                </td>
                                <td className="p-4">{user.email}</td>
                                <td className="p-4">{formatDate(user.dateJoined)}</td>
                                <td className="p-4">
                                    <article className={cn('status-column', user.status === 'user' ? 'bg-success-50': 'bg-light-300')}>
                                        <div className={cn('size-1.5 rounded-full', user.status === 'user' ? 'bg-success-500': 'bg-gray-500')} />
                                        <h3 className={cn('font-inter text-xs font-medium', user.status === 'user' ? 'text-success-700' : 'text-gray-500')}>
                                            {user.status}
                                        </h3>
                                    </article>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    )
}
export default AllUsers
