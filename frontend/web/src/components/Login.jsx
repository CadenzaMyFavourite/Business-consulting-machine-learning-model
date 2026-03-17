import { useState } from "react";
import api from "../api";

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
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

      const token = response.data?.access_token;
      if (token) {
        localStorage.setItem("auth_token", token);
        onSuccess(token);
      }
    } catch (err) {
      setError("Login failed. Check credentials and try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-semibold text-slate-800">
          Smart Analytics Login
        </h1>
        <form onSubmit={handleSubmit}>
          <label className="block py-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>
          <label className="block py-2">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </label>
          {error ? (
            <div className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <button
            className="mt-6 w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            type="submit"
          >
            Sign in
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Use <strong>admin@example.com</strong> / <strong>password123</strong>
        </p>
      </div>
    </div>
  );
}
