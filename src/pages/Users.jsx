import React, { useEffect, useMemo, useState } from "react";
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
        className="w-full h-11 rounded-2xl border border-border bg-background px-4 text-foreground outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

export default function Users() {
  const { users, setUsers } = useApp();
  const [search, setSearch] = useState("");
  const [openPanel, setOpenPanel] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const emptyForm = { name: "", phone: "", salary: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.phone?.toString() || "").includes(q) ||
        (u.salary?.toString() || "").includes(q)
    );
  }, [search, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const resetForm = () => setForm(emptyForm);

  const handleSave = () => {
    if (!form.name.trim()) return alert("Please enter name");
    if (!form.phone.trim()) return alert("Please enter phone number");
    if (!form.salary.toString().trim()) return alert("Please enter salary");

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      salary: form.salary.toString().trim(),
    };

    if (editingId) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingId ? { ...u, ...payload } : u))
      );
    } else {
      setUsers((prev) => [...prev, { id: `u-${Date.now()}`, ...payload }]);
    }

    setOpenPanel(false);
    setEditingId(null);
    resetForm();
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      salary: user.salary ?? "",
    });
    setOpenPanel(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this user?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <>
      <AdminLayout>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <p className="text-sm md:text-[15px] leading-6 text-muted-foreground">
              Manage team members with name, phone, and salary.
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
              Add user
            </button>
          </div>

          <div className="relative w-full max-w-[430px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search users..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="text-left py-3 px-4 border-b border-r border-border">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 border-b border-r border-border">
                    Phone Number
                  </th>
                  <th className="text-left py-3 px-4 border-b border-r border-border">
                    Salary
                  </th>
                  <th className="text-right py-3 px-4 border-b border-border">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3 px-4 border-b border-r border-border">
                      {user.name}
                    </td>
                    <td className="py-3 px-4 border-b border-r border-border">
                      {user.phone || "-"}
                    </td>
                    <td className="py-3 px-4 border-b border-r border-border">
                      {user.salary ?? "-"}
                    </td>
                    <td className="py-3 px-4 border-b border-border text-right">
                      <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => handleEdit(user)}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-10 border-b border-border text-muted-foreground"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-row justify-between items-center gap-3 mt-4 px-4">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-50 hover:bg-secondary transition"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-50 hover:bg-secondary transition"
            >
              Next
            </button>
          </div>
        </div>
      </AdminLayout>

      <SlidePanel open={openPanel} onClose={() => setOpenPanel(false)}>
        <div className="p-7 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{editingId ? "Edit user" : "Add user"}</h2>
            <button
              type="button"
              onClick={() => setOpenPanel(false)}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-secondary transition"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <LabeledInput
            label="Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Full name"
          />
          <LabeledInput
            label="Phone Number"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="Phone number"
          />
          <LabeledInput
            label="Salary"
            type="number"
            value={form.salary}
            onChange={(e) => setForm((prev) => ({ ...prev, salary: e.target.value }))}
            placeholder="Monthly salary"
          />
          <button
            type="button"
            onClick={handleSave}
            className="w-full h-12 rounded-2xl bg-primary text-white font-semibold"
          >
            Save
          </button>
        </div>
      </SlidePanel>
    </>
  );
}
