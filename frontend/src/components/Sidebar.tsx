import { NavLink } from "react-router-dom";
import { LayoutDashboard, Upload, FileText, MessageSquare, LogOut } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/upload", icon: Upload, label: "Upload" },
  { to: "/documents", icon: FileText, label: "Documents" },
  { to: "/chat", icon: MessageSquare, label: "Chat" },
];

const Sidebar = ({ onLogout }: { onLogout?: () => void }) => {
  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-30">
      {/* Brand */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground tracking-tight">RetailRAG</h1>
            <p className="text-xs text-muted-foreground">Document Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`
            }
          >
            <item.icon className="w-4.5 h-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {onLogout && (
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={onLogout}
            className="sidebar-link sidebar-link-inactive w-full"
          >
            <LogOut className="w-4.5 h-4.5" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
