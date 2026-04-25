"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";

export interface TrendDatum {
  label: string;
  income: number;
  expense: number;
}

export function TrendChart({ data }: { data: TrendDatum[] }) {
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  if (!hasData) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        Sem dados no período.
      </div>
    );
  }

  const compactFormatter = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          barCategoryGap="20%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={compactFormatter}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--accent))", opacity: 0.4 }}
            formatter={(value: number, name) => [
              formatCurrency(value),
              name === "income" ? "Receitas" : "Despesas",
            ]}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
            }}
          />
          <Legend
            verticalAlign="top"
            height={32}
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => (value === "income" ? "Receitas" : "Despesas")}
          />
          <Bar
            dataKey="income"
            fill="hsl(var(--success))"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="expense"
            fill="hsl(var(--destructive))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
