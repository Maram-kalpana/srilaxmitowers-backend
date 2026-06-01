import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppContext } from "./context";
import {
  emptyReports,
  getDefaultProjects,
  getDefaultUsers,
  getDefaultWorkDetails,
} from "../data/erpSeed";

const LS_KEY = "erp_app_state";

function loadPersisted() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data?.projects && data?.users) {
        return data;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

function getInitialState() {
  const saved = loadPersisted();
  if (saved) {
    return {
      projects: saved.projects,
      users: saved.users,
      workDetails: saved.workDetails ?? getDefaultWorkDetails(),
      reports: {
        ...emptyReports(),
        ...saved.reports,
      },
    };
  }
  return {
    projects: getDefaultProjects(),
    users: getDefaultUsers(),
    workDetails: getDefaultWorkDetails(),
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
  const [users, setUsers] = useState(initialRef.current.users);
  const [workDetails, setWorkDetails] = useState(initialRef.current.workDetails);
  const [reports] = useState(initialRef.current.reports);

  useEffect(() => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({ projects, users, workDetails, reports })
    );
  }, [projects, users, workDetails, reports]);

  const value = useMemo(
    () => ({
      projects,
      setProjects,
      users,
      setUsers,
      workDetails,
      setWorkDetails,
    }),
    [projects, users, workDetails]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
