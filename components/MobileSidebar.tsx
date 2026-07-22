import {Link} from "react-router";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import NavItems from "./NavItems";
import {MenuIcon} from "lucide-react";

const MobileSidebar = () => {
    return (
        <div className="mobile-sidebar wrapper">
            <header>
                <Link to="/">
                    <img
                        src="/assets/icons/logo.svg"
                        alt="Logo"
                        className="size-7.5"
                    />

                    <h1>Tourvisto</h1>
                </Link>

                <Sheet>
                <SheetTrigger className="h-9 w-9 rounded-md flex items-center justify-center">
                    <MenuIcon className="size-7" />
                </SheetTrigger>
                    <SheetContent side="left" className="w-67.5 p-0">
                        <NavItems />
                    </SheetContent>
                </Sheet>
            </header>
        </div>
    )
}
export default MobileSidebar
