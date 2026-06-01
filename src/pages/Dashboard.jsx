import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FolderKanban, Users, ClipboardList, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { useApp } from "../context/AppContext";

const statsConfig = [
  {
    title: "Projects",
    key: "projects",
    icon: FolderKanban,
    bgClass: "bg-[#EFF6FF] dark:bg-[#0B1727]",
    iconClass: "text-[#3B82F6]",
    delay: 0,
    path: "/dashboard/projects",
  },
  {
    title: "Users",
    key: "users",
    icon: Users,
    bgClass: "bg-[#F0FDF4] dark:bg-[#0A1A17]",
    iconClass: "text-[#22C55E]",
    delay: 0.1,
    path: "/dashboard/users",
  },
  {
    title: "Work Details",
    key: "workDetails",
    icon: ClipboardList,
    bgClass: "bg-[#FFFBEB] dark:bg-[#1E1410]",
    iconClass: "text-[#F59E0B]",
    delay: 0.2,
    path: "/dashboard/work-details",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { projects, users, workDetails } = useApp();

  const [selectedProject, setSelectedProject] = useState(() =>
    projects.length > 0 ? projects[0].name : ""
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef(null);

  const counts = {
    projects: projects.length,
    users: users.length,
    workDetails: workDetails.length,
  };

  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0].name);
    }
  }, [projects, selectedProject]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProjectChange = (value) => {
    setSelectedProject(value);
    setIsDropdownOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isDropdownOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        setIsDropdownOpen(true);
        const currentIndex = projects.findIndex((p) => p.name === selectedProject);
        setActiveIndex(currentIndex >= 0 ? currentIndex : 0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < projects.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < projects.length) {
        handleProjectChange(projects[activeIndex].name);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsDropdownOpen(false);
    }
  };

  const workForProject = selectedProject
    ? workDetails.filter((row) =>
        (row.name || "").toLowerCase().includes(selectedProject.toLowerCase())
      )
    : workDetails;

  const completedWork = workForProject.filter(
    (row) => row.status === "Completed"
  ).length;

  return (
    <AdminLayout>
      <div className="w-full max-w-[1400px] mx-auto px-2 sm:px-0">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <p className="text-sm md:text-[15px] leading-6 text-gray-500 dark:text-gray-400">
              Track your business performance.
            </p>

            <div className="relative w-full sm:w-[260px]" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => {
                  if (!isDropdownOpen) {
                    const currentIndex = projects.findIndex(
                      (p) => p.name === selectedProject
                    );
                    setActiveIndex(currentIndex >= 0 ? currentIndex : 0);
                  }
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                onKeyDown={handleKeyDown}
                className={`w-full h-11 px-4 flex items-center justify-between rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white dark:bg-[#0D121F] text-gray-900 dark:text-white ${
                  isDropdownOpen
                    ? "border-2 border-[#3B82F6]"
                    : "border border-gray-200 dark:border-white/10"
                }`}
              >
                <span className="truncate font-medium">
                  {selectedProject || "Select Project"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-[110%] left-0 w-full rounded-xl shadow-xl overflow-hidden z-50 bg-white dark:bg-[#0D121F] border border-gray-100 dark:border-white/10">
                  <div className="max-h-60 overflow-y-auto py-1">
                    {projects.length > 0 ? (
                      projects.map((project, index) => (
                        <div
                          key={project.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleProjectChange(project.name)}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                            activeIndex === index
                              ? "bg-gray-100 dark:bg-white/10 text-[#3B82F6] dark:text-white font-medium"
                              : selectedProject === project.name
                                ? "bg-gray-50 dark:bg-white/5 text-[#3B82F6] dark:text-white font-medium"
                                : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {project.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">No Projects</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statsConfig.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: stat.delay }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(stat.path)}
                  className={`rounded-xl p-4 sm:p-5 cursor-pointer transition shadow-sm border border-transparent dark:border-white/5 ${stat.bgClass}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-transparent flex items-center justify-center shadow-sm dark:shadow-none">
                      <Icon className={`w-5 h-5 ${stat.iconClass}`} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl sm:text-2xl font-heading font-bold text-gray-900 dark:text-white">
                      {counts[stat.key]}
                    </p>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {stat.title}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl p-6 bg-white dark:bg-[#0D121F] border border-gray-200 dark:border-white/5 shadow-sm"
            >
              <h3 className="font-heading font-semibold mb-1 text-gray-900 dark:text-white">
                Work overview
              </h3>
              <p className="text-sm mb-5 text-gray-500 dark:text-gray-400">
                Summary for {selectedProject || "all projects"}.
              </p>
              <div className="border-t pt-5 space-y-3 border-gray-100 dark:border-white/10">
                <p className="text-base text-gray-700 dark:text-gray-300 font-medium">
                  Total work entries: {workForProject.length}
                </p>
                <p className="text-base text-gray-700 dark:text-gray-300 font-medium">
                  Completed: {completedWork}
                </p>
                <p className="text-base text-gray-700 dark:text-gray-300 font-medium">
                  In progress:{" "}
                  {
                    workForProject.filter((row) => row.status === "In Progress")
                      .length
                  }
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl p-6 bg-white dark:bg-[#0D121F] border border-gray-200 dark:border-white/5 shadow-sm"
            >
              <h3 className="font-heading font-semibold mb-4 text-gray-900 dark:text-white">
                Team size
              </h3>
              <div className="border-t pt-5 border-gray-100 dark:border-white/10">
                <div className="text-6xl font-light leading-none mb-2 text-gray-900 dark:text-white">
                  {users.length}
                </div>
                <p className="text-base text-gray-500 dark:text-gray-400">
                  users registered in management
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
