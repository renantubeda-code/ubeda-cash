"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/lib/types";

interface Props {
  categories: Category[];
  defaults: {
    from: string;
    to: string;
    type: string;
    category: string;
  };
}

export function TransactionFilters({ categories, defaults }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function applyParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    router.push(`/transacoes?${next.toString()}`);
  }

  function reset() {
    router.push("/transacoes");
  }

  return (
    <form
      className="grid gap-3 md:grid-cols-5 md:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const next = new URLSearchParams();
        const from = String(data.get("from") ?? "");
        const to = String(data.get("to") ?? "");
        if (from) next.set("from", from);
        if (to) next.set("to", to);
        const type = params.get("type");
        const category = params.get("category");
        if (type) next.set("type", type);
        if (category) next.set("category", category);
        router.push(`/transacoes?${next.toString()}`);
      }}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="from">De</Label>
        <Input id="from" name="from" type="date" defaultValue={defaults.from} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="to">Até</Label>
        <Input id="to" name="to" type="date" defaultValue={defaults.to} />
      </div>
      <div className="grid gap-1.5">
        <Label>Tipo</Label>
        <Select
          value={defaults.type || "all"}
          onValueChange={(v) => applyParam("type", v === "all" ? null : v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label>Categoria</Label>
        <Select
          value={defaults.category || "all"}
          onValueChange={(v) => applyParam("category", v === "all" ? null : v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Aplicar
        </Button>
        <Button type="button" variant="outline" onClick={reset}>
          Limpar
        </Button>
      </div>
    </form>
  );
}
