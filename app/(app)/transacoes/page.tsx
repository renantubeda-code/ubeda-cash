import Link from "next/link";
import { Plus, Pencil, Download } from "lucide-react";
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
import { TransactionFilters } from "@/components/transactions/filters";
import { DeleteButton } from "@/components/transactions/delete-button";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Category, TransactionWithCategory } from "@/lib/types";

interface PageProps {
  searchParams: {
    from?: string;
    to?: string;
    type?: string;
    category?: string;
  };
}

export default async function TransacoesPage({ searchParams }: PageProps) {
  const supabase = createClient();

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  const categories = (categoriesData ?? []) as Category[];

  let query = supabase
    .from("transactions")
    .select(
      "id, user_id, category_id, type, amount, description, occurred_on, created_at, updated_at, category:categories(id, name, color, type)"
    )
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (searchParams.from) query = query.gte("occurred_on", searchParams.from);
  if (searchParams.to) query = query.lte("occurred_on", searchParams.to);
  if (searchParams.type === "income" || searchParams.type === "expense") {
    query = query.eq("type", searchParams.type);
  }
  if (searchParams.category) query = query.eq("category_id", searchParams.category);

  const { data: txData, error } = await query;
  const transactions = (txData ?? []) as unknown as TransactionWithCategory[];

  const exportParams = new URLSearchParams();
  if (searchParams.from) exportParams.set("from", searchParams.from);
  if (searchParams.to) exportParams.set("to", searchParams.to);
  if (searchParams.type) exportParams.set("type", searchParams.type);
  if (searchParams.category) exportParams.set("category", searchParams.category);
  const exportHref = `/api/export?${exportParams.toString()}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie receitas e despesas e aplique filtros por período e categoria.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={exportHref}>
              <Download className="mr-2 h-4 w-4" /> Exportar CSV
            </Link>
          </Button>
          <Button asChild>
            <Link href="/transacoes/nova">
              <Plus className="mr-2 h-4 w-4" /> Nova
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
          <CardDescription>Por período, tipo e categoria.</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionFilters
            categories={categories}
            defaults={{
              from: searchParams.from ?? "",
              to: searchParams.to ?? "",
              type: searchParams.type ?? "",
              category: searchParams.category ?? "",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {transactions.length} transaç{transactions.length === 1 ? "ão" : "ões"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <p className="p-6 text-sm text-destructive">
              Erro ao carregar: {error.message}
            </p>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-10 text-center">
              <p className="text-muted-foreground">
                Nenhuma transação encontrada.
              </p>
              <Button asChild size="sm">
                <Link href="/transacoes/nova">Adicionar primeira transação</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(t.occurred_on)}
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate">
                      {t.description ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {t.category ? (
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: t.category.color ?? "#64748b",
                            }}
                          />
                          {t.category.name}
                        </span>
                      ) : (
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
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          aria-label="Editar"
                        >
                          <Link href={`/transacoes/${t.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteButton id={t.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
