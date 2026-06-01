import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, Moon, Sun, ChevronDown, X, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PAGE_ROUTES = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Projects", path: "/dashboard/projects" },
  { name: "Users", path: "/dashboard/users" },
  { name: "Work Details", path: "/dashboard/work-details" },
  { name: "Profile", path: "/dashboard/profile" },
];

export default function Header({ onToggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const searchRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setActiveIndex(-1);

    if (value.trim() !== "") {
      const filtered = PAGE_ROUTES.filter((page) =>
        page.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setSearch("");
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleNavigate(suggestions[activeIndex].path);
      } else {
        handleNavigate(suggestions[0].path);
      }
    }
  };

  const handleLogout = () => {
    setIsDrawerOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-border bg-card flex items-center justify-between px-6 transition-colors duration-300">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-[16px] sm:text-[20px] font-bold text-foreground truncate capitalize">
            {location.pathname.split("/").pop()?.replace("-", " ") || "Dashboard"}
          </h1>

          <div ref={searchRef} className="relative w-full max-w-[220px] sm:max-w-[320px] hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (search.trim() !== "") setShowSuggestions(true);
              }}
              placeholder="Search pages..."
              className="w-full h-10 pl-11 pr-10 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="py-2 flex flex-col max-h-[280px] overflow-y-auto">
                  {suggestions.map((page, index) => (
                    <button
                      key={page.path}
                      type="button"
                      onClick={() => handleNavigate(page.path)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        index === activeIndex
                          ? "bg-secondary text-foreground font-medium"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      {page.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showSuggestions && search.trim() !== "" && suggestions.length === 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-card border border-border rounded-lg shadow-xl p-4 text-sm text-muted-foreground text-center z-50">
                No pages found
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4">
          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 rounded-xl px-1.5 py-1.5 transition hover:bg-secondary focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
          </button>
        </div>
      </header>

      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/20 z-[60]"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 w-[320px] max-w-full h-full bg-card shadow-2xl z-[70] border-l border-border flex flex-col animate-in slide-in-from-right-full duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Account</h2>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-6 flex-1 overflow-y-auto">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background/50">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground leading-tight">
                    {user?.name || "Admin User"}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">Admin</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate("/dashboard/profile");
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-secondary transition"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  My Profile
                </button>
              </div>
            </div>
            <div className="p-5 border-t border-border">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-lg hover:bg-primary/90 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
