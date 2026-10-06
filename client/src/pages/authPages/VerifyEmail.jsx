import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/authApi";

const VerifyEmail = () => {
  const { token } = useParams();
  const { isAuthenticated, isLoading: isSessionLoading } = useAuth();
  const requestedToken = useRef(null);
  const [status, setStatus] = useState("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!token || requestedToken.current === token) return;
    requestedToken.current = token;

    authApi.verifyEmail(token)
      .then(() => setStatus("verified"))
      .catch((error) => {
        setErrorMessage(error.message);
        setStatus("error");
      });
  }, [token]);

  const handleResend = async (event) => {
    event.preventDefault();
    setIsResending(true);
    try {
      await authApi.resendVerification(email);
      setResendSent(true);
      toast.success("If an account exists for this email, a verification link has been sent.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <section className="py-8" aria-live="polite">
      <h1 className="mb-4 text-center text-3xl font-bold text-gray-900">
        {status === "verifying" && "Verifying your email"}
        {status === "verified" && "Email verified"}
        {status === "error" && "Verification link unavailable"}
      </h1>

      {status === "verifying" && (
        <p className="text-center text-gray-600">Please wait while we confirm your email address.</p>
      )}

      {status === "verified" && (
        <div className="text-center">
          <p className="mb-8 text-gray-600">Your email is verified. You can now use all account features.</p>
          {isSessionLoading ? (
            <p className="text-gray-500">Preparing your account...</p>
          ) : (
            <Link
              to={isAuthenticated ? "/app" : "/"}
              className="inline-flex rounded-lg bg-[#7C3AED] px-5 py-3 font-semibold text-white hover:bg-[#5e2db3]"
            >
              {isAuthenticated ? "Go to dashboard" : "Continue to sign in"}
            </Link>
          )}
        </div>
      )}

      {status === "error" && (
        <>
          <p className="mb-6 text-center text-gray-600">
            {errorMessage || "This verification link is invalid or has expired."}
          </p>
          {!resendSent ? (
            <form onSubmit={handleResend} className="space-y-4">
              <label htmlFor="verification-email" className="sr-only">
                Email address
              </label>
              <input
                id="verification-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
              <button
                type="submit"
                disabled={isResending}
                className="w-full rounded-lg bg-[#7C3AED] px-5 py-3 font-semibold text-white hover:bg-[#5e2db3] disabled:cursor-wait disabled:opacity-60"
              >
                {isResending ? "Sending..." : "Resend verification email"}
              </button>
            </form>
          ) : (
            <p className="mb-6 text-center text-gray-600">
              If an account exists for that email, a new verification link is on its way.
            </p>
          )}
          <p className="mt-6 text-center">
            {!isSessionLoading && (
              <Link to={isAuthenticated ? "/app" : "/"} className="font-semibold text-[#7C3AED] hover:underline">
                {isAuthenticated ? "Back to dashboard" : "Back to sign in"}
              </Link>
            )}
          </p>
        </>
      )}
    </section>
  );
};

export default VerifyEmail;