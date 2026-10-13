import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
export default async function DashboardLayout({children}:{children:React.ReactNode}){const session=await getServerSession(authOptions);if(!session?.user?.id)redirect("/login");return <div className="app-shell"><Sidebar name={session.user.name||session.user.email||"Founder"}/><main className="main-area"><header className="topbar"><span className="crumb">Founder workspace / <b>Customer validation</b></span><div className="avatar">{(session.user.name||session.user.email||"F").slice(0,1).toUpperCase()}</div></header><div className="main-content">{children}</div></main></div>}
