import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, X, ChevronDown } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { useApp } from "../context/AppContext";

function SlidePanel({ open, onClose, children }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-[370px] bg-card border-l border-border shadow-2xl overflow-y-auto">
        {children}
      </div>
    </>
  );
}

function LabeledInput({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div className="relative">
      {label && (
        <label className="absolute left-4 -top-2.5 bg-card px-1 text-xs text-muted-foreground z-10">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-11 rounded-2xl border border-border bg-background px-4 text-foreground outline-none focus:ring-2 focus:ring-primary/30 dark:[color-scheme:dark]"
      />
    </div>
  );
}

function LabeledSelect({ label, value, onChange, children }) {
  return (
    <div className="relative">
      {label && (
        <label className="absolute left-4 -top-2.5 bg-card px-1 text-xs text-muted-foreground z-10">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className="w-full h-11 rounded-2xl border border-border bg-background px-4 pr-10 text-foreground outline-none appearance-none focus:ring-2 focus:ring-primary/30"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    </div>
  );
}

const Projects = () => {
  const { projects, setProjects, users } = useApp();
  const [search, setSearch] = useState("");
  const [openAddPanel, setOpenAddPanel] = useState(false);
  const [openEditPanel, setOpenEditPanel] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const emptyForm = {
    name: "",
    managerId: "",
    location: "",
    startDate: "",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const getManagerName = (managerId) => {
    const manager = users.find((u) => u.id === managerId);
    return manager?.name ?? "-";
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter((p) => {
      const managerName = getManagerName(p.managerId).toLowerCase();
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.location || "").toLowerCase().includes(q) ||
        managerName.includes(q) ||
        (p.startDate || "").includes(q)
      );
    });
  }, [projects, search, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const resetForm = () => setForm(emptyForm);

  const handleAddProject = () => {
    if (!form.name.trim()) return alert("Please enter project name");
    if (!form.managerId) return alert("Please select a manager");
    if (!form.location.trim()) return alert("Please enter location");
    if (!form.startDate) return alert("Please select start date");

    setProjects((prev) => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        name: form.name.trim(),
        managerId: form.managerId,
        location: form.location.trim(),
        startDate: form.startDate,
      },
    ]);
    setOpenAddPanel(false);
    resetForm();
  };

  const handleEditClick = (project) => {
    setEditingId(project.id);
    setForm({
      name: project.name ?? "",
      managerId: project.managerId ?? "",
      location: project.location ?? "",
      startDate: project.startDate ?? "",
    });
    setOpenEditPanel(true);
  };

  const handleUpdateProject = () => {
    if (!form.name.trim()) return alert("Please enter project name");
    if (!form.managerId) return alert("Please select a manager");
    if (!form.location.trim()) return alert("Please enter location");
    if (!form.startDate) return alert("Please select start date");

    setProjects((prev) =>
      prev.map((p) =>
        p.id === editingId
          ? {
              ...p,
              name: form.name.trim(),
              managerId: form.managerId,
              location: form.location.trim(),
              startDate: form.startDate,
            }
          : p
      )
    );
    setOpenEditPanel(false);
    setEditingId(null);
    resetForm();
  };

  const handleDeleteProject = (id) => {
    if (!window.confirm("Delete this project?")) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const ManagerOptions = () => (
    <>
      <option value="">Select Manager</option>
      {users.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </>
  );

  const FormFields = ({ isEdit = false }) => (
    <div className="px-6 space-y-5">
      <LabeledInput
        label="Project Name"
        value={form.name}
        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        placeholder="Enter project name"
      />
      <LabeledSelect
        label="Assign Manager"
        value={form.managerId}
        onChange={(e) => setForm((p) => ({ ...p, managerId: e.target.value }))}
      >
        <ManagerOptions />
      </LabeledSelect>
      <LabeledInput
        label="Location"
        value={form.location}
        onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
        placeholder="Enter location"
      />
      <LabeledInput
        label="Start Date"
        type="date"
        value={form.startDate}
        onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
      />
      <button
        type="button"
        onClick={isEdit ? handleUpdateProject : handleAddProject}
        className="w-full h-12 mt-2 rounded-2xl bg-primary text-white font-semibold shadow-md shadow-primary/25 hover:opacity-90 transition"
      >
        {isEdit ? "Update Project" : "Add Project"}
      </button>
    </div>
  );

  return (
    <>
      <AdminLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm md:text-[15px] leading-6 text-muted-foreground">
              {projects.length} total construction projects.
            </p>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setOpenAddPanel(true);
              }}
              className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition shadow-md shadow-primary/25 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          </div>

          <div className="relative flex-shrink-0 w-full sm:w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search..."
              className="w-full h-10 pl-10 pr-3 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-secondary/50">
                  {["Project Name", "Manager", "Start Date", "Location", "Actions"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`py-4 px-5 font-semibold text-foreground border-b border-r border-border last:border-r-0 ${
                          i === 4 ? "text-right" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((project) => (
                  <tr key={project.id} className="hover:bg-secondary/30 transition">
                    <td className="py-4 px-5 border-b border-r border-border">
                      {project.name}
                    </td>
                    <td className="py-4 px-5 border-b border-r border-border">
                      {getManagerName(project.managerId)}
                    </td>
                    <td className="py-4 px-5 border-b border-r border-border">
                      {project.startDate ?? "-"}
                    </td>
                    <td className="py-4 px-5 border-b border-r border-border">
                      {project.location ?? "-"}
                    </td>
                    <td className="py-4 px-5 border-b border-border text-right">
                      <div className="flex items-center justify-end gap-4">
                        <button type="button" onClick={() => handleEditClick(project)}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No projects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-4 border-t border-border">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <p className="text-sm text-muted-foreground font-medium">
              Page {currentPage} of {totalPages}
            </p>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </AdminLayout>

      <SlidePanel open={openAddPanel} onClose={() => setOpenAddPanel(false)}>
        <div className="h-full flex flex-col bg-card">
          <div className="flex items-center justify-between px-6 pt-8 pb-5">
            <h2 className="text-2xl font-heading font-bold text-foreground">Add Project</h2>
            <button
              type="button"
              onClick={() => setOpenAddPanel(false)}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-secondary transition"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <FormFields isEdit={false} />
        </div>
      </SlidePanel>

      <SlidePanel open={openEditPanel} onClose={() => setOpenEditPanel(false)}>
        <div className="h-full flex flex-col bg-card">
          <div className="flex items-center justify-between px-6 pt-8 pb-5">
            <h2 className="text-2xl font-heading font-bold text-foreground">Edit Project</h2>
            <button
              type="button"
              onClick={() => setOpenEditPanel(false)}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-secondary transition"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <FormFields isEdit />
        </div>
      </SlidePanel>
    </>
  );
};

export default Projects;
