import { IoPersonOutline } from "react-icons/io5";
import { MdOutlineEmail, MdOutlineLock } from "react-icons/md";
import { TfiReceipt } from "react-icons/tfi";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useFormik } from "formik";
import { registerSchema } from "../../validation/authValidation";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { authApi } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const result = await authApi.register({
          name: [values.firstName, values.lastName].filter(Boolean).join(" "),
          email: values.email,
          password: values.password,
        });
        login(result);
        toast.success("Account created. Please verify your email before adding expenses.");
        navigate("/app");
      } catch (error) {
        toast.error(error.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700 sm:h-10 sm:w-10">
          <TfiReceipt size={21} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">ScanSpend</h2>
      </div>

      <div className="space-y-1 text-center">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Create your account</h3>
        <p className="text-xs text-slate-600 sm:text-sm">Track expenses and find better spending insights.</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="mb-1 block text-xs font-medium text-slate-700 sm:text-sm">First name</label>
            <div className="relative">
              <IoPersonOutline size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-violet-600" />
              <input
                id="firstName"
                type="text"
                name="firstName"
                required
                autoComplete="given-name"
                maxLength={30}
                placeholder="First name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                  formik.touched.firstName && formik.errors.firstName
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-300 focus:border-violet-500 focus:ring-violet-100"
                }`}
              />
            </div>
            {formik.touched.firstName && formik.errors.firstName && <p className="mt-1 text-xs text-red-600">{formik.errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="mb-1 block text-xs font-medium text-slate-700 sm:text-sm">Last name</label>
            <div className="relative">
              <IoPersonOutline size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-violet-600" />
              <input
                id="lastName"
                type="text"
                name="lastName"
                autoComplete="family-name"
                maxLength={30}
                placeholder="Last name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                  formik.touched.lastName && formik.errors.lastName
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-300 focus:border-violet-500 focus:ring-violet-100"
                }`}
              />
            </div>
            {formik.touched.lastName && formik.errors.lastName && <p className="mt-1 text-xs text-red-600">{formik.errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-700 sm:text-sm">Email</label>
          <div className="relative">
            <MdOutlineEmail size={22} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-violet-600" />
            <input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your email"
              className={`w-full rounded-lg border bg-white py-2.5 pl-11 pr-3 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                formik.touched.email && formik.errors.email
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-violet-500 focus:ring-violet-100"
              }`}
            />
          </div>
          {formik.touched.email && formik.errors.email && <p className="mt-1 text-xs text-red-600">{formik.errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-xs font-medium text-slate-700 sm:text-sm">Password</label>
          <div className="relative">
            <MdOutlineLock size={22} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-violet-600" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              required
              minLength={8}
              maxLength={30}
              autoComplete="new-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Create a password"
              className={`w-full rounded-lg border bg-white py-2.5 pl-11 pr-11 text-sm text-slate-900 outline-none transition focus:ring-2 ${
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

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-xs font-medium text-slate-700 sm:text-sm">Confirm password</label>
          <div className="relative">
            <MdOutlineLock size={22} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-violet-600" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              required
              minLength={8}
              maxLength={30}
              autoComplete="new-password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Confirm password"
              className={`w-full rounded-lg border bg-white py-2.5 pl-11 pr-11 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-violet-500 focus:ring-violet-100"
              }`}
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{formik.errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
        >
          {formik.isSubmitting ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <p className="text-center text-sm text-slate-600">
        Already have an account? <Link to="/" className="font-semibold text-violet-700 hover:text-violet-800">Sign in</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
