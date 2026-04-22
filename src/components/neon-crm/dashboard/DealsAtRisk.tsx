import { useMemo } from "react";
import { addDays, format, differenceInDays, startOfDay } from "date-fns";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { useGetList } from "ra-core";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";

export const DealsAtRisk = () => {
  const { dealStages } = useConfigurationContext();

  const { today, sevenDaysFromNow } = useMemo(() => {
    const t = startOfDay(new Date());
    return {
      today: t,
      sevenDaysFromNow: addDays(t, 7),
    };
  }, []);

  const { data: deals, isPending } = useGetList<Deal>("deals", {
    pagination: { perPage: 50, page: 1 },
    sort: { field: "expected_closing_date", order: "ASC" },
    filter: {
      "expected_closing_date@gte": format(today, "yyyy-MM-dd"),
      "expected_closing_date@lte": format(sevenDaysFromNow, "yyyy-MM-dd"),
    },
  });

  const atRiskDeals = useMemo(() => {
    if (!deals) return [];
    return deals.filter(
      (d) => !["cerrado_won", "cerrado_lost"].includes(d.stage),
    );
  }, [deals]);

  const getStageProbability = (stageValue: string) =>
    dealStages.find((s) => s.value === stageValue)?.probability ?? 0;

  const getStageColor = (stageValue: string) =>
    dealStages.find((s) => s.value === stageValue)?.color ?? "#9CA3AF";

  const getDaysLabel = (dateStr: string) => {
    const diff = differenceInDays(new Date(dateStr), today);
    if (diff === 0) return "hoy";
    if (diff === 1) return "mañana";
    return `en ${diff}d`;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-base font-semibold text-muted-foreground">
          Deals en Riesgo
        </h2>
        <Badge variant="outline" className="ml-auto text-xs">
          próximos 7 días
        </Badge>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : atRiskDeals.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Sin deals venciendo esta semana
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {atRiskDeals.map((deal) => {
            const probability = getStageProbability(deal.stage);
            const stageColor = getStageColor(deal.stage);
            const isHighProbability = probability >= 60;

            return (
              <Link
                key={deal.id}
                to={`/deals/${deal.id}/show`}
                className="block no-underline"
              >
                <div
                  className={cn(
                    "rounded-lg border px-4 py-3 transition-colors hover:brightness-110",
                    isHighProbability
                      ? "border-primary/60 bg-secondary"
                      : "border-border bg-card",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate leading-snug">
                        {deal.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="inline-block w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: stageColor }}
                        />
                        <span className="text-xs text-muted-foreground truncate">
                          {dealStages.find((s) => s.value === deal.stage)
                            ?.label ?? deal.stage}
                        </span>
                        {probability > 0 && (
                          <span className="text-xs text-muted-foreground">
                            · {probability}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          isHighProbability
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      >
                        {getDaysLabel(deal.expected_closing_date)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Intl.NumberFormat("es-VE", {
                          style: "currency",
                          currency: deal.currency ?? "USD",
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(deal.amount ?? 0)}
                      </p>
                      <ExternalLink className="w-3 h-3 text-muted-foreground/50 mt-1 ml-auto" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
