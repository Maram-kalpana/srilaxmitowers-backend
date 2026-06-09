import React, { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, ChevronDown } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import ListFilters from "../components/ListFilters";
import { useApp } from "../context/AppContext";
import { matchesDate, matchesSearch } from "../utils/filterUtils";

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

const EMPTY_FORM = {
  name: "",
  companyName: "",
  managerId: "",
  location: "",
  startDate: "",
};

function ProjectFormFields({ form, setForm, employees, isEdit, onSubmit }) {
  return (
    <div className="px-6 space-y-5">
      <LabeledInput
        label="Project Name"
        value={form.name}
        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        placeholder="Enter project name"
      />
      <LabeledInput
        label="Project Company Name"
        value={form.companyName}
        onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
        placeholder="Client or company name"
      />
      <LabeledSelect
        label="Assign Manager"
        value={form.managerId}
        onChange={(e) => setForm((p) => ({ ...p, managerId: e.target.value }))}
      >
        <option value="">Select Manager</option>
        {employees.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} ({m.employeeId})
          </option>
        ))}
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
        onClick={onSubmit}
        className="w-full h-12 mt-2 rounded-2xl bg-primary text-white font-semibold shadow-md shadow-primary/25 hover:opacity-90 transition"
      >
        {isEdit ? "Update Project" : "Add Project"}
      </button>
    </div>
  );
}

const Projects = () => {
  const { projects, setProjects, employees } = useApp();
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [openAddPanel, setOpenAddPanel] = useState(false);
  const [openEditPanel, setOpenEditPanel] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDate]);

  const getManagerName = (project) => {
    if (project.managerName) return project.managerName;
    const manager = employees.find((e) => e.id === project.managerId);
    return manager?.name ?? "—";
  };

  const resolveManagerName = (managerId) => {
    const manager = employees.find((e) => e.id === managerId);
    return manager?.name ?? "";
  };

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const managerName = getManagerName(p);
      return (
        matchesSearch(search, p.name, p.companyName, p.location, managerName) &&
        matchesDate(filterDate, p.startDate)
      );
    });
  }, [projects, search, filterDate, employees]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const resetForm = () => setForm(EMPTY_FORM);

  const handleAddProject = () => {
    if (!form.name.trim()) return alert("Please enter project name");
    if (!form.companyName.trim()) return alert("Please enter project company name");
    if (!form.managerId) return alert("Please select a manager");
    if (!form.location.trim()) return alert("Please enter location");
    if (!form.startDate) return alert("Please select start date");

    setProjects((prev) => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        name: form.name.trim(),
        companyName: form.companyName.trim(),
        managerId: form.managerId,
        managerName: resolveManagerName(form.managerId),
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
      companyName: project.companyName ?? "",
      managerId: project.managerId ?? "",
      location: project.location ?? "",
      startDate: project.startDate ?? "",
    });
    setOpenEditPanel(true);
  };

  const handleUpdateProject = () => {
    if (!form.name.trim()) return alert("Please enter project name");
    if (!form.companyName.trim()) return alert("Please enter project company name");
    if (!form.managerId) return alert("Please select a manager");
    if (!form.location.trim()) return alert("Please enter location");
    if (!form.startDate) return alert("Please select start date");

    setProjects((prev) =>
      prev.map((p) =>
        p.id === editingId
          ? {
              ...p,
              name: form.name.trim(),
              companyName: form.companyName.trim(),
              managerId: form.managerId,
              managerName: resolveManagerName(form.managerId),
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

          <ListFilters
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by project, company, location, manager..."
            date={filterDate}
            onDateChange={setFilterDate}
            dateLabel="Start date"
          />

          <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-secondary/50">
                  {["Project Name", "Company", "Manager", "Start Date", "Location", "Actions"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`py-4 px-5 font-semibold text-foreground border-b border-r border-border last:border-r-0 ${
                          i === 5 ? "text-right" : "text-left"
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
                      {project.companyName ?? "—"}
                    </td>
                    <td className="py-4 px-5 border-b border-r border-border">
                      {getManagerName(project)}
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
                      colSpan={6}
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
          <ProjectFormFields
            form={form}
            setForm={setForm}
            employees={employees}
            isEdit={false}
            onSubmit={handleAddProject}
          />
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
          <ProjectFormFields
            form={form}
            setForm={setForm}
            employees={employees}
            isEdit
            onSubmit={handleUpdateProject}
          />
        </div>
      </SlidePanel>
    </>
  );
};

export default Projects;
