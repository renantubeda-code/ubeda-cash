import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import {
  CategoryChart,
  type CategoryDatum,
} from "@/components/dashboard/category-chart";
import { MonthSelector } from "@/components/dashboard/month-selector";
import {
  currentYearMonth,
  firstDayOfMonth,
  formatCurrency,
  formatDate,
  lastDayOfMonth,
} from "@/lib/format";
import type { TransactionWithCategory } from "@/lib/types";

interface PageProps {
  searchParams: { year?: string; month?: string };
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const supabase = createClient();

  const now = currentYearMonth();
  const year = Number(searchParams.year) || now.year;
  const month = Number(searchParams.month) || now.month;
  const from = firstDayOfMonth(year, month);
  const to = lastDayOfMonth(year, month);

  const { data: txData } = await supabase
    .from("transactions")
    .select(
      "id, user_id, category_id, type, amount, description, occurred_on, created_at, updated_at, category:categories(id, name, color, type)"
    )
    .gte("occurred_on", from)
    .lte("occurred_on", to)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  const transactions = (txData ?? []) as unknown as TransactionWithCategory[];

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const byCategory = new Map<string, CategoryDatum>();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const name = t.category?.name ?? "Sem categoria";
    const color = t.category?.color ?? "#64748b";
    const prev = byCategory.get(name);
    byCategory.set(name, {
      name,
      color,
      value: (prev?.value ?? 0) + Number(t.amount),
    });
  }
  const chartData = Array.from(byCategory.values()).sort(
    (a, b) => b.value - a.value
  );

  const recent = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visão consolidada do mês selecionado.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector year={year} month={month} />
          <Button asChild>
            <Link href="/transacoes/nova">
              <Plus className="mr-2 h-4 w-4" /> Nova
            </Link>
          </Button>
        </div>
      </div>

      <SummaryCards income={income} expense={expense} />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Despesas por categoria</CardTitle>
            <CardDescription>Distribuição do mês.</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Últimas transações</CardTitle>
              <CardDescription>Top 5 do mês.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/transacoes">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center gap-3 p-10 text-center">
                <p className="text-muted-foreground">
                  Nenhuma transação neste mês.
                </p>
                <Button asChild size="sm">
                  <Link href="/transacoes/nova">Adicionar transação</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(t.occurred_on)}
                      </TableCell>
                      <TableCell className="max-w-[240px] truncate">
                        {t.description ?? t.category?.name ?? (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {t.type === "income" ? (
                          <Badge variant="success">Receita</Badge>
                        ) : (
                          <Badge variant="destructive">Despesa</Badge>
                        )}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium tabular-nums ${
                          t.type === "income" ? "text-success" : "text-destructive"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {formatCurrency(Number(t.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
