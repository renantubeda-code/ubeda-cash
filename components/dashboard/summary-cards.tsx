import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

interface Props {
  income: number;
  expense: number;
}

export function SummaryCards({ income, expense }: Props) {
  const balance = income - expense;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Receitas
          </CardTitle>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-success/10 text-success">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tabular-nums text-success">
            {formatCurrency(income)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Despesas
          </CardTitle>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <ArrowDownRight className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tabular-nums text-destructive">
            {formatCurrency(expense)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Saldo
          </CardTitle>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Wallet className="h-4 w-4" />
          </span>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-semibold tabular-nums ${
              balance >= 0 ? "text-foreground" : "text-destructive"
            }`}
          >
            {formatCurrency(balance)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
