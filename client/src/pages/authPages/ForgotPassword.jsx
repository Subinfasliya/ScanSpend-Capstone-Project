import { MdOutlineEmail } from "react-icons/md";
import { Link } from "react-router";
import { useState } from "react";
import { toast } from "react-toastify";
import { authApi } from "../../api/authApi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await authApi.forgotPassword(email);
      toast.success(result?.message || "Password reset instructions have been sent.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h2 className="text-4xl text-center font-bold mb-4">Forgot Password</h2>
      <p>Enter your email address and we'll send you a password reset link.</p>

      <form onSubmit={handleSubmit}>
      <div className="relative my-5">
        <MdOutlineEmail
          size={24}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C3AED]"
        />
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="w-full rounded-lg py-4 pl-12 pr-12 outline-none shadow-sm border border-gray-300 focus:ring-2 focus:ring-[#7C3AED]"
        />
      </div>
      <div className="my-5 flex items-center justify-between">
        <Link to={"/"}>
          <button className="py-2 px-4  rounded-xl border text-md cursor-pointer hover:border-white hover:bg-gray-400 hover:text-white hover:font-semibold">
            Back to Login
          </button>
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className=" py-2 px-4 border rounded-lg font-semibold text-md bg-[#7C3AED] text-white cursor-pointer hover:bg-[#5e2db3]  transition"
        >
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </button>
      </div>
      </form>
    </>
  );
};
export default ForgotPassword;
