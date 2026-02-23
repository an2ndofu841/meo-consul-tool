"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataPoint {
  label: string;
  value: number;
}

interface MiniLineChartProps {
  title: string;
  data: DataPoint[];
  color?: string;
  height?: number;
  showGrid?: boolean;
  invertY?: boolean; // for rank charts (lower = better)
  valueFormatter?: (value: number) => string;
}

export function MiniLineChart({
  title,
  data,
  color = "#2563eb",
  height = 200,
  showGrid = true,
  invertY = false,
  valueFormatter,
}: MiniLineChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#888" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#888" }}
              tickLine={false}
              axisLine={false}
              reversed={invertY}
              tickFormatter={valueFormatter}
              width={40}
            />
            <Tooltip
              formatter={(value) =>
                valueFormatter ? valueFormatter(value as number) : value
              }
              labelStyle={{ color: "#333" }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
