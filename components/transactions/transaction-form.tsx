"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import {
  createTransaction,
  updateTransaction,
} from "@/lib/actions/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, TransactionWithCategory, TransactionType } from "@/lib/types";

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? "Salvando..."
        : isEdit
        ? "Salvar alterações"
        : "Adicionar transação"}
    </Button>
  );
}

interface Props {
  categories: Category[];
  transaction?: TransactionWithCategory;
}

export function TransactionForm({ categories, transaction }: Props) {
  const isEdit = !!transaction;
  const action = isEdit
    ? updateTransaction.bind(null, transaction!.id)
    : createTransaction;
  const [state, formAction] = useFormState(action, null);

  const [type, setType] = useState<TransactionType>(
    transaction?.type ?? "expense"
  );
  const [categoryId, setCategoryId] = useState<string>(
    transaction?.category_id ?? ""
  );

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-2">
        <Label>Tipo</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setType("expense");
              setCategoryId("");
            }}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              type === "expense"
                ? "border-destructive bg-destructive/10 text-destructive"
                : "border-input text-muted-foreground hover:bg-accent"
            }`}
          >
            Despesa
          </button>
          <button
            type="button"
            onClick={() => {
              setType("income");
              setCategoryId("");
            }}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              type === "income"
                ? "border-success bg-success/10 text-success"
                : "border-input text-muted-foreground hover:bg-accent"
            }`}
          >
            Receita
          </button>
        </div>
        <input type="hidden" name="type" value={type} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="amount">Valor (R$)</Label>
        <Input
          id="amount"
          name="amount"
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          defaultValue={
            transaction
              ? transaction.amount.toFixed(2).replace(".", ",")
              : ""
          }
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="occurred_on">Data</Label>
        <Input
          id="occurred_on"
          name="occurred_on"
          type="date"
          defaultValue={transaction?.occurred_on ?? today}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category_id">Categoria</Label>
        <Select
          value={categoryId}
          onValueChange={setCategoryId}
          name="category_id"
        >
          <SelectTrigger id="category_id">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                Nenhuma categoria de {type === "income" ? "receita" : "despesa"}.
              </div>
            ) : (
              filteredCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Input
          id="description"
          name="description"
          maxLength={200}
          defaultValue={transaction?.description ?? ""}
          placeholder="Ex: Supermercado do mês"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button asChild variant="outline" type="button">
          <Link href="/transacoes">Cancelar</Link>
        </Button>
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  );
}
