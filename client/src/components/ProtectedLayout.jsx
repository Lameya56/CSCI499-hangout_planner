import AppSideBar from "./AppSidebar";
import Navbar from "./Navbar";
import { SidebarProvider } from "./ui/sidebar.jsx";
import {Outlet, Navigate} from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

const ProtectedLayout = () => {
    const { authUser } = useAuth();

    // If there's no authenticated user, redirect to the login page
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
