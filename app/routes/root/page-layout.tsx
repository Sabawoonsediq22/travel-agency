import {Outlet, redirect} from "react-router";
import {getExistingUser, storeUserData, updateUserRole} from "~/appwrite/auth";
import {getAccount} from "~/appwrite/client";
import RootNavbar from "../../../components/RootNavbar";

export async function clientLoader() {
    try {
        const user = await getAccount().get();

        if(!user.$id) return redirect('/sign-in');

        let existingUser = await getExistingUser(user.$id);
        const signinRole = sessionStorage.getItem('signin_role');

        if (!existingUser?.$id) {
            const newUser = await storeUserData(signinRole === 'admin' ? 'admin' : 'user');
            if (newUser && '$id' in newUser) {
                existingUser = newUser;
            }
        } else if (signinRole === 'admin' && existingUser.status !== 'admin') {
            await updateUserRole(existingUser.$id, 'admin');
            existingUser = { ...existingUser, status: 'admin' };
        }

        sessionStorage.removeItem('signin_role');

        if (signinRole === 'admin' && existingUser?.status === 'admin') {
            return redirect('/dashboard');
        }

        return existingUser;
    } catch (e) {
        console.log('Error fetching user', e)
        return redirect('/sign-in')
    }
}

const PageLayout = () => {
    return (
        <div className="bg-light-200">
            <RootNavbar />
            <Outlet />
        </div>
    )
}
export default PageLayout
