import { useEffect, useMemo, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import api, { buildWebSocketUrl, setAuthToken } from "../api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function SummaryCard({ label, value, tone }) {
  const toneClasses = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    sky: "border-sky-200 bg-sky-50 text-sky-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
  };

  return (
    <div className={`rounded-[1.5rem] border p-5 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function InfoBlock({ title, body }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function TaskRow({ task, onUpdate, onDelete }) {
  return (
    <tr className="border-b border-slate-200 last:border-b-0">
      <td className="px-4 py-3 font-medium text-slate-900">{task.title}</td>
      <td className="px-4 py-3">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
          {task.status}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-700">{task.priority}</td>
      <td className="px-4 py-3">
        <button
          className="mr-2 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-amber-200"
          onClick={() => onUpdate({ ...task, status: task.status === "done" ? "todo" : "done" })}
        >
          Toggle
        </button>
        <button
          className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

export default function Dashboard({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [prediction, setPrediction] = useState(null);
  const [inputFeatures, setInputFeatures] = useState({
    customers: 100,
    repeat_rate: 0.5,
    avg_age: 30,
    social_engagement: 0.35,
  });
  const [error, setError] = useState(null);

  const handleRequestError = (err, fallbackMessage) => {
    if (err?.response?.status === 401) {
      onLogout();
      return true;
    }

    setError(fallbackMessage);
    return false;
  };

  const serializeTaskInput = (task) => ({
    title: task.title,
    description: task.description || "",
    status: task.status || "todo",
    priority: task.priority || 3,
    due_date: task.due_date || null,
  });

  const loadCurrentUser = async () => {
    try {
      const res = await api.get("/users/me");
      setCurrentUser(res.data);
    } catch (err) {
      handleRequestError(err, "Failed to load your account.");
    }
  };

  const loadTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      handleRequestError(err, "Failed to load tasks.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      onLogout();
      return undefined;
    }

    setAuthToken(token);
    loadCurrentUser();
    loadTasks();

    const ws = new WebSocket(buildWebSocketUrl("/ws/tasks", token));
    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data?.type === "task_created" || data?.type === "task_updated" || data?.type === "task_deleted") {
        loadTasks();
      }
    });
    ws.addEventListener("close", (event) => {
      if (event.code === 1008) {
        onLogout();
      }
    });

    return () => ws.close();
  }, [onLogout]);

  const handleCreate = async () => {
    if (!newTask.title) {
      setError("Task title is required.");
      return;
    }

    try {
      await api.post("/tasks", { ...serializeTaskInput(newTask), status: "todo", priority: 3 });
      setNewTask({ title: "", description: "" });
      setError(null);
    } catch (err) {
      handleRequestError(err, "Could not create task.");
    }
  };

  const handleUpdate = async (updated) => {
    try {
      await api.put(`/tasks/${updated.id}`, serializeTaskInput(updated));
    } catch (err) {
      handleRequestError(err, "Could not update task.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
    } catch (err) {
      handleRequestError(err, "Could not delete task.");
    }
  };

  const handlePredict = async () => {
    setError(null);
    try {
      const res = await api.post("/predict", inputFeatures);
      setPrediction(res.data.prediction);
    } catch (err) {
      handleRequestError(err, "Prediction failed.");
    }
  };

  const taskSummary = useMemo(() => {
    const counts = tasks.reduce(
      (acc, task) => {
        acc.total += 1;
        acc[task.status] = (acc[task.status] || 0) + 1;
        if (task.status === "done") {
          acc.completed += 1;
        }
        return acc;
      },
      { total: 0, completed: 0 }
    );

    return {
      total: counts.total,
      completed: counts.completed,
      open: counts.total - counts.completed,
    };
  }, [tasks]);

  const chartData = useMemo(() => {
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          label: "Tasks",
          data: Object.values(statusCounts),
          backgroundColor: ["#f59e0b", "#0ea5e9", "#10b981", "#475569"],
          borderRadius: 12,
        },
      ],
    };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_28%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_45%,_#eef2ff_100%)]">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              Smart Analytics Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">
              {currentUser ? currentUser.email : "Loading account..."}
            </h1>
          </div>
          <button
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Total tasks" value={taskSummary.total} tone="amber" />
          <SummaryCard label="Open work" value={taskSummary.open} tone="sky" />
          <SummaryCard label="Completed" value={taskSummary.completed} tone="emerald" />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_80px_-50px_rgba(15,23,42,0.35)]">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Tasks</h2>
              <p className="text-sm text-slate-600">
                Create, toggle, and remove tasks from a single view.
              </p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-amber-300 focus:bg-white"
                placeholder="Title"
                value={newTask.title}
                onChange={(event) => setNewTask((current) => ({ ...current, title: event.target.value }))}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-amber-300 focus:bg-white"
                placeholder="Description"
                value={newTask.description}
                onChange={(event) =>
                  setNewTask((current) => ({ ...current, description: event.target.value }))
                }
              />
              <button
                className="rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
                onClick={handleCreate}
              >
                Add task
              </button>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length ? (
                    tasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                      />
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={4}>
                        No tasks yet. Add one above or load the sample dataset for a demo workspace.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_80px_-50px_rgba(15,23,42,0.35)]">
            <h2 className="text-lg font-semibold text-slate-950">Task status overview</h2>
            <p className="mt-1 text-sm text-slate-600">
              The chart refreshes when your authenticated task stream receives updates.
            </p>
            <div className="mt-5 h-72">
              <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_20px_80px_-50px_rgba(15,23,42,0.6)]">
            <h2 className="text-lg font-semibold">Predict KPI</h2>
            <p className="mt-1 text-sm text-slate-300">
              Use the demo forecaster for quick sanity checks on customer and engagement inputs.
            </p>
            <div className="mt-5 grid gap-3">
              <label className="text-sm font-medium text-slate-200">
                Customers
                <input
                  type="number"
                  value={inputFeatures.customers}
                  onChange={(event) =>
                    setInputFeatures((current) => ({
                      ...current,
                      customers: Number(event.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-amber-300 focus:bg-white/10"
                />
              </label>
              <label className="text-sm font-medium text-slate-200">
                Repeat rate
                <input
                  type="number"
                  step="0.01"
                  value={inputFeatures.repeat_rate}
                  onChange={(event) =>
                    setInputFeatures((current) => ({
                      ...current,
                      repeat_rate: Number(event.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-amber-300 focus:bg-white/10"
                />
              </label>
              <label className="text-sm font-medium text-slate-200">
                Average age
                <input
                  type="number"
                  value={inputFeatures.avg_age}
                  onChange={(event) =>
                    setInputFeatures((current) => ({
                      ...current,
                      avg_age: Number(event.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-amber-300 focus:bg-white/10"
                />
              </label>
              <label className="text-sm font-medium text-slate-200">
                Social engagement
                <input
                  type="number"
                  step="0.01"
                  value={inputFeatures.social_engagement}
                  onChange={(event) =>
                    setInputFeatures((current) => ({
                      ...current,
                      social_engagement: Number(event.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-amber-300 focus:bg-white/10"
                />
              </label>
              <button
                className="rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
                onClick={handlePredict}
              >
                Predict KPI
              </button>
              {prediction !== null ? (
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                  Predicted KPI: <strong>{prediction.toFixed(3)}</strong>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_80px_-50px_rgba(15,23,42,0.35)]">
            <h2 className="text-lg font-semibold text-slate-950">Working notes</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <InfoBlock
                title="Getting started"
                body="Create an account directly in the app. If you prefer a seeded workspace, run the sample-data loader and use the demo user."
              />
              <InfoBlock
                title="Realtime updates"
                body="The dashboard opens an authenticated WebSocket connection tied to the current user, so task updates stay private."
              />
              <InfoBlock
                title="Local development"
                body="Vite proxies API and WebSocket traffic to the FastAPI backend by default, which keeps local setup simple."
              />
              <InfoBlock
                title="Prediction model"
                body="The KPI forecaster is still a demo PyTorch model. Swap in production data and weights before relying on it."
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
