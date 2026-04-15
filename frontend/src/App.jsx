import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import DashboardHome from "./pages/DashboardHome";
import ProjectsPage from "./pages/ProjectsPage";
import MembersPage from "./pages/MembersPage";
import BillingPage from "./pages/BillingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import SidebarLayout from "./components/SidebarLayout";

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <p className="text-lg">Loading app...</p>
            </div>
        );
    }

    return (
        <Routes>
            {/* Root */}
            <Route
                path="/"
                element={
                    user ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />

            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected App Shell */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <SidebarLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardHome />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="members" element={<MembersPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="/pricing" element={<Pricing />} />
            </Route>

            {/* Fallback */}
            <Route
                path="*"
                element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
            />
        </Routes>
    );
}

export default App;