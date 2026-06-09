import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, ChevronDown } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import ListFilters from "../components/ListFilters";
import { useApp } from "../context/AppContext";
import { matchesDate, matchesSearch } from "../utils/filterUtils";

const RETURN_REPAIR_OPTIONS = [
  { value: "return", label: "Return" },
  { value: "repair", label: "Repair" },
];

function SlidePanel({ open, onClose, children }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-[420px] bg-card border-l border-border shadow-2xl overflow-y-auto">
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

const emptyForm = {
  machineName: "",
  serialNo: "",
  model: "",
  projectId: "",
  returnOrRepair: "return",
  handoverName: "",
  handoverDesignation: "",
  date: "",
};

export default function Machine() {
  const { machines, setMachines, projects } = useApp();
  const [entryType, setEntryType] = useState("in");
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [openPanel, setOpenPanel] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const itemsPerPage = 5;

  useEffect(() => setCurrentPage(1), [search, filterDate, entryType]);

  const getProjectName = (projectId) =>
    projects.find((p) => p.id === projectId)?.name ?? "—";

  const filtered = useMemo(() => {
    return machines.filter((row) => {
      const projectName = getProjectName(row.projectId);
      return (
        row.entryType === entryType &&
        matchesSearch(search, row.machineName, row.serialNo, row.model, projectName) &&
        matchesDate(filterDate, row.date)
      );
    });
  }, [machines, search, filterDate, entryType, projects]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const resetForm = () => setForm(emptyForm);

  const handleSave = () => {
    if (!form.machineName.trim()) return alert("Please enter machine name");
    if (!form.serialNo.trim()) return alert("Please enter serial number");
    if (!form.model.trim()) return alert("Please enter model");
    if (!form.projectId) return alert("Please select project");
    if (!form.date) return alert("Please select date");
    if (entryType === "out") {
      if (!form.handoverName.trim()) return alert("Please enter handover name");
      if (!form.handoverDesignation.trim()) {
        return alert("Please enter handover designation");
      }
    }

    const payload = {
      entryType,
      machineName: form.machineName.trim(),
      serialNo: form.serialNo.trim(),
      model: form.model.trim(),
      projectId: form.projectId,
      returnOrRepair: form.returnOrRepair,
      date: form.date,
      handoverName: entryType === "out" ? form.handoverName.trim() : "",
      handoverDesignation:
        entryType === "out" ? form.handoverDesignation.trim() : "",
    };

    if (editingId) {
      setMachines((prev) =>
        prev.map((row) => (row.id === editingId ? { ...row, ...payload } : row))
      );
    } else {
      setMachines((prev) => [...prev, { id: `mac-${Date.now()}`, ...payload }]);
    }

    setOpenPanel(false);
    setEditingId(null);
    resetForm();
  };

  const handleEdit = (row) => {
    setEntryType(row.entryType);
    setEditingId(row.id);
    setForm({
      machineName: row.machineName || "",
      serialNo: row.serialNo || "",
      model: row.model || "",
      projectId: row.projectId || "",
      returnOrRepair: row.returnOrRepair || "return",
      handoverName: row.handoverName || "",
      handoverDesignation: row.handoverDesignation || "",
      date: row.date || "",
    });
    setOpenPanel(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this machine record?")) return;
    setMachines((prev) => prev.filter((row) => row.id !== id));
  };

  const isOut = entryType === "out";

  return (
    <>
      <AdminLayout>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Track machine check-in and check-out with project and handover details.
            </p>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setEditingId(null);
                setOpenPanel(true);
              }}
              className="h-11 px-5 rounded-2xl bg-primary text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition shadow-md shadow-primary/25"
            >
              <Plus className="w-4 h-4" />
              Add {isOut ? "Machine Out" : "Machine In"}
            </button>
          </div>

          <div className="inline-flex rounded-xl border border-border bg-card p-1">
            {[
              { key: "in", label: "Machine In" },
              { key: "out", label: "Machine Out" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setEntryType(tab.key)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                  entryType === tab.key
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <ListFilters
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by machine name, serial, model, project..."
            date={filterDate}
            onDateChange={setFilterDate}
            dateLabel="Record date"
          />

          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-secondary/50">
                  {[
                    "Date",
                    "Machine Name",
                    "Serial No",
                    "Model",
                    "Project",
                    "Return / Repair",
                    ...(isOut ? ["Handover To"] : []),
                    "Actions",
                  ].map((h, i, arr) => (
                    <th
                      key={h}
                      className={`py-3 px-4 border-b border-r border-border font-semibold ${
                        i === arr.length - 1 ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((row) => (
                  <tr key={row.id} className="hover:bg-secondary/30">
                    <td className="py-3 px-4 border-b border-r border-border">{row.date}</td>
                    <td className="py-3 px-4 border-b border-r border-border font-medium">
                      {row.machineName}
                    </td>
                    <td className="py-3 px-4 border-b border-r border-border">{row.serialNo}</td>
                    <td className="py-3 px-4 border-b border-r border-border">{row.model}</td>
                    <td className="py-3 px-4 border-b border-r border-border">
                      {getProjectName(row.projectId)}
                    </td>
                    <td className="py-3 px-4 border-b border-r border-border capitalize">
                      {row.returnOrRepair}
                    </td>
                    {isOut && (
                      <td className="py-3 px-4 border-b border-r border-border text-xs">
                        {row.handoverName}
                        {row.handoverDesignation
                          ? ` (${row.handoverDesignation})`
                          : ""}
                      </td>
                    )}
                    <td className="py-3 px-4 border-b border-border text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => handleEdit(row)}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(row.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td
                      colSpan={isOut ? 8 : 7}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No {isOut ? "machine out" : "machine in"} records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center px-4">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
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

      <SlidePanel open={openPanel} onClose={() => setOpenPanel(false)}>
        <div className="p-7 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {editingId
                ? `Edit Machine ${isOut ? "Out" : "In"}`
                : `Machine ${isOut ? "Out" : "In"}`}
            </h2>
            <button type="button" onClick={() => setOpenPanel(false)}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="inline-flex rounded-xl border border-border bg-background p-1 w-full">
            {[
              { key: "in", label: "In" },
              { key: "out", label: "Out" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setEntryType(tab.key)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                  entryType === tab.key
                    ? "bg-primary text-white"
                    : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <LabeledInput
            label="Machine Name"
            value={form.machineName}
            onChange={(e) => setForm((p) => ({ ...p, machineName: e.target.value }))}
            placeholder="Enter machine name"
          />
          <LabeledInput
            label="Serial No"
            value={form.serialNo}
            onChange={(e) => setForm((p) => ({ ...p, serialNo: e.target.value }))}
            placeholder="Serial number"
          />
          <LabeledInput
            label="Model"
            value={form.model}
            onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
            placeholder="Model name / number"
          />
          <LabeledSelect
            label="Project Name"
            value={form.projectId}
            onChange={(e) => setForm((p) => ({ ...p, projectId: e.target.value }))}
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </LabeledSelect>
          <LabeledSelect
            label="Return or Repair"
            value={form.returnOrRepair}
            onChange={(e) => setForm((p) => ({ ...p, returnOrRepair: e.target.value }))}
          >
            {RETURN_REPAIR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </LabeledSelect>
          <LabeledInput
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
          />

          {isOut && (
            <>
              <p className="text-sm font-semibold text-foreground pt-1">Handover To</p>
              <LabeledInput
                label="Name"
                value={form.handoverName}
                onChange={(e) => setForm((p) => ({ ...p, handoverName: e.target.value }))}
                placeholder="Person name"
              />
              <LabeledInput
                label="Designation"
                value={form.handoverDesignation}
                onChange={(e) =>
                  setForm((p) => ({ ...p, handoverDesignation: e.target.value }))
                }
                placeholder="Designation"
              />
            </>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="w-full h-12 rounded-2xl bg-primary text-white font-semibold"
          >
            Save Record
          </button>
        </div>
      </SlidePanel>
    </>
  );
}
