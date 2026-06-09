import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppContext } from "./context";
import { USE_API } from "../api/client.js";
import * as erpApi from "../api/erpApi.js";
import { syncAttendance, syncCollection } from "../api/syncHelper.js";
import {
  emptyReports,
  getDefaultProjects,
  getDefaultWorkDetails,
  getDefaultEmployees,
  getDefaultAttendance,
  getDefaultVehicles,
} from "../data/erpSeed";

const LS_KEY = "erp_app_state";

function loadPersisted() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data?.projects && data?.employees) return data;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function backfillProjectManagers(projects, employees) {
  return (projects ?? []).map((project) => {
    if (project.managerName) return project;
    if (!project.managerId) return project;
    const manager = (employees ?? []).find((e) => e.id === project.managerId);
    return manager ? { ...project, managerName: manager.name } : project;
  });
}

function getInitialState() {
  const saved = loadPersisted();
  if (saved) {
    const employees = saved.employees ?? getDefaultEmployees();
    return {
      projects: backfillProjectManagers(saved.projects, employees),
      workDetails: saved.workDetails ?? getDefaultWorkDetails(),
      employees,
      attendance: saved.attendance ?? getDefaultAttendance(),
      expenses: saved.expenses ?? [],
      machines: saved.machines ?? [],
      vehicles: saved.vehicles ?? getDefaultVehicles(),
      reports: { ...emptyReports(), ...saved.reports },
    };
  }
  return {
    projects: getDefaultProjects(),
    workDetails: getDefaultWorkDetails(),
    employees: getDefaultEmployees(),
    attendance: getDefaultAttendance(),
    expenses: [],
    machines: [],
    vehicles: getDefaultVehicles(),
    reports: emptyReports(),
  };
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

export const AppProvider = ({ children }) => {
  const initialRef = useRef(null);
  if (!initialRef.current) initialRef.current = getInitialState();

  const [projects, setProjectsState] = useState(initialRef.current.projects);
  const [workDetails, setWorkDetailsState] = useState(initialRef.current.workDetails);
  const [employees, setEmployeesState] = useState(initialRef.current.employees);
  const [attendance, setAttendanceState] = useState(initialRef.current.attendance);
  const [expenses, setExpensesState] = useState(initialRef.current.expenses);
  const [machines, setMachinesState] = useState(initialRef.current.machines);
  const [vehicles, setVehiclesState] = useState(initialRef.current.vehicles);
  const [reports] = useState(initialRef.current.reports);
  const [apiReady, setApiReady] = useState(!USE_API);

  const projectsRef = useRef(projects);
  const workDetailsRef = useRef(workDetails);
  const employeesRef = useRef(employees);
  const attendanceRef = useRef(attendance);
  const expensesRef = useRef(expenses);
  const machinesRef = useRef(machines);
  const vehiclesRef = useRef(vehicles);

  projectsRef.current = projects;
  workDetailsRef.current = workDetails;
  employeesRef.current = employees;
  attendanceRef.current = attendance;
  expensesRef.current = expenses;
  machinesRef.current = machines;
  vehiclesRef.current = vehicles;

  useEffect(() => {
    async function loadFromApi() {
      if (!USE_API || !localStorage.getItem("erp_access_token")) {
        setApiReady(true);
        return;
      }
      try {
        const [p, e, v, m, ex, w, a] = await Promise.all([
          erpApi.fetchAll("projects"),
          erpApi.fetchAll("employees"),
          erpApi.fetchAll("vehicles"),
          erpApi.fetchAll("machines"),
          erpApi.fetchAll("expenses"),
          erpApi.fetchAll("workDetails"),
          erpApi.fetchAll("attendance"),
        ]);
        setProjectsState(backfillProjectManagers(p, e));
        setEmployeesState(e);
        setVehiclesState(v);
        setMachinesState(m);
        setExpensesState(ex);
        setWorkDetailsState(w);
        setAttendanceState(a);
      } catch (err) {
        console.error("API load failed, using local data", err);
      } finally {
        setApiReady(true);
      }
    }
    loadFromApi();
  }, []);

  useEffect(() => {
    if (!apiReady) return;
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        projects,
        workDetails,
        employees,
        attendance,
        expenses,
        machines,
        vehicles,
        reports,
      })
    );
  }, [projects, workDetails, employees, attendance, expenses, machines, vehicles, reports, apiReady]);

  const setProjects = useCallback(async (updater) => {
    const prev = projectsRef.current;
    const next = typeof updater === "function" ? updater(prev) : updater;
    setProjectsState(next);
    projectsRef.current = next;
    if (!USE_API || !localStorage.getItem("erp_access_token")) return;
    try {
      const synced = await syncCollection("projects", prev, next);
      if (JSON.stringify(synced) !== JSON.stringify(next)) {
        setProjectsState(synced);
        projectsRef.current = synced;
      }
    } catch (e) {
      console.error("Sync projects failed", e);
    }
  }, []);

  const setEmployees = useCallback(async (updater) => {
    const prev = employeesRef.current;
    const next = typeof updater === "function" ? updater(prev) : updater;
    setEmployeesState(next);
    employeesRef.current = next;
    if (!USE_API || !localStorage.getItem("erp_access_token")) return;
    try {
      const synced = await syncCollection("employees", prev, next);
      if (JSON.stringify(synced) !== JSON.stringify(next)) {
        setEmployeesState(synced);
        employeesRef.current = synced;
      }
    } catch (e) {
      console.error("Sync employees failed", e);
    }
  }, []);

  const setVehicles = useCallback(async (updater) => {
    const prev = vehiclesRef.current;
    const next = typeof updater === "function" ? updater(prev) : updater;
    setVehiclesState(next);
    vehiclesRef.current = next;
    if (!USE_API || !localStorage.getItem("erp_access_token")) return;
    try {
      const synced = await syncCollection("vehicles", prev, next);
      if (JSON.stringify(synced) !== JSON.stringify(next)) {
        setVehiclesState(synced);
        vehiclesRef.current = synced;
      }
    } catch (e) {
      console.error("Sync vehicles failed", e);
    }
  }, []);

  const setMachines = useCallback(async (updater) => {
    const prev = machinesRef.current;
    const next = typeof updater === "function" ? updater(prev) : updater;
    setMachinesState(next);
    machinesRef.current = next;
    if (!USE_API || !localStorage.getItem("erp_access_token")) return;
    try {
      const synced = await syncCollection("machines", prev, next);
      if (JSON.stringify(synced) !== JSON.stringify(next)) {
        setMachinesState(synced);
        machinesRef.current = synced;
      }
    } catch (e) {
      console.error("Sync machines failed", e);
    }
  }, []);

  const setExpenses = useCallback(async (updater) => {
    const prev = expensesRef.current;
    const next = typeof updater === "function" ? updater(prev) : updater;
    setExpensesState(next);
    expensesRef.current = next;
    if (!USE_API || !localStorage.getItem("erp_access_token")) return;
    try {
      const synced = await syncCollection("expenses", prev, next);
      if (JSON.stringify(synced) !== JSON.stringify(next)) {
        setExpensesState(synced);
        expensesRef.current = synced;
      }
    } catch (e) {
      console.error("Sync expenses failed", e);
    }
  }, []);

  const setWorkDetails = useCallback(async (updater) => {
    const prev = workDetailsRef.current;
    const next = typeof updater === "function" ? updater(prev) : updater;
    setWorkDetailsState(next);
    workDetailsRef.current = next;
    if (!USE_API || !localStorage.getItem("erp_access_token")) return;
    try {
      const synced = await syncCollection("workDetails", prev, next);
      if (JSON.stringify(synced) !== JSON.stringify(next)) {
        setWorkDetailsState(synced);
        workDetailsRef.current = synced;
      }
    } catch (e) {
      console.error("Sync workDetails failed", e);
    }
  }, []);

  const setAttendance = useCallback(async (updater) => {
    const prev = attendanceRef.current;
    const next = typeof updater === "function" ? updater(prev) : updater;
    setAttendanceState(next);
    attendanceRef.current = next;
    if (!USE_API || !localStorage.getItem("erp_access_token")) return;
    try {
      await syncAttendance(prev, next);
    } catch (e) {
      console.error("Attendance sync failed", e);
    }
  }, []);

  const value = useMemo(
    () => ({
      projects,
      setProjects,
      workDetails,
      setWorkDetails,
      employees,
      setEmployees,
      attendance,
      setAttendance,
      expenses,
      setExpenses,
      machines,
      setMachines,
      vehicles,
      setVehicles,
      apiReady,
    }),
    [
      projects,
      workDetails,
      employees,
      attendance,
      expenses,
      machines,
      vehicles,
      apiReady,
      setProjects,
      setWorkDetails,
      setEmployees,
      setAttendance,
      setExpenses,
      setMachines,
      setVehicles,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
