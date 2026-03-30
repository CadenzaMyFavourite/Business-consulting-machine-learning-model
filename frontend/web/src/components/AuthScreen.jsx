import { useMemo, useState } from "react";
import api from "../api";

const emptyForm = {
  email: "",
  password: "",
  confirmPassword: "",
};

async function loginWithCredentials(email, password) {
  const response = await api.post(
    "/auth/token",
    new URLSearchParams({
      username: email,
      password,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  return response.data?.access_token;
}

function FeatureCard({ title, body }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-5">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

export default function AuthScreen({ onSuccess }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState("Create an account or use the demo user after loading sample data.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLabel = useMemo(
    () => (mode === "login" ? "Sign in" : "Create account"),
    [mode]
  );

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const fillDemoCredentials = () => {
    setMode("login");
    setForm({
      email: "admin@example.com",
      password: "password123",
      confirmPassword: "",
    });
    setInfo("Demo credentials loaded. They work after `python -m data.load_sample_data`.");
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        await api.post("/auth/register", {
          email: form.email,
          password: form.password,
        });
      }

      const token = await loginWithCredentials(form.email, form.password);
      if (!token) {
        setError("The server did not return an access token.");
        return;
      }

      localStorage.setItem("auth_token", token);
      onSuccess(token);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : `${submitLabel} failed. Try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(252,211,77,0.24),_transparent_28%),linear-gradient(180deg,_#fffdf7_0%,_#fff7ed_38%,_#eff6ff_100%)] px-4 py-10 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-amber-200/60 bg-white/70 p-8 shadow-[0_30px_120px_-60px_rgba(15,23,42,0.5)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-700">
            Smart Analytics Platform
          </p>
          <h1 className="mt-4 max-w-xl font-['Trebuchet_MS','Segoe_UI',sans-serif] text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            One frontend, one workflow, and a faster path from signup to insight.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700">
            This project now uses the Vite + React dashboard as the only frontend path.
            Sign in to manage tasks, watch real-time updates, and run KPI predictions from
            the same workspace.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <FeatureCard
              title="Live task board"
              body="Task updates stay scoped to the signed-in user over authenticated WebSocket connections."
            />
            <FeatureCard
              title="Predictive tools"
              body="Run KPI forecasts without leaving the dashboard or juggling a second app."
            />
            <FeatureCard
              title="Sane onboarding"
              body="Create an account immediately, or load demo data when you want a ready-made sandbox."
            />
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <div className="flex rounded-full bg-white/10 p-1 text-sm">
            <button
              type="button"
              className={`flex-1 rounded-full px-4 py-2 transition ${
                mode === "login" ? "bg-white text-slate-950" : "text-slate-300"
              }`}
              onClick={() => {
                setMode("login");
                setError(null);
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`flex-1 rounded-full px-4 py-2 transition ${
                mode === "register" ? "bg-white text-slate-950" : "text-slate-300"
              }`}
              onClick={() => {
                setMode("register");
                setError(null);
              }}
            >
              Create account
            </button>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold">
              {mode === "login" ? "Welcome back" : "Start with a fresh account"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{info}</p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-slate-200">Email</span>
              <input
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:bg-white/10"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                type="email"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-200">Password</span>
              <input
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:bg-white/10"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                type="password"
                placeholder="Enter a password"
                required
              />
            </label>

            {mode === "register" ? (
              <label className="block">
                <span className="text-sm font-medium text-slate-200">Confirm password</span>
                <input
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:bg-white/10"
                  value={form.confirmPassword}
                  onChange={(event) => updateField("confirmPassword", event.target.value)}
                  type="password"
                  placeholder="Repeat your password"
                  required
                />
              </label>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              className="w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Working..." : submitLabel}
            </button>
          </form>

          <button
            type="button"
            className="mt-4 w-full rounded-2xl border border-white/15 px-4 py-3 text-sm text-slate-200 transition hover:border-amber-300 hover:text-white"
            onClick={fillDemoCredentials}
          >
            Fill demo credentials
          </button>

          <p className="mt-6 text-xs leading-6 text-slate-400">
            Demo user: <span className="text-slate-200">admin@example.com / password123</span>.
            Load it with <code>python -m data.load_sample_data</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
