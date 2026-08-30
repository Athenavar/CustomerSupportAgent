"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

const BAR_COLOR = "#1C6E63";
const PALETTE = ["#1C6E63", "#2F8F82", "#B4770A", "#C4372F", "#55636F", "#8A97A3"];

export function CategoryBarChart({ data }: { data: { category: string; count: number }[] }) {
  if (data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DCE3EA" vertical={false} />
        <XAxis
          dataKey="category"
          tick={{ fontSize: 11, fill: "#55636F" }}
          axisLine={{ stroke: "#DCE3EA" }}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: "#55636F" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #DCE3EA",
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusBarChart({ data }: { data: { status: string; count: number }[] }) {
  if (data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart layout="vertical" data={data} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DCE3EA" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#55636F" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="status"
          tick={{ fontSize: 11, fill: "#55636F" }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #DCE3EA",
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" fill={BAR_COLOR} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
