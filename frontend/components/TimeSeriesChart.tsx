"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Point = {
  timestamp: string;        // formatted label for X axis
  iso: string;              // raw ISO for tooltip (optional)
  iops_read: number;
  iops_write: number;
  throughput_read: number;  // assume KB/s unless your API says otherwise
  throughput_write: number;
};

const PURPLE = "#8B5CF6"; // read
const GREEN  = "#22C55E"; // write

// 1.2k, 45k, etc.
const formatK = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

// 489.8 KB/s, 1.2 MB/s, 2.0 GB/s
const formatRate = (kbPerSec: number) => {
  let v = kbPerSec;
  let unit = "KB/s";
  if (v >= 1024) {
    v = v / 1024;
    unit = "MB/s";
  }
  if (v >= 1024) {
    v = v / 1024;
    unit = "GB/s";
  }
  const digits = v >= 10 ? 1 : 2;
  return `${v.toFixed(digits)} ${unit}`;
};

export default function TimeSeriesChart() {
  const [data, setData] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  const CLUSTER_ID = process.env.NEXT_PUBLIC_CLUSTER_ID;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/clusters/${CLUSTER_ID}/timeseries`
        );

        const rawPoints: any[] = res?.data?.points ?? res?.data ?? [];
        const formatted: Point[] = rawPoints.map((p: any) => {
          const date = new Date(p.t ?? p.timestamp ?? p.time);
          // Backward-compat: if only totals exist, treat totals as "read" and 0 for "write"
          const iops_read = Number(p.iops_read ?? p.iops ?? 0);
          const iops_write = Number(p.iops_write ?? 0);
          const throughput_read = Number(p.throughput_read ?? p.throughput ?? 0);
          const throughput_write = Number(p.throughput_write ?? 0);

          return {
            timestamp: date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            iso: date.toISOString(),
            iops_read,
            iops_write,
            throughput_read,
            throughput_write,
          };
        });

        setData(formatted);
      } catch (err) {
        console.error("Failed to fetch timeseries:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE, CLUSTER_ID]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading metrics...</div>;
  }

  const latest = data[data.length - 1] ?? {
    iops_read: 0,
    iops_write: 0,
    throughput_read: 0,
    throughput_write: 0,
  };

  return (
    <div className="space-y-6">
      {/* IOPS */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">IOPS</h2>

        <div className="grid grid-cols-12 gap-4 items-start">
          {/* Chart */}
          <div className="col-span-9">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis tickFormatter={formatK} />
                <Tooltip
                  labelFormatter={(label) => `Time: ${label}`}
                  formatter={(value, name) => {
                    if (name.includes("iops")) return [formatK(Number(value)), "IOPS"];
                    return [String(value), name];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="iops_read"
                  name="Read"
                  stroke={PURPLE}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="iops_write"
                  name="Write"
                  stroke={GREEN}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend (right) */}
          <div className="col-span-3">
            <div className="border rounded-lg p-3 text-sm">
              <p className="font-semibold text-gray-700 mb-2">IOPS</p>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Read</span>
                <span className="font-semibold" style={{ color: PURPLE }}>
                  {formatK(latest.iops_read)} IOPS
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-500">Write</span>
                <span className="font-semibold" style={{ color: GREEN }}>
                  {formatK(latest.iops_write)} IOPS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Throughput */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Throughput</h2>

        <div className="grid grid-cols-12 gap-4 items-start">
          {/* Chart */}
          <div className="col-span-9">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis tickFormatter={(v) => formatRate(Number(v))} />
                <Tooltip
                  labelFormatter={(label) => `Time: ${label}`}
                  formatter={(value, name) => {
                    if (name.includes("throughput"))
                      return [formatRate(Number(value)), "Throughput"];
                    return [String(value), name];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="throughput_read"
                  name="Read"
                  stroke={PURPLE}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="throughput_write"
                  name="Write"
                  stroke={GREEN}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend (right) */}
          <div className="col-span-3">
            <div className="border rounded-lg p-3 text-sm">
              <p className="font-semibold text-gray-700 mb-2">Throughput</p>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Read</span>
                <span className="font-semibold" style={{ color: PURPLE }}>
                  {formatRate(latest.throughput_read)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-500">Write</span>
                <span className="font-semibold" style={{ color: GREEN }}>
                  {formatRate(latest.throughput_write)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
