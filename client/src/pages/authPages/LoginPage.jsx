import { MdOutlineEmail, MdOutlineLock } from "react-icons/md";
import { TfiReceipt } from "react-icons/tfi";
import { Link, useNavigate } from "react-router";
import { useFormik } from "formik";
import { loginSchema } from "../../validation/authValidation";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { authApi } from "../../api/authApi";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      id: "",
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const result = await authApi.login({
          email: values.email,
          password: values.password,
        });
        login(result);
        toast.success("Login successful");
        navigate("/app");
      } catch (error) {
        toast.error(error.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-4">
      <div className="flex items-center justify-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 sm:h-11 sm:w-11">
          <TfiReceipt size={23} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">ScanSpend</h2>
      </div>

      <div className="space-y-1.5 text-center">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Welcome back</h3>
        <p className="text-xs text-slate-600 sm:text-sm">Sign in to manage your expenses and stay on top of your budget.</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-3.5 sm:space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-700 sm:text-sm">Email</label>
          <div className="relative">
            <MdOutlineEmail size={22} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-violet-600" />
            <input
              id="email"
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your email"
              className={`w-full rounded-lg border bg-white py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                formik.touched.email && formik.errors.email
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-violet-500 focus:ring-violet-100"
              }`}
            />
          </div>
          {formik.touched.email && formik.errors.email && <p className="mt-1 text-xs text-red-600">{formik.errors.email}</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="password" className="block text-xs font-medium text-slate-700 sm:text-sm">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-violet-700 hover:text-violet-800">Forgot password?</Link>
          </div>
          <div className="relative">
            <MdOutlineLock size={22} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-violet-600" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your password"
              className={`w-full rounded-lg border bg-white py-3 pl-12 pr-12 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                formik.touched.password && formik.errors.password
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-violet-500 focus:ring-violet-100"
              }`}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && <p className="mt-1 text-xs text-red-600">{formik.errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full rounded-lg bg-violet-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
        >
          {formik.isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <p className="text-center text-sm text-slate-600">
        Don’t have an account?{" "}
        <Link to="/register" className="font-semibold text-violet-700 hover:text-violet-800">Create one</Link>
      </p>
    </div>
  );
};

export default LoginPage;
