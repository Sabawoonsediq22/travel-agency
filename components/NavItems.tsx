import {Link, NavLink, useLoaderData, useNavigate} from "react-router";
import {sidebarItems} from "~/constants";
import {cn} from "~/lib/utils";
import {logoutUser} from "~/appwrite/auth";

const NavItems = ({ handleClick }: { handleClick?: () => void}) => {
    const user = useLoaderData();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logoutUser();
        navigate('/sign-in')
    }

    return (
        <section className="nav-items">
            <Link to='/' className="link-logo">
                <img src="/assets/icons/logo.svg" alt="logo" className="size-7" />
                <h1>Tourvisto</h1>
            </Link>

            <div className="container">
                <nav className="pt-4">
                    <p className="text-[11px] font-semibold text-gray-100 uppercase tracking-wider px-3 mb-2">Navigation</p>
                    {sidebarItems.map(({ id, href, icon, label }) => (
                        <NavLink to={href} key={id}>
                            {({ isActive }: { isActive: boolean }) => (
                                <div className={cn('group nav-item', {
                                    'bg-primary-100 !text-white': isActive
                                })} onClick={handleClick}>
                                    <img
                                        src={icon}
                                        alt={label}
                                        className={`group-hover:brightness-0 size-0 group-hover:invert ${isActive ? 'brightness-0 invert' : 'text-dark-200'}`}
                                    />
                                    {label}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <footer className="nav-footer">
                    <div className="flex items-center gap-2.5">
                        <img src={user?.imageUrl || '/assets/images/david.webp'} alt={user?.name || 'Admin'} referrerPolicy="no-referrer" />

                        <article>
                            <div className="flex items-center gap-2">
                                <h2 className="truncate">{user?.name}</h2>
                                <span className="admin-badge bg-dark-300/10 text-dark-300 shrink-0">
                                    Admin
                                </span>
                            </div>
                            <p>{user?.email}</p>
                        </article>
                    </div>

                    <div className="flex items-center gap-1">
                        <Link to="/" className="nav-back-to-site">
                            <img src="/assets/icons/arrow-left.svg" alt="" />
                            Back to Site
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="cursor-pointer p-2 rounded-lg hover:bg-light-300 transition-colors duration-150"
                            title="Sign out"
                        >
                            <img
                                src="/assets/icons/logout.svg"
                                alt="logout"
                                className="size-5"
                            />
                        </button>
                    </div>
                </footer>
            </div>
        </section>
    )
}

export default NavItems
