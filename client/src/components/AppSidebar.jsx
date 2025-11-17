import {Home, Inbox, Calendar, Search, Settings, UsersRoundIcon, Images, LandPlot, Globe} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom";
 
const items = [
    {
        title: "Home",
        url:"/home",
        icon: Home,
    },
    {
        title: "Plan",
        url: "/plan",
        icon: LandPlot,
    },
    {
        title: "Calendar",
        url: "/calendar",
        icon: Calendar,
    },
    {
        title: "Groups",
        url: "/groups",
        icon: UsersRoundIcon,
    },
    {
        title: "Memories",
        url: "/memories",
        icon: Images,
    },
    {
        title: "Explore",
        url: "/explore",
        icon: Globe,
    },
]
const AppSideBar = () => {
    return(
        <Sidebar collapsible="icon">
            <SidebarContent className="flex flex-col justify-center">
                <SidebarGroup>
                    <SidebarGroupLabel className="justify-center"> Application </SidebarGroupLabel>
                    <SidebarGroupContent >
                        <SidebarMenu className="flex items-center">
                            {items.map(item => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild >
                                        <Link to={item.url} className="flex items-center gap-2" >
                                            <item.icon />
                                            <span className="w-15 flex justify-center"> {item.title}</span>        
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

        </Sidebar>
    )
}
export default AppSideBar; 