import {Link, useLoaderData, useLocation, useNavigate, useParams} from "react-router";
import {logoutUser} from "~/appwrite/auth";
import {cn} from "~/lib/utils";
import {setSentryUser} from "~/lib/sentry";

const RootNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation()
    const params = useParams();
    const user = useLoaderData();

    setSentryUser(user);

    const handleLogout = async () => {
        await logoutUser();
        navigate('/sign-in')
    }

    const isOnDetailPage = location.pathname === `/travel/${params.tripId}`;

    return (
        <nav className={cn(isOnDetailPage ? 'bg-white' : 'glassmorphism', 'w-full fixed z-50')}>
            <header className="root-nav wrapper">
                <Link to='/' className="link-logo">
                    <img src="/assets/icons/logo.svg" alt="logo" className="size-7.5" />
                    <h1>Tourvisto</h1>
                </Link>

                <aside>
                    {user.status === 'admin' && (
                        <Link
                            to="/dashboard"
                            className={cn('admin-nav-badge', isOnDetailPage
                                ? 'bg-dark-100 text-white hover:bg-dark-200'
                                : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L3 7V12C3 17.55 6.84 22.74 12 24C17.16 22.74 21 17.55 21 12V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Admin Panel
                        </Link>
                    )}

                    <img
                        src={user?.imageUrl || '/assets/images/david.webp'}
                        alt={user?.name || 'User'}
                        referrerPolicy="no-referrer"
                        title={user?.name || 'User profile'}
                        className="cursor-pointer"
                    />

                    <button
                        onClick={handleLogout}
                        className="cursor-pointer p-2 rounded-lg hover:bg-black/5 transition-colors duration-150"
                        title="Sign out"
                    >
                        <img
                            src="/assets/icons/logout.svg"
                            alt="logout"
                            className="size-6 rotate-180"
                        />
                    </button>
                </aside>
            </header>
        </nav>
    )
}
export default RootNavbar
