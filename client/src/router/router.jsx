import { createBrowserRouter } from "react-router";

import Dashboard from "../pages/Dashboard";
import Expenses from "../pages/Expenses";
import LoginPage from "../pages/authPages/LoginPage";
import RegisterPage from "../pages/authPages/RegisterPage";
import ErrorPage from "../pages/ErrorPage";
import ReviewReceipt from "../pages/ReviewReceipt";
import MainLayout from "../components/layout/mainLayout/MainLayout";
import AuthLayout from "../components/layout/authLayout/AuthLayout";
import ProtectedRoute from "../routes/ProtectedRoute";
import PublicRoute from "../routes/PublicRoute";
import UploadReceipt from "../pages/UploadReceipt";
import ForgotPassword from "../pages/authPages/ForgotPassword";
import VerifyEmail from "../pages/authPages/VerifyEmail";
import Premium from "../pages/Premium";
import Budgets from "../pages/Budgets";
import RecurringExpenses from "../pages/RecurringExpenses";
import Analytics from "../pages/Analytics";
import Receipts from "../pages/Receipts";
import Admin from "../pages/Admin";
import ResetPassword from "../pages/authPages/ResetPassword";
import Settings from "../pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/verify-email/:token",
    Component: AuthLayout,
    errorElement: <ErrorPage />,
    children: [{ index: true, Component: VerifyEmail }],
  },
  {
    path: "/reset-password/:token",
    Component: AuthLayout,
    errorElement: <ErrorPage />,
    children: [{ index: true, Component: ResetPassword }],
  },
  {
    path: "/",
    Component: PublicRoute,
    children: [
      {
        Component: AuthLayout,
        errorElement: <ErrorPage />,
        children: [
          { index: true, Component: LoginPage },
          { path: "register", Component: RegisterPage },
          { path: "forgot-password", Component: ForgotPassword },
        ],
      },
    ],
  },
  {
    path: "/app",
    Component: ProtectedRoute,
    children: [
      {
        Component: MainLayout,
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            Component: Dashboard,
            handle: { title: "Dashboard", subtitle: "Welcome Back" },
          },
          {
            path: "review-receipt",
            Component: ReviewReceipt,
            handle: {
              title: "Review Receipt",
              subtitle: "Verify and edit extracted data",
            },
          },
          {
            path: "expenses",
            Component: Expenses,
            handle: {
              title: "Expenses",
              subtitle: "Manage and track all your expenses",
            },
          },
          {
            path: "budgets",
            Component: Budgets,
            handle: { title: "Budgets", subtitle: "Plan and monitor category limits" },
          },
          {
            path: "recurring-expenses",
            Component: RecurringExpenses,
            handle: { title: "Recurring Expenses", subtitle: "Manage scheduled expenses" },
          },
          {
            path: "analytics",
            Component: Analytics,
            handle: { title: "Analytics", subtitle: "Explore your spending" },
          },
          {
            path: "receipts",
            Component: Receipts,
            handle: { title: "Receipt history", subtitle: "Review cloud-scanned receipts" },
          },
          {
            path: "admin",
            Component: Admin,
            handle: { title: "Administration", subtitle: "Users and audit activity" },
          },
          {
            path: "premium",
            Component: Premium,
            handle: { title: "Premium", subtitle: "Plans and membership" },
          },
          {
            path: "settings",
            Component: Settings,
            handle: { title: "Settings", subtitle: "Security and system status" },
          },
          {
            path: "upload-receipt",
            Component: UploadReceipt,
            handle: {
              title: "Upload Receipt",
              subtitle: "Capture your receipt using your camera",
            },
          },
        ],
      },
    ],
  },
]);
