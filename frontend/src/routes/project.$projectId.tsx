import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type Level = "INFO" | "WARN" | "ERROR" | "DEBUG";

type LogType = {
  id: number;
  time: string;
  level: Level;
  category: string;
  message: string;
};

type AlertType = {
  id: number;
  time: string;
  level: Level;
  category: string;
  message: string;
};

type LineDataType = {
  time: string;
  INFO: number;
  WARN: number;
  ERROR: number;
  DEBUG: number;
};

type PieDataType = {
  name: Level;
  value: number;
};

const LEVEL_COLORS: Record<Level, string> = {
  INFO: "#38bdf8",
  WARN: "#fbbf24",
  ERROR: "#f87171",
  DEBUG: "#a78bfa",
};

const LEVELS: Level[] = ["INFO", "WARN", "ERROR", "DEBUG"];

const SEVERITY_RANK: Record<Level, number> = {
  ERROR: 4,
  WARN: 3,
  INFO: 2,
  DEBUG: 1,
};

export const Route = createFileRoute("/project/$projectId")({
  component: ProjectDashboard,
});

function ProjectDashboard() {
  const { projectId } = useParams({ from: "/project/$projectId" });

  const [logs, setLogs] = useState<LogType[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<"ALL" | Level>("ALL");

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/project/${projectId}/scored_logs`)
      .then((res) => res.json())
      .then((data: LogType[]) => setLogs(data))
      .catch((err) => console.error(err));
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/project/${projectId}/alerts`)
      .then((res) => res.json())
      .then((data: AlertType[]) => setAlerts(data))
      .catch((err) => console.error(err));
  }, [projectId]);

  const pieData: PieDataType[] = useMemo(() => {
    const counts: Record<Level, number> = {
      INFO: 0,
      WARN: 0,
      ERROR: 0,
      DEBUG: 0,
    };
    logs.forEach((log) => (counts[log.level] += 1));
    return LEVELS.map((level) => ({
      name: level,
      value: counts[level],
    }));
  }, [logs]);

  const lineData: LineDataType[] = useMemo(() => {
    const timeMap: Record<string, LineDataType> = {};

    logs.forEach((log) => {
      if (!timeMap[log.time]) {
        timeMap[log.time] = {
          time: log.time,
          INFO: 0,
          WARN: 0,
          ERROR: 0,
          DEBUG: 0,
        };
      }
      timeMap[log.time][log.level] += 1;
    });

    const data = Object.values(timeMap).sort((a, b) =>
      a.time.localeCompare(b.time)
    );

    if (selectedLevel === "ALL") return data;

    return data.map((entry) => ({
      time: entry.time,
      INFO: selectedLevel === "INFO" ? entry.INFO : 0,
      WARN: selectedLevel === "WARN" ? entry.WARN : 0,
      ERROR: selectedLevel === "ERROR" ? entry.ERROR : 0,
      DEBUG: selectedLevel === "DEBUG" ? entry.DEBUG : 0,
    }));
  }, [logs, selectedLevel]);

  const topSevereAlerts = useMemo(() => {
    return [...alerts]
      .sort((a, b) => {
        const severityDiff = SEVERITY_RANK[b.level] - SEVERITY_RANK[a.level];
        if (severityDiff !== 0) return severityDiff;
        return b.time.localeCompare(a.time);
      })
      .slice(0, 5);
  }, [alerts]);

  const handlePieClick = (entry: PieDataType) => {
    setSelectedLevel(entry.name);
  };

  return (
    <div
      className="min-h-screen text-gray-200 p-10"
      style={{
        background: `
          radial-gradient(circle at 20% 30%, rgba(37,99,235,0.15), transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(99,102,241,0.12), transparent 40%),
          radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(15,15,15,0.4), rgba(15,15,15,0.95)),
          #0B1120
        `,
        backgroundSize: "auto, auto, 24px 24px, 100% 100%, auto",
      }}
    >
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            Project Dashboard
          </h1>
          <p className="text-slate-400 mt-2 font-mono text-sm">ID: {projectId}</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:scale-105 transition font-semibold shadow-lg">
            Alerts
          </button>
          <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:scale-105 transition font-semibold shadow-lg">
            Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Requests Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid stroke="#334155" />
              <XAxis dataKey="time" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip />
              {(selectedLevel === "ALL" ? LEVELS : [selectedLevel]).map(
                (level) => (
                  <Line
                    key={level}
                    type="monotone"
                    dataKey={level}
                    stroke={LEVEL_COLORS[level]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                )
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Logs by Level
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
                onClick={handlePieClick}
              >
                {pieData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={LEVEL_COLORS[entry.name]}
                    cursor="pointer"
                    opacity={
                      selectedLevel === "ALL" || selectedLevel === entry.name
                        ? 1
                        : 0.3
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Top 5 Most Severe Alerts
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-slate-600">
              <tr>
                <th className="text-left py-2">Time</th>
                <th className="text-left py-2">Level</th>
                <th className="text-left py-2">Category</th>
                <th className="text-left py-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {topSevereAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  className="border-b border-slate-700 hover:bg-slate-800/50 transition"
                >
                  <td className="py-2">{alert.time}</td>
                  <td
                    className="py-2 font-semibold"
                    style={{ color: LEVEL_COLORS[alert.level] }}
                  >
                    {alert.level}
                  </td>
                  <td className="py-2">{alert.category}</td>
                  <td className="py-2">{alert.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
