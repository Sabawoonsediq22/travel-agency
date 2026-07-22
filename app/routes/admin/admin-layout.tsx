import {Outlet, redirect} from "react-router";
import MobileSidebar from "../../../components/MobileSidebar";
import NavItems from "../../../components/NavItems";
import {Button} from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {MenuIcon} from "lucide-react";
import {getAccount} from "~/appwrite/client";
import {getExistingUser, storeUserData} from "~/appwrite/auth";

export async function clientLoader() {
    try {
        const user = await getAccount().get();

        if(!user.$id) return redirect('/sign-in');

        const existingUser = await getExistingUser(user.$id);

        if(existingUser?.status === 'user') {
            return redirect('/');
        }

        return existingUser?.$id ? existingUser : await storeUserData();
    } catch (e) {
        console.log('Error in clientLoader', e)
        return redirect('/sign-in')
    }
}

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            <MobileSidebar />

            <aside className="w-full max-w-[270px] hidden lg:block">
                <NavItems />
            </aside>

            <aside className="children">
                <Outlet />
            </aside>
        </div>
    )
}
export default AdminLayout
