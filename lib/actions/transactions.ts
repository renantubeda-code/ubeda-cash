"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TransactionType } from "@/lib/types";

function parseAmount(raw: string): number | null {
  if (!raw) return null;
  const normalized = raw
    .replace(/\s/g, "")
    .replace(/R\$/i, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100) / 100;
}

async function getUserId() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  return { supabase, userId: data.user.id };
}

export async function createTransaction(_prev: unknown, formData: FormData) {
  const type = String(formData.get("type") ?? "expense") as TransactionType;
  const amount = parseAmount(String(formData.get("amount") ?? ""));
  const occurred_on = String(formData.get("occurred_on") ?? "");
  const category_id = String(formData.get("category_id") ?? "") || null;
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!amount) return { error: "Informe um valor maior que zero." };
  if (!occurred_on) return { error: "Informe a data da transação." };
  if (type !== "income" && type !== "expense") {
    return { error: "Tipo inválido." };
  }

  const { supabase, userId } = await getUserId();

  const { error } = await supabase.from("transactions").insert({
    user_id: userId,
    type,
    amount,
    occurred_on,
    category_id,
    description,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/transacoes");
  redirect("/transacoes");
}

export async function updateTransaction(
  id: string,
  _prev: unknown,
  formData: FormData
) {
  const type = String(formData.get("type") ?? "expense") as TransactionType;
  const amount = parseAmount(String(formData.get("amount") ?? ""));
  const occurred_on = String(formData.get("occurred_on") ?? "");
  const category_id = String(formData.get("category_id") ?? "") || null;
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!amount) return { error: "Informe um valor maior que zero." };
  if (!occurred_on) return { error: "Informe a data da transação." };

  const { supabase, userId } = await getUserId();

  const { error } = await supabase
    .from("transactions")
    .update({ type, amount, occurred_on, category_id, description })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/transacoes");
  redirect("/transacoes");
}

export async function deleteTransaction(id: string) {
  const { supabase, userId } = await getUserId();

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/transacoes");
}
