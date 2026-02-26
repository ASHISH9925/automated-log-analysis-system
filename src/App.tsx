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

type LogType = {
  id: number;
  time: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
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
  name: string;
  value: number;
};

// Classic log colors
const LEVEL_COLORS: Record<LogType["level"], string> = {
  INFO: "#3b82f6",   // blue
  WARN: "#f59e0b",   // orange
  ERROR: "#ef4444",  // red
  DEBUG: "#8b5cf6",  // purple
};

const LEVELS: Array<LogType["level"]> = ["INFO", "WARN", "ERROR", "DEBUG"];

// Type guard
const isLogLevel = (level: string): level is LogType["level"] =>
  LEVELS.includes(level as LogType["level"]);

export default function App() {
  const [logs, setLogs] = useState<LogType[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<"ALL" | LogType["level"]>("ALL");
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  // Parse logs
  function parseLogs(data: string) {
    const lines = data.split("\n").filter((line) => line.trim() !== "");
    const parsed: LogType[] = lines.map((line, index) => {
      const timeMatch = line.match(/\d{2}:\d{2}/);
      const levelMatch = line.match(/\b(INFO|WARN|ERROR|DEBUG)\b/);
      const categoryMatch = line.match(/\] ([a-zA-Z0-9.]+)\s+:/);
      const messagePart = line.split(" : ")[1] || line;
      return {
        id: index + 1,
        time: timeMatch ? timeMatch[0] : "00:00",
        level: levelMatch ? (levelMatch[1] as LogType["level"]) : "INFO",
        category: categoryMatch
          ? categoryMatch[1].split(".").pop() || "General"
          : "General",
        message: messagePart,
      };
    });
    setLogs(parsed);
  }

  // Load log file
  useEffect(() => {
    fetch("/sample-application.log")
      .then((res) => res.text())
      .then((data) => parseLogs(data))
      .catch((err) => console.error("Error loading log:", err));
  }, []);

  // Pie chart data
  const pieData: PieDataType[] = useMemo(() => {
    const counts: Record<LogType["level"], number> = {
      INFO: 0,
      WARN: 0,
      ERROR: 0,
      DEBUG: 0,
    };
    logs.forEach((log) => (counts[log.level] += 1));
    return LEVELS.map((level) => ({ name: level, value: counts[level] }));
  }, [logs]);

  // Line chart data
  const lineData: LineDataType[] = useMemo(() => {
    const timeMap: Record<string, LineDataType> = {};
    logs.forEach((log) => {
      if (!timeMap[log.time]) {
        timeMap[log.time] = { time: log.time, INFO: 0, WARN: 0, ERROR: 0, DEBUG: 0 };
      }
      timeMap[log.time][log.level] += 1;
    });
    let data = Object.values(timeMap).sort((a, b) => a.time.localeCompare(b.time));

    if (selectedLevel !== "ALL") {
      data = data.map((entry) => ({
        time: entry.time,
        INFO: selectedLevel === "INFO" ? entry.INFO : 0,
        WARN: selectedLevel === "WARN" ? entry.WARN : 0,
        ERROR: selectedLevel === "ERROR" ? entry.ERROR : 0,
        DEBUG: selectedLevel === "DEBUG" ? entry.DEBUG : 0,
      }));
    }
    return data;
  }, [logs, selectedLevel]);

  // Chatbot
  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, input]);
    setInput("");
  };

  // Pie chart click handler
  const handlePieClick = (entry: PieDataType) => {
    if (isLogLevel(entry.name)) {
      setSelectedLevel(entry.name);
    }
  };

  // Helper: get slice color with fade
  const getPieFill = (level: string) => {
    if (!isLogLevel(level)) return "#ccc";
    if (selectedLevel === "ALL" || selectedLevel === level) return LEVEL_COLORS[level];
    return LEVEL_COLORS[level] + "80"; // add ~50% opacity
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* MAIN DASHBOARD */}
      <div className="flex-1 p-6 space-y-6">
        <h1 className="text-3xl font-bold">Application Dashboard</h1>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div className="bg-white p-4 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-4">Requests Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                {(selectedLevel === "ALL" ? LEVELS : [selectedLevel]).map((level) => (
                  <Line
                    key={level}
                    type="monotone"
                    dataKey={level}
                    stroke={LEVEL_COLORS[level]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name={level}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-4 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-4">Logs by Level</h2>
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
                      fill={getPieFill(entry.name)}
                      cursor="pointer"
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <button
              className="mt-2 px-3 py-1 bg-gray-500 text-white rounded"
              onClick={() => setSelectedLevel("ALL")}
            >
              Show All Levels
            </button>
          </div>
        </div>

        {/* Top 10 Logs */}
        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Top 10 Recent Logs</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th>Time</th>
                <th>Level</th>
                <th>Category</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(-10).reverse().map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td>{log.time}</td>
                  <td
                    style={{
                      color: LEVEL_COLORS[log.level],
                      fontWeight: 600,
                    }}
                  >
                    {log.level}
                  </td>
                  <td>{log.category}</td>
                  <td>{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SIDE CHATBOT */}
      <div className="w-80 bg-white shadow-lg p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-3">Assistant</h2>

        <div className="flex-1 overflow-y-auto border rounded p-2 mb-2">
          {messages.map((msg, i) => (
            <div key={i} className="mb-2 text-sm">
              🧑 {msg}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 border rounded px-2 py-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-3 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}