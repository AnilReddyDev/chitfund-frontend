import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AppContext } from "../context/AppContext";
import Header from "../components/layout/Header";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Dashboard() {
  const { groupId } = useContext(AppContext);

  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!groupId) return;

    api
      .get("/dashboard", {
        params: { groupId },
      })
      .then((res) => setData(res.data));

    api
      .get("/dashboard/chart", {
        params: { groupId },
      })
      .then((res) => setChartData(res.data));
  }, [groupId]);

  if (!data) return <p className="p-4">Loading...</p>;

  return (
    <div>
      <Header title="Dashboard" />

      <div className="p-4 grid grid-cols-2 gap-3">
        {/* Card */}
        <Card title="Collection" value={`₹${data.totalCollection}`} />

        <Card title="Profit" value={`₹${data.totalProfit}`} />

        <Card title="Members" value={data.totalMembers} />

        <Card title="Pending" value={data.pendingPayments} />

        <Card title="Month" value={data.currentMonth} />

        <Card title="Last Winner" value={data.lastWinner} />
      </div>
      <div className="p-4 space-y-6">
        {/* 📈 Collection Trend */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm font-semibold mb-2">Collection Trend</h3>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="collection" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 📊 Profit Chart */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm font-semibold mb-2">Profit per Month</h3>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-xs text-gray-400">{title}</p>
      <h2 className="text-lg font-semibold">{value}</h2>
    </div>
  );
}
