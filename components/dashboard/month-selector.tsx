"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { monthLabel } from "@/lib/format";

interface Props {
  year: number;
  month: number;
}

export function MonthSelector({ year, month }: Props) {
  const router = useRouter();

  function go(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    router.push(`/dashboard?year=${d.getFullYear()}&month=${d.getMonth() + 1}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => go(-1)}
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="min-w-[140px] text-center text-sm font-medium">
        {monthLabel(year, month)}
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => go(1)}
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
