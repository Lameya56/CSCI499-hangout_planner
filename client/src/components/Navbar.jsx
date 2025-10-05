import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "../AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
const Navbar = () => {
    const { setAuthUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
    // 1. Remove JWT from localStorage
    localStorage.removeItem("token");
    // 2. Clear authenticated user from context
    setAuthUser(null);
    // 3. Redirect to login page
    navigate("/login");
  };
    return(
        <nav className="p-4 flex items-center justify-between">
            {/* Left */}
            <SidebarTrigger/>
            {/* Right */}
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={10}>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User className="h-[1.2rem] w-[1.2rem] mr-2"/>
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="h-[1.2rem] w-[1.2rem] mr-2"/>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem  asChild variant="destructive">
                             <button onClick={handleLogout} className="flex items-center w-full">
                                <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
                                LogOut
                            </button>
                        </DropdownMenuItem>                      
                    </DropdownMenuContent>
                </DropdownMenu>               
            </div>
        </nav>
    )
}
export default Navbar;