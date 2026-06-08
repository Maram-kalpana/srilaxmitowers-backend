import { createHashRouter, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects";
import Machine from "../pages/Machine";
import Vehicle from "../pages/Vehicle";
import Employees from "../pages/Employees";
import Attendance from "../pages/Attendance";
import SalarySlips from "../pages/SalarySlips";
import WorkDetails from "../pages/WorkDetails";
import Expenses from "../pages/Expenses";
import Profile from "../pages/Profile";
import Register from "../pages/Register";
import EmployeePortal from "../pages/EmployeePortal";

export const router = createHashRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/employee",
    element: <EmployeePortal />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "projects", element: <Projects /> },
      { path: "machine", element: <Machine /> },
      { path: "vehicle", element: <Vehicle /> },
      { path: "employees", element: <Employees /> },
      { path: "attendance", element: <Attendance /> },
      { path: "salary-slips", element: <SalarySlips /> },
      { path: "expenses", element: <Expenses /> },
      { path: "work-details", element: <WorkDetails /> },
      { path: "profile", element: <Profile /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
