import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { TransactionWithCategory } from "@/lib/types";

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  const supabase = createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const sp = request.nextUrl.searchParams;

  let query = supabase
    .from("transactions")
    .select(
      "id, type, amount, description, occurred_on, category:categories(name)"
    )
    .order("occurred_on", { ascending: false });

  const from = sp.get("from");
  const to = sp.get("to");
  const type = sp.get("type");
  const category = sp.get("category");

  if (from) query = query.gte("occurred_on", from);
  if (to) query = query.lte("occurred_on", to);
  if (type === "income" || type === "expense") query = query.eq("type", type);
  if (category) query = query.eq("category_id", category);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as Array<
    Pick<TransactionWithCategory, "id" | "type" | "amount" | "description" | "occurred_on"> & {
      category: { name: string } | null;
    }
  >;

  const header = ["Data", "Tipo", "Categoria", "Descrição", "Valor"];
  const lines = [header.join(";")];

  for (const r of rows) {
    const tipo = r.type === "income" ? "Receita" : "Despesa";
    const valor = Number(r.amount).toFixed(2).replace(".", ",");
    lines.push(
      [
        csvEscape(r.occurred_on),
        csvEscape(tipo),
        csvEscape(r.category?.name ?? ""),
        csvEscape(r.description ?? ""),
        csvEscape(valor),
      ].join(";")
    );
  }

  const csv = "﻿" + lines.join("\n");
  const fileName = `transacoes-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
