import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransactionForm } from "@/components/transactions/transaction-form";
import type { Category, TransactionWithCategory } from "@/lib/types";

export default async function EditarTransacaoPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [{ data: tx }, { data: catData }] = await Promise.all([
    supabase
      .from("transactions")
      .select(
        "id, user_id, category_id, type, amount, description, occurred_on, created_at, updated_at, category:categories(id, name, color, type)"
      )
      .eq("id", params.id)
      .maybeSingle(),
    supabase.from("categories").select("*").order("name"),
  ]);

  if (!tx) notFound();

  const categories = (catData ?? []) as Category[];
  const transaction = tx as unknown as TransactionWithCategory;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/transacoes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Editar transação</CardTitle>
          <CardDescription>Atualize os dados da transação.</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionForm
            categories={categories}
            transaction={transaction}
          />
        </CardContent>
      </Card>
    </div>
  );
}
