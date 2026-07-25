import {Link, redirect} from "react-router";
import {Button} from "@/components/ui/button";
import {loginWithGoogle} from "~/appwrite/auth";
import {getAccount} from "~/appwrite/client";
import {useState} from "react";

export async function clientLoader() {
    try {
        const user = await getAccount().get();

        if(user.$id) return redirect('/');
    } catch (e) {
        console.log('Error fetching user', e)
    }
}

const SignIn = () => {
    const [activeRole, setActiveRole] = useState<'admin' | 'user'>('user');
    const [inviteCode, setInviteCode] = useState('');
    const [inviteError, setInviteError] = useState('');

    const handleSignIn = async () => {
        if (activeRole === 'admin') {
            const validCode = import.meta.env.VITE_ADMIN_INVITE_CODE;
            if (!inviteCode) {
                setInviteError('Please enter an admin invite code');
                return;
            }
            if (inviteCode !== validCode) {
                setInviteError('Invalid invite code. Please check and try again.');
                return;
            }
            setInviteError('');
            sessionStorage.setItem('signin_role', 'admin');
        } else {
            sessionStorage.removeItem('signin_role');
        }
        await loginWithGoogle();
    };

    const handleRoleSwitch = (role: 'admin' | 'user') => {
        setActiveRole(role);
        setInviteCode('');
        setInviteError('');
    };

    const roleConfig = {
        admin: {
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 7V12C3 17.55 6.84 22.74 12 24C17.16 22.74 21 17.55 21 12V7L12 2ZM10.94 15.54L7.4 12L8.81 10.59L10.93 12.71L15.17 8.47L16.58 9.88L10.94 15.54Z" fill="currentColor"/>
                </svg>
            ),
            title: 'Admin Panel',
            description: 'Manage destinations, itineraries, and user activity with ease.',
            heading: 'Welcome back, Admin',
            accentClass: 'admin-accent',
            features: ['User management', 'Trip oversight', 'Analytics dashboard']
        },
        user: {
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.5 2.5L21.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21.5 6.5H9.5C6.19 6.5 3.5 9.19 3.5 12.5V21.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 16.5C5.5 14 8.67 13 12 13C14.22 13 16.33 13.56 18.14 14.56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ),
            title: 'Traveler',
            description: 'Explore handcrafted itineraries and plan your dream trip in minutes.',
            heading: 'Start Your Travel Journey',
            accentClass: 'user-accent',
            features: ['AI-generated itineraries', 'Personalized plans', 'Explore destinations']
        }
    };

    const config = roleConfig[activeRole];

    return (
        <main className="auth">
            <section className="size-full glassmorphism flex-center px-6">
                <div className="sign-in-card slide-up">
                    <header className="header">
                        <Link to="/">
                            <img
                                src="/assets/icons/logo.svg"
                                alt="logo"
                                className="size-[30px]"
                            />
                        </Link>
                        <h1 className="p-28-bold text-dark-100">Tourvisto</h1>
                    </header>

                    <div className="role-tabs">
                        <button
                            type="button"
                            onClick={() => handleRoleSwitch('user')}
                            className={activeRole === 'user' ? 'role-tab-active' : 'role-tab-inactive'}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Traveler
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleSwitch('admin')}
                            className={activeRole === 'admin' ? 'role-tab-active' : 'role-tab-inactive'}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L3 7V12C3 17.55 6.84 22.74 12 24C17.16 22.74 21 17.55 21 12V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Admin
                        </button>
                    </div>

                    <article className="fade-in" key={activeRole}>
                        <div className={`role-icon-wrapper ${config.accentClass}`}>
                            <div className={activeRole === 'admin' ? 'text-dark-300' : 'text-primary-100'}>
                                {config.icon}
                            </div>
                        </div>

                        <h2 className="p-28-semibold text-dark-100 text-center">{config.heading}</h2>
                        <p className="p-18-regular text-center text-gray-100 !leading-7">{config.description}</p>

                        <div className="flex flex-wrap justify-center gap-2 mt-1">
                            {config.features.map((feature) => (
                                <span key={feature} className="inline-flex items-center gap-1 text-xs font-medium text-dark-200 bg-light-300 py-1 px-2.5 rounded-full">
                                    <img src="/assets/icons/check.svg" className="size-3" alt="" />
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </article>

                    {activeRole === 'admin' && (
                        <div className="flex flex-col gap-2 mt-2 fade-in">
                            <label htmlFor="invite-code" className="text-sm font-medium text-dark-200">
                                Admin Invite Code
                            </label>
                            <input
                                id="invite-code"
                                type="password"
                                placeholder="Enter your invite code"
                                value={inviteCode}
                                onChange={(e) => {
                                    setInviteCode(e.target.value);
                                    setInviteError('');
                                }}
                                className="form-input !rounded-lg text-sm placeholder:text-gray-100"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSignIn();
                                }}
                            />
                            {inviteError && (
                                <p className="text-red-500 text-xs font-medium mt-0.5">{inviteError}</p>
                            )}
                        </div>
                    )}

                    <div className="auth-divider">
                        <span>Continue with</span>
                    </div>

                    <Button
                        type="button"
                        className="button-class !h-11 !w-full"
                        onClick={handleSignIn}
                    >
                        <img
                            src="/assets/icons/google.svg"
                            className="size-5"
                            alt="google"
                        />
                        <span className="p-18-semibold text-white">Sign in with Google</span>
                    </Button>

                    <p className="text-xs text-gray-100 text-center mt-4 !leading-5">
                        {activeRole === 'admin'
                            ? 'Admin access requires a valid invite code. Contact your administrator if you need one.'
                            : 'Sign in to access your personalized travel dashboard.'}
                    </p>
                </div>
            </section>
        </main>
    )
}
export default SignIn
