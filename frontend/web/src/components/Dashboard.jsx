import { useEffect, useMemo, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import api, { setAuthToken } from "../api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function TaskRow({ task, onUpdate, onDelete }) {
  return (
    <tr className="border-b last:border-b-0">
      <td className="px-4 py-2">{task.title}</td>
      <td className="px-4 py-2">{task.status}</td>
      <td className="px-4 py-2">{task.priority}</td>
      <td className="px-4 py-2">
        <button
          className="mr-2 rounded bg-indigo-500 px-2 py-1 text-xs text-white hover:bg-indigo-600"
          onClick={() => onUpdate({ ...task, status: task.status === "done" ? "todo" : "done" })}
        >
          Toggle
        </button>
        <button
          className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
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
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [prediction, setPrediction] = useState(null);
  const [inputFeatures, setInputFeatures] = useState({
    customers: 100,
    repeat_rate: 0.5,
    avg_age: 30,
    social_engagement: 0.35,
  });
  const [error, setError] = useState(null);

  const loadTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setAuthToken(token);
    }
    loadTasks();

    const ws = new WebSocket((import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace("http", "ws") + "/ws/tasks");
    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data?.type === "task_created" || data?.type === "task_updated") {
        loadTasks();
      } else if (data?.type === "task_deleted") {
        loadTasks();
      }
    });

    return () => ws.close();
  }, []);

  const handleCreate = async () => {
    if (!newTask.title) {
      setError("Task title is required.");
      return;
    }
    try {
      await api.post("/tasks", { ...newTask, status: "todo", priority: 3 });
      setNewTask({ title: "", description: "" });
      loadTasks();
      setError(null);
    } catch (err) {
      setError("Could not create task.");
    }
  };

  const handleUpdate = async (updated) => {
    try {
      await api.put(`/tasks/${updated.id}`, updated);
      loadTasks();
    } catch (err) {
      setError("Could not update task.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      loadTasks();
    } catch (err) {
      setError("Could not delete task.");
    }
  };

  const handlePredict = async () => {
    setError(null);
    try {
      const res = await api.post("/predict", inputFeatures);
      setPrediction(res.data.prediction);
    } catch (err) {
      setError("Prediction failed.");
    }
  };

  const chartData = useMemo(() => {
    const statusCounts = tasks.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          label: "Tasks",
          data: Object.values(statusCounts),
          backgroundColor: ["#6366F1", "#34D399", "#F97316"],
        },
      ],
    };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between bg-white p-4 shadow">
        <h1 className="text-xl font-semibold">Smart Analytics Dashboard</h1>
        <button
          className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
          onClick={onLogout}
        >
          Logout
        </button>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 p-4">
        {error ? (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg bg-white p-5 shadow">
            <h2 className="mb-4 text-lg font-semibold">Tasks</h2>
            <div className="mb-4 flex flex-col gap-2 md:flex-row">
              <input
                className="w-full rounded border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Title"
                value={newTask.title}
                onChange={(e) => setNewTask((v) => ({ ...v, title: e.target.value }))}
              />
              <input
                className="w-full rounded border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask((v) => ({ ...v, description: e.target.value }))}
              />
              <button
                className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                onClick={handleCreate}
              >
                Add Task
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2">Title</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Priority</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-lg bg-white p-5 shadow">
            <h2 className="mb-4 text-lg font-semibold">Task Status Overview</h2>
            <div className="h-64">
              <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-white p-5 shadow">
            <h2 className="mb-3 text-lg font-semibold">Predict KPI</h2>
            <div className="grid gap-3">
              <label className="text-sm font-medium text-slate-700">
                Customers
                <input
                  type="number"
                  value={inputFeatures.customers}
                  onChange={(e) =>
                    setInputFeatures((prev) => ({ ...prev, customers: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Repeat Rate
                <input
                  type="number"
                  step="0.01"
                  value={inputFeatures.repeat_rate}
                  onChange={(e) =>
                    setInputFeatures((prev) => ({ ...prev, repeat_rate: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Average Age
                <input
                  type="number"
                  value={inputFeatures.avg_age}
                  onChange={(e) =>
                    setInputFeatures((prev) => ({ ...prev, avg_age: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Social Engagement
                <input
                  type="number"
                  step="0.01"
                  value={inputFeatures.social_engagement}
                  onChange={(e) =>
                    setInputFeatures((prev) => ({ ...prev, social_engagement: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              <button
                className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                onClick={handlePredict}
              >
                Predict KPI
              </button>
              {prediction !== null ? (
                <div className="rounded border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-800">
                  Predicted KPI: <strong>{prediction.toFixed(3)}</strong>
                </div>
              ) : null}
            </div>
          </div>
          <div className="rounded-lg bg-white p-5 shadow">
            <h2 className="mb-3 text-lg font-semibold">Instructions</h2>
            <ul className="list-disc pl-5 text-sm text-slate-600">
              <li>Manage your task list and track statuses in real time.</li>
              <li>Use the prediction panel to get live KPI forecasts.</li>
              <li>Open developer tools to inspect API calls and WebSocket messages.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
