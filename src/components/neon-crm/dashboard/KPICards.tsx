import { useMemo } from "react";
import { startOfMonth, subDays } from "date-fns";
import { TrendingUp, CalendarDays, Target, Users } from "lucide-react";
import { useGetList } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { Contact, Deal } from "../types";

// ─── KPI card ──────────────────────────────────────────────────────────────

interface KPICardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  sub?: string;
  isPending: boolean;
}

const KPICard = ({ label, value, icon, sub, isPending }: KPICardProps) => (
  <Card className="bg-card border-border">
    <CardContent className="pt-5 pb-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
            {label}
          </p>
          {isPending ? (
            <>
              <Skeleton className="h-7 w-28 mt-2 mb-1" />
              <Skeleton className="h-3 w-20 mt-1" />
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-foreground mt-1 leading-tight">
                {value}
              </p>
              {sub && (
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              )}
            </>
          )}
        </div>
        <div className="shrink-0 text-primary mt-0.5">{icon}</div>
      </div>
    </CardContent>
  </Card>
);

// ─── KPICards ──────────────────────────────────────────────────────────────

export const KPICards = () => {
  const monthStart = useMemo(() => startOfMonth(new Date()).toISOString(), []);
  const thirtyDaysAgo = useMemo(
    () => subDays(new Date(), 30).toISOString(),
    [],
  );

  const { data: deals, isPending: dealsLoading } = useGetList<Deal>("deals", {
    pagination: { perPage: 500, page: 1 },
    sort: { field: "created_at", order: "DESC" },
  });

  const { total: newContacts, isPending: contactsLoading } =
    useGetList<Contact>("contacts", {
      pagination: { perPage: 1, page: 1 },
      filter: { "first_seen@gte": thirtyDaysAgo },
    });

  const kpis = useMemo(() => {
    if (!deals) return null;

    const activeDeals = deals.filter(
      (d) => !["cerrado_won", "cerrado_lost"].includes(d.stage),
    );
    const pipelineTotal = activeDeals.reduce(
      (sum, d) => sum + (d.amount || 0),
      0,
    );

    const thisMonthDeals = deals.filter(
      (d) => d.created_at >= monthStart,
    ).length;

    const wonDeals = deals.filter((d) => d.stage === "cerrado_won").length;
    const lostDeals = deals.filter((d) => d.stage === "cerrado_lost").length;
    const totalClosed = wonDeals + lostDeals;
    const closingRate =
      totalClosed > 0 ? Math.round((wonDeals / totalClosed) * 100) : 0;

    return {
      pipelineTotal,
      thisMonthDeals,
      closingRate,
      wonDeals,
      totalClosed,
    };
  }, [deals, monthStart]);

  const formattedPipeline = kpis
    ? new Intl.NumberFormat("es-VE", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(kpis.pipelineTotal)
    : "—";

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <KPICard
        label="Pipeline Total"
        value={formattedPipeline}
        icon={<TrendingUp className="w-5 h-5" />}
        sub="deals activos en curso"
        isPending={dealsLoading}
      />
      <KPICard
        label="Deals Este Mes"
        value={kpis?.thisMonthDeals ?? "—"}
        icon={<CalendarDays className="w-5 h-5" />}
        sub="mes en curso"
        isPending={dealsLoading}
      />
      <KPICard
        label="Tasa de Cierre"
        value={kpis ? `${kpis.closingRate}%` : "—"}
        icon={<Target className="w-5 h-5" />}
        sub={
          kpis
            ? `${kpis.wonDeals} won / ${kpis.totalClosed} cerrados`
            : undefined
        }
        isPending={dealsLoading}
      />
      <KPICard
        label="Contactos Nuevos"
        value={newContacts ?? "—"}
        icon={<Users className="w-5 h-5" />}
        sub="últimos 30 días"
        isPending={contactsLoading}
      />
    </div>
  );
};
