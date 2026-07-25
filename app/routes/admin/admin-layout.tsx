import {Outlet, redirect} from "react-router";
import MobileSidebar from "../../../components/MobileSidebar";
import NavItems from "../../../components/NavItems";
import {getAccount} from "~/appwrite/client";
import {getExistingUser} from "~/appwrite/auth";

export async function clientLoader() {
    try {
        const user = await getAccount().get();

        if(!user.$id) return redirect('/sign-in');

        const existingUser = await getExistingUser(user.$id);

        if(!existingUser?.$id || existingUser.status !== 'admin') {
            return redirect('/');
        }

        return existingUser;
    } catch (e) {
        console.log('Error in clientLoader', e)
        return redirect('/sign-in')
    }
}

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            <MobileSidebar />

            <aside className="admin-sidebar">
                <div className="admin-sidebar-content">
                    <NavItems />
                </div>
            </aside>

            <main className="children">
                <Outlet />
            </main>
        </div>
    )
}
export default AdminLayout
