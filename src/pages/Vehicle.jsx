import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, X } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { useApp } from "../context/AppContext";

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

const emptyForm = {
  vehicleName: "",
  insuranceDate: "",
  roadTaxExpiryDate: "",
  totalPermitExpiryDate: "",
};

export default function Vehicle() {
  const { vehicles, setVehicles } = useApp();
  const [search, setSearch] = useState("");
  const [openPanel, setOpenPanel] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const itemsPerPage = 5;

  useEffect(() => setCurrentPage(1), [search]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return vehicles.filter(
      (v) =>
        (v.vehicleName || "").toLowerCase().includes(q) ||
        (v.insuranceDate || "").includes(q) ||
        (v.roadTaxExpiryDate || "").includes(q) ||
        (v.totalPermitExpiryDate || "").includes(q)
    );
  }, [vehicles, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const resetForm = () => setForm(emptyForm);

  const handleSave = () => {
    if (!form.vehicleName.trim()) return alert("Please enter vehicle name");
    if (!form.insuranceDate) return alert("Please select insurance date");
    if (!form.roadTaxExpiryDate) return alert("Please select road tax expiry date");
    if (!form.totalPermitExpiryDate) {
      return alert("Please select total permit expiry date");
    }

    const payload = {
      vehicleName: form.vehicleName.trim(),
      insuranceDate: form.insuranceDate,
      roadTaxExpiryDate: form.roadTaxExpiryDate,
      totalPermitExpiryDate: form.totalPermitExpiryDate,
    };

    if (editingId) {
      setVehicles((prev) =>
        prev.map((v) => (v.id === editingId ? { ...v, ...payload } : v))
      );
    } else {
      setVehicles((prev) => [...prev, { id: `veh-${Date.now()}`, ...payload }]);
    }

    setOpenPanel(false);
    setEditingId(null);
    resetForm();
  };

  const handleEdit = (vehicle) => {
    setEditingId(vehicle.id);
    setForm({
      vehicleName: vehicle.vehicleName || "",
      insuranceDate: vehicle.insuranceDate || "",
      roadTaxExpiryDate: vehicle.roadTaxExpiryDate || "",
      totalPermitExpiryDate: vehicle.totalPermitExpiryDate || "",
    });
    setOpenPanel(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this vehicle?")) return;
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <>
      <AdminLayout>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Manage fleet vehicles with insurance, road tax, and permit expiry dates.
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
              Add Vehicle
            </button>
          </div>

          <div className="relative w-full max-w-[430px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vehicles..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-secondary/50">
                  {[
                    "Vehicle Name",
                    "Insurance Date",
                    "Road Tax Expiry",
                    "Total Permit Expiry",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`py-3 px-4 border-b border-r border-border font-semibold ${
                        i === 4 ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-secondary/30">
                    <td className="py-3 px-4 border-b border-r border-border font-medium">
                      {vehicle.vehicleName}
                    </td>
                    <td className="py-3 px-4 border-b border-r border-border">
                      {vehicle.insuranceDate}
                    </td>
                    <td className="py-3 px-4 border-b border-r border-border">
                      {vehicle.roadTaxExpiryDate}
                    </td>
                    <td className="py-3 px-4 border-b border-r border-border">
                      {vehicle.totalPermitExpiryDate}
                    </td>
                    <td className="py-3 px-4 border-b border-border text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => handleEdit(vehicle)}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(vehicle.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-muted-foreground">
                      No vehicles found.
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
              {editingId ? "Edit Vehicle" : "Add Vehicle"}
            </h2>
            <button type="button" onClick={() => setOpenPanel(false)}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <LabeledInput
            label="Vehicle Name"
            value={form.vehicleName}
            onChange={(e) => setForm((p) => ({ ...p, vehicleName: e.target.value }))}
            placeholder="e.g. Tata Ace MH12AB1234"
          />
          <LabeledInput
            label="Insurance Date"
            type="date"
            value={form.insuranceDate}
            onChange={(e) => setForm((p) => ({ ...p, insuranceDate: e.target.value }))}
          />
          <LabeledInput
            label="Road Tax Expiry Date"
            type="date"
            value={form.roadTaxExpiryDate}
            onChange={(e) => setForm((p) => ({ ...p, roadTaxExpiryDate: e.target.value }))}
          />
          <LabeledInput
            label="Total Permit Expiry Date"
            type="date"
            value={form.totalPermitExpiryDate}
            onChange={(e) =>
              setForm((p) => ({ ...p, totalPermitExpiryDate: e.target.value }))
            }
          />

          <button
            type="button"
            onClick={handleSave}
            className="w-full h-12 rounded-2xl bg-primary text-white font-semibold"
          >
            Save Vehicle
          </button>
        </div>
      </SlidePanel>
    </>
  );
}
