import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";
import { SessionSkeleton } from "../components/common/LoadingSkeleton";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <SessionSkeleton />;
  return isAuthenticated ? <Outlet /> : <Navigate to={"/"} replace />
};
export default ProtectedRoute;
