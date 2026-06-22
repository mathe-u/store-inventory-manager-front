"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/src/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { token } = await login(email, password);
      localStorage.setItem("API_TOKEN", token);
      if (rememberMe) {
        localStorage.setItem("REMEMBER_ME", "true");
      }
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col md:flex-row min-h-screen w-full bg-surface text-on-surface">
      {/* Left/Top Section: Login Form */}
      <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 bg-surface-container-lowest border-r border-outline-variant min-h-screen z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Brand / Header */}
        <div className="mb-12 flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-on-secondary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">storefront</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">MarketMaster</h1>
          </div>
          <h2 className="font-display-lg text-display-lg text-on-surface hidden md:block">Welcome back</h2>
          <h2 className="font-display-lg-mobile text-display-lg-mobile text-on-surface block md:hidden">Welcome back</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Enter your credentials to access the power seller suite.</p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3.5 rounded-lg bg-error-container text-on-error-container border border-error/20 font-body-md text-body-md flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <span className="material-symbols-outlined text-[20px] text-error">error</span>
              {error}
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary-fixed-dim/20 font-body-md text-body-md flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              Logged in successfully! Redirecting...
            </div>
          )}

          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-on-surface" htmlFor="email">Email address</label>
            <div className="relative flex items-center group">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant group-focus-within:text-secondary transition-colors text-[20px]">mail</span>
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all hover:border-outline"
                id="email"
                name="email"
                placeholder="admin@marketmaster.app"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-on-surface" htmlFor="password">Password</label>
            <div className="relative flex items-center group">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant group-focus-within:text-secondary transition-colors text-[20px]">lock</span>
              <input
                className="w-full pl-10 pr-10 py-2.5 bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all hover:border-outline"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Options Row */}
          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                className="w-4 h-4 rounded border-outline-variant text-secondary focus:ring-secondary focus:ring-offset-surface-container-lowest bg-surface-bright cursor-pointer transition-colors"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors select-none">Remember me</span>
            </label>
            <a
              className="font-label-sm text-label-sm text-secondary hover:text-on-secondary-fixed-variant transition-colors underline-offset-2 hover:underline"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Password reset feature coming soon!");
              }}
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            className="mt-4 w-full bg-secondary text-on-secondary font-label-sm text-label-sm py-3 px-4 rounded-lg hover:bg-on-secondary-fixed-variant active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
            ) : (
              <>
                Sign In
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Footer / Meta Links */}
        <div className="mt-12 text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            {"Don't have an account? "}
            <a
              className="font-label-sm text-label-sm text-secondary hover:text-on-secondary-fixed-variant transition-colors hover:underline"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Please request access from your team administrator.");
              }}
            >
              Request access
            </a>
          </p>
        </div>
      </div>

      {/* Right Section: Branding / Abstract Background */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative bg-primary-container overflow-hidden items-center justify-center p-12">
        {/* Abstract gradient/pattern layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container via-[#1a2540] to-primary opacity-90 z-0"></div>
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] z-0"></div>
        {/* Image from Local Source */}
        <div
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 z-0"
          style={{
            backgroundImage: "url('/login_bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Floating Glassmorphism Branding Card */}
        <div className="relative z-10 max-w-md w-full bg-surface-container-lowest/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col gap-6 transform translate-y-[-10%]">
          <div className="flex items-center gap-3 text-on-secondary">
            <span className="material-symbols-outlined text-[32px]">insights</span>
          </div>
          <blockquote className="font-headline-md text-headline-md text-on-secondary leading-snug">
            {"\"MarketMaster's ledger clarity has completely transformed our enterprise reconciliation speed.\""}
          </blockquote>
          <div className="flex items-center gap-4 mt-2">
            <div className="w-10 h-10 rounded-full bg-surface-container-lowest/20 flex items-center justify-center border border-white/20">
              <span className="material-symbols-outlined text-on-secondary text-[20px]">person</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-secondary">Sarah Jenkins</span>
              <span className="font-body-md text-body-md text-surface-dim opacity-80 text-[12px]">Director of Operations, Nexus Retail</span>
            </div>
          </div>
        </div>
        {/* Decorative subtle elements */}
        <div className="absolute bottom-12 right-12 z-10 text-on-secondary/30 font-data-tabular text-data-tabular">
          SYS.AUTH.v2.4.1
        </div>
      </div>
    </main>
  );
}
