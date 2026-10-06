import { useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import { authApi } from "../../api/authApi";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      setIsComplete(true);
      toast.success("Password reset successfully");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-8">
      <h1 className="mb-3 text-center text-3xl font-bold text-slate-900">Reset your password</h1>
      {isComplete ? (
        <div className="text-center">
          <p className="mb-6 text-slate-600">Your password has been updated. Sign in with your new password.</p>
          <Link to="/" className="inline-flex bg-[#7C3AED] px-5 py-3 font-semibold text-white hover:bg-[#5e2db3]">Return to sign in</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="mb-6 text-center text-slate-600">Choose a new password with at least 8 characters.</p>
          {error && <p role="alert" className="border-l-4 border-red-500 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
          <div>
            <label htmlFor="reset-password" className="mb-1 block text-sm font-medium text-slate-700">New password</label>
            <input id="reset-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-600" />
          </div>
          <div>
            <label htmlFor="reset-confirm-password" className="mb-1 block text-sm font-medium text-slate-700">Confirm new password</label>
            <input id="reset-confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-600" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-[#7C3AED] px-5 py-3 font-semibold text-white hover:bg-[#5e2db3] disabled:opacity-50">{isSubmitting ? "Updating password..." : "Set new password"}</button>
          <p className="text-center text-sm text-slate-600">
            Link expired? <Link to="/forgot-password" className="font-semibold text-[#7C3AED] hover:underline">Request another reset link</Link>
          </p>
        </form>
      )}
    </section>
  );
};

export default ResetPassword;