import Link from "next/link";
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
import type { Category } from "@/lib/types";

export default async function NovaTransacaoPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  const categories = (data ?? []) as Category[];

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
          <CardTitle>Nova transação</CardTitle>
          <CardDescription>
            Informe os dados da receita ou despesa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
