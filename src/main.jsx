import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { router } from "./routes/index.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <AppProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AppProvider>
  </AuthProvider>
);
