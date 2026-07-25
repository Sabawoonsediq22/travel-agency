import Header from "../../../components/Header";
import {cn, formatDate} from "~/lib/utils";
import {getAllUsers, updateUserRole, getUser} from "~/appwrite/auth";
import type {Route} from "./+types/all-users"
import EmptyState from "../../../components/EmptyState";
import {useState} from "react";
import {Button} from "@/components/ui/button";

export const loader = async () => {
    const [currentUser, usersData] = await Promise.all([
        getUser(),
        getAllUsers(10, 0)
    ]);

    return { currentUser, users: usersData.users, total: usersData.total };
}

const AllUsers = ({ loaderData }: Route.ComponentProps) => {
    const { currentUser, users: rawUsers, total } = loaderData as unknown as { currentUser: UserData; users: UserData[]; total: number };
    const [users, setUsers] = useState<UserData[]>(rawUsers);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleRoleToggle = async (user: UserData) => {
        const newStatus = user.status === 'admin' ? 'user' : 'admin';
        setUpdatingId(user.$id);

        const success = await updateUserRole(user.$id, newStatus);
        if (success) {
            setUsers(prev => prev.map(u =>
                u.$id === user.$id ? { ...u, status: newStatus } : u
            ));
        }
        setUpdatingId(null);
    };

    return (
        <main className="all-users wrapper fade-in">
            <Header
                title="Manage Users"
                description="Filter, sort, and access detailed user profiles"
            />

            {users.length > 0 ? (
                <>
                    {/* Desktop Table */}
                    <div className="overflow-x-auto hidden lg:block">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email Address</th>
                                    <th>Date Joined</th>
                                    <th>Type</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user: UserData) => (
                                    <tr key={user.$id}>
                                        <td>
                                            <div className="flex items-center gap-1.5">
                                                <img src={user.imageUrl} alt={user.name} className="rounded-full size-8 aspect-square" referrerPolicy="no-referrer" />
                                                <span className="font-medium">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-gray-500">{user.email}</td>
                                        <td className="text-gray-500">{formatDate(user.dateJoined)}</td>
                                        <td>
                                            <article className={cn('status-column', user.status === 'user' ? 'bg-success-50': 'bg-light-300')}>
                                                <div className={cn('size-1.5 rounded-full', user.status === 'user' ? 'bg-success-500': 'bg-gray-500')} />
                                                <h3 className={cn('font-inter text-xs font-medium capitalize', user.status === 'user' ? 'text-success-700' : 'text-gray-500')}>
                                                    {user.status}
                                                </h3>
                                            </article>
                                        </td>
                                        <td>
                                            {user.$id !== currentUser?.$id ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRoleToggle(user)}
                                                    disabled={updatingId === user.$id}
                                                    className={cn(
                                                        'text-xs font-medium h-8 px-3 rounded-lg transition-colors',
                                                        user.status === 'admin'
                                                            ? 'text-red-500 hover:bg-red-50 hover:text-red-600'
                                                            : 'text-primary-100 hover:bg-primary-50 hover:text-primary-500'
                                                    )}
                                                >
                                                    {updatingId === user.$id ? (
                                                        'Updating...'
                                                    ) : user.status === 'admin' ? (
                                                        'Demote'
                                                    ) : (
                                                        'Promote'
                                                    )}
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-gray-100 italic">You</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="flex flex-col gap-3 lg:hidden">
                        {users.map((user: UserData) => (
                            <div key={user.$id} className="bg-white rounded-xl p-4 shadow-100 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <img src={user.imageUrl} alt={user.name} className="rounded-full size-12 aspect-square" referrerPolicy="no-referrer" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-dark-100 truncate">{user.name}</h3>
                                        <p className="text-sm text-gray-100 truncate">{user.email}</p>
                                        <p className="text-xs text-gray-100 mt-1">Joined {formatDate(user.dateJoined)}</p>
                                    </div>
                                    <article className={cn('status-column shrink-0', user.status === 'user' ? 'bg-success-50': 'bg-light-300')}>
                                        <div className={cn('size-1.5 rounded-full', user.status === 'user' ? 'bg-success-500': 'bg-gray-500')} />
                                        <h3 className={cn('font-inter text-xs font-medium capitalize', user.status === 'user' ? 'text-success-700' : 'text-gray-500')}>
                                            {user.status}
                                        </h3>
                                    </article>
                                </div>
                                {user.$id !== currentUser?.$id && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRoleToggle(user)}
                                        disabled={updatingId === user.$id}
                                        className={cn(
                                            'text-xs font-medium h-8 px-3 rounded-lg self-end transition-colors',
                                            user.status === 'admin'
                                                ? 'text-red-500 hover:bg-red-50 hover:text-red-600'
                                                : 'text-primary-100 hover:bg-primary-50 hover:text-primary-500'
                                        )}
                                    >
                                        {updatingId === user.$id ? (
                                            'Updating...'
                                        ) : user.status === 'admin' ? (
                                            'Demote to User'
                                        ) : (
                                            'Promote to Admin'
                                        )}
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <EmptyState
                    title="No users yet"
                    description="Users will appear here once they sign up for the platform."
                    icon="/assets/icons/users.svg"
                />
            )}
        </main>
    )
}
export default AllUsers
