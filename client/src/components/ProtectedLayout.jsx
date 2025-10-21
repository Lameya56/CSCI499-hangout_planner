import AppSideBar from "./AppSidebar";
import Navbar from "./Navbar";
import { SidebarProvider } from "./ui/sidebar.jsx";
import {Outlet, Navigate} from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

const ProtectedLayout = () => {
    const { authUser, loading } = useAuth();

    //while the authentication status is being checked show a loading message/spinner(perhaps sth we can add later)
    if (loading) {
        return (
            <div>
                Loading...
            </div>
        )
    }
    //After loading is complete if there's still no user, then redirect
    if (!authUser) {
        return <Navigate to="/login" />;
    }

    return (
        <SidebarProvider>
            <AppSideBar />
            <main className="w-full">
                <Navbar />
                <Outlet /> {/* Child routes will render here */}
            </main>
        </SidebarProvider>
    );
};

export default ProtectedLayout;
