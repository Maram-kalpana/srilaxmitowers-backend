import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Layers,
  Briefcase,
  Cog,
  UserCircle,
  UserPlus,
  CalendarCheck,
  Receipt,
  Wallet,
  Cog as CogIcon,
  Truck,
} from "lucide-react";
import AppLogo from "./AppLogo";

function SidebarGroup({ group, collapsed, isOpen, onToggle, onItemClick }) {
  const location = useLocation();

  const hasActiveChild = group.items.some((item) =>
    location.pathname.startsWith(item.path)
  );

  return (
    <div className="mb-1">
      {!collapsed ? (
        <button
          onClick={onToggle}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition ${
            hasActiveChild
              ? "text-white bg-white/10"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <group.icon className="w-3.5 h-3.5" />
          <span className="flex-1 text-left">{group.label}</span>
          <ChevronDown
            className={`w-3 h-3 transition ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      ) : (
        <div className="flex justify-center py-2">
          <div
            className={`w-5 h-0.5 rounded-full ${
              hasActiveChild ? "bg-blue-500" : "bg-slate-700"
            }`}
          />
        </div>
      )}

      {(isOpen || collapsed) && (
        <div
          className={`space-y-0.5 ${
            !collapsed ? "mt-1 ml-2 pl-2 border-l border-slate-700/60" : ""
          }`}
        >
          {group.items.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onItemClick}
                className={`group relative flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] font-medium transition ${
                  collapsed ? "justify-center px-0" : ""
                } ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-200 hover:bg-slate-800"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {!collapsed && <span>{item.label}</span>}

                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navGroups = [
    {
      label: "Overview",
      icon: Layers,
      items: [{ label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" }],
    },
    {
      label: "Management",
      icon: Briefcase,
      items: [
        { label: "Projects", icon: FolderKanban, path: "/dashboard/projects" },
        { label: "Machine", icon: CogIcon, path: "/dashboard/machine" },
        { label: "Vehicle", icon: Truck, path: "/dashboard/vehicle" },
        { label: "Employees", icon: UserPlus, path: "/dashboard/employees" },
        { label: "Attendance", icon: CalendarCheck, path: "/dashboard/attendance" },
        { label: "Salary Slips", icon: Receipt, path: "/dashboard/salary-slips" },
        { label: "Expenses", icon: Wallet, path: "/dashboard/expenses" },
      ],
    },
    {
      label: "Operations",
      icon: Cog,
      items: [
        {
          label: "Work Details",
          icon: ClipboardList,
          path: "/dashboard/work-details",
        },
      ],
    },
    {
      label: "Admin Account",
      icon: UserCircle,
      items: [
        { label: "Profile", icon: UserCircle, path: "/dashboard/profile" },
      ],
    },
  ];

  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    navGroups.forEach((group) => {
      initial[group.label] = group.items.some((item) =>
        location.pathname.startsWith(item.path)
      );
    });
    return initial;
  });

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleItemClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
    fixed  top-0 left-0 z-50 h-screen overflow-hidden bg-[#252b36] border-r border-[#343c46]
    transform transition-all duration-300
    ${collapsed ? "w-[64px]" : "w-[200px]"}
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
    flex flex-col
  `}
      >
        <div className="h-14 flex items-center px-3 border-b border-[#343c46]">
          <div
            className={`flex items-center transition-all duration-300 ${
              collapsed ? "mx-auto" : "w-full"
            }`}
          >
            <AppLogo
              size={collapsed ? "sm" : "sidebar"}
              variant="dark"
              className={collapsed ? "mx-auto" : ""}
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2 no-scrollbar">
          {navGroups.map((group) => (
            <SidebarGroup
              key={group.label}
              group={group}
              collapsed={collapsed}
              isOpen={openGroups[group.label]}
              onToggle={() => toggleGroup(group.label)}
              onItemClick={handleItemClick}
            />
          ))}
        </nav>

        {!collapsed && (
          <div className="mx-2 mb-2 p-2 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                JD
              </div>
              <div className="flex-1">
                <p className="text-[13px] text-white">John Doe</p>
                <p className="text-[11px] text-slate-400">Admin</p>
              </div>
            </div>
          </div>
        )}

        <div className="hidden lg:flex justify-center py-2 border-t border-[#343c46]">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-800"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
