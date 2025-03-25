import { FileText, ZapIcon, Home, MessageSquare, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Menu items
const items = [
    {
        title: "Dashboard",
        url: "/",
        icon: Home,
    },
    {
        title: "My Resumes",
        url: "/resumes",
        icon: FileText,
    },
    {
        title: "Roast My Resume",
        url: "/roast",
        icon: ZapIcon,
        highlight: true,
    },
    {
        title: "Feedback",
        url: "/feedback",
        icon: MessageSquare,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
]

export function AppBar() {
    return (
        <Sidebar variant="inset">
            <SidebarContent className="pt-6">
                <div className="px-4 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="/logo.png" alt="ResumeMe" />
                            <AvatarFallback className="bg-primary text-primary-foreground">RM</AvatarFallback>
                        </Avatar>
                        <h1 className="font-bold text-xl tracking-tight">ResumeMe</h1>
                    </div>
                </div>

                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a 
                                            href={item.url}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
                                                item.highlight && "bg-primary/10 text-primary font-medium"
                                            )}
                                        >
                                            <item.icon className={cn("h-5 w-5", item.highlight && "text-primary")} />
                                            <span>{item.title}</span>
                                            {item.highlight && (
                                                <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                                                    New
                                                </span>
                                            )}
                                        </a>
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
