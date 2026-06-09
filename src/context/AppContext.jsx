import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppContext } from "./context";
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
      if (data?.projects && data?.employees) {
        return data;
      }
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
      reports: {
        ...emptyReports(),
        ...saved.reports,
      },
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
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const initialRef = useRef(null);
  if (!initialRef.current) {
    initialRef.current = getInitialState();
  }
  const [projects, setProjects] = useState(initialRef.current.projects);
  const [workDetails, setWorkDetails] = useState(initialRef.current.workDetails);
  const [employees, setEmployees] = useState(initialRef.current.employees);
  const [attendance, setAttendance] = useState(initialRef.current.attendance);
  const [expenses, setExpenses] = useState(initialRef.current.expenses);
  const [machines, setMachines] = useState(initialRef.current.machines);
  const [vehicles, setVehicles] = useState(initialRef.current.vehicles);
  const [reports] = useState(initialRef.current.reports);

  useEffect(() => {
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
  }, [projects, workDetails, employees, attendance, expenses, machines, vehicles, reports]);

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
    }),
    [projects, workDetails, employees, attendance, expenses, machines, vehicles]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
