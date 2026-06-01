import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, X, ChevronDown } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { useApp } from "../context/AppContext";

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed"];

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

const statusColors = {
  Pending: "bg-amber-100 text-amber-600",
  "In Progress": "bg-blue-100 text-blue-600",
  Completed: "bg-green-100 text-green-600",
};

export default function WorkDetails() {
  const { workDetails, setWorkDetails } = useApp();
  const [search, setSearch] = useState("");
  const [openPanel, setOpenPanel] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const emptyForm = { date: "", name: "", status: "Pending" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return workDetails.filter(
      (row) =>
        (row.name || "").toLowerCase().includes(q) ||
        (row.date || "").includes(q) ||
        (row.status || "").toLowerCase().includes(q)
    );
  }, [workDetails, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const resetForm = () => setForm(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    resetForm();
    setOpenPanel(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      date: row.date || "",
      name: row.name || "",
      status: row.status || "Pending",
    });
    setOpenPanel(true);
  };

  const handleSave = () => {
    if (!form.date) return alert("Please select a date");
    if (!form.name.trim()) return alert("Please enter a name");

    if (editingId) {
      setWorkDetails((prev) =>
        prev.map((row) =>
          row.id === editingId ? { ...row, ...form, name: form.name.trim() } : row
        )
      );
    } else {
      setWorkDetails((prev) => [
        ...prev,
        { id: `wd-${Date.now()}`, ...form, name: form.name.trim() },
      ]);
    }

    setOpenPanel(false);
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this work entry?")) return;
    setWorkDetails((prev) => prev.filter((row) => row.id !== id));
  };

  return (
    <>
      <AdminLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm md:text-[15px] leading-6 text-muted-foreground">
              {workDetails.length} work entries tracked.
            </p>
            <button
              onClick={openAdd}
              className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition shadow-md shadow-primary/25 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Work
            </button>
          </div>

          <div className="relative flex-shrink-0 w-full sm:w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search work details..."
              className="w-full h-10 pl-10 pr-3 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-secondary/50">
                  {["Date", "Name", "Status", "Actions"].map((h, i) => (
                    <th
                      key={h}
                      className={`py-4 px-5 font-semibold text-foreground border-b border-r border-border last:border-r-0 ${
                        i === 3 ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row) => (
                  <tr key={row.id} className="hover:bg-secondary/30 transition">
                    <td className="py-4 px-5 border-b border-r border-border">
                      {row.date}
                    </td>
                    <td className="py-4 px-5 border-b border-r border-border">
                      {row.name}
                    </td>
                    <td className="py-4 px-5 border-b border-r border-border">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[row.status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 border-b border-border text-right">
                      <div className="flex items-center justify-end gap-4">
                        <button type="button" onClick={() => openEdit(row)}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(row.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No work details found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-4 border-t border-border">
            <button
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
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </AdminLayout>

      <SlidePanel open={openPanel} onClose={() => setOpenPanel(false)}>
        <div className="h-full flex flex-col bg-card">
          <div className="flex items-center justify-between px-6 pt-8 pb-5">
            <h2 className="text-2xl font-heading font-bold text-foreground">
              {editingId ? "Edit Work" : "Add Work"}
            </h2>
            <button
              type="button"
              onClick={() => setOpenPanel(false)}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-secondary transition"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <div className="px-6 space-y-5 pb-8">
            <LabeledInput
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            />
            <LabeledInput
              label="Name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Work description or title"
            />
            <LabeledSelect
              label="Status"
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </LabeledSelect>
            <button
              type="button"
              onClick={handleSave}
              className="w-full h-12 mt-2 rounded-2xl bg-primary text-white font-semibold shadow-md shadow-primary/25 hover:opacity-90 transition"
            >
              {editingId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </SlidePanel>
    </>
  );
}
