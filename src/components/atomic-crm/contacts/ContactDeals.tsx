import { useGetList, type Identifier } from "ra-core";
import { format } from "date-fns";
import { Briefcase, PlusCircle } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";

interface ContactDealsProps {
  contactId: Identifier;
}

export const ContactDeals = ({ contactId }: ContactDealsProps) => {
  const { dealStages } = useConfigurationContext();

  const { data: deals, isPending } = useGetList<Deal>("deals", {
    pagination: { perPage: 50, page: 1 },
    sort: { field: "created_at", order: "DESC" },
    filter: { "contact_ids@cs": `{${contactId}}` },
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Deals
          </span>
          {deals && deals.length > 0 && (
            <Badge variant="outline" className="text-xs h-5 px-1.5">
              {deals.length}
            </Badge>
          )}
        </div>
        <Link to={`/deals/create`}>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
            <PlusCircle className="w-3 h-3" />
            Nuevo
          </Button>
        </Link>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !deals || deals.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          Sin deals asociados
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {deals.map((deal) => {
            const stage = dealStages.find((s) => s.value === deal.stage);
            const stageColor = stage?.color ?? "#9CA3AF";
            const stageLabel = stage?.label ?? deal.stage;

            return (
              <Link
                key={deal.id}
                to={`/deals/${deal.id}/show`}
                className="block no-underline"
              >
                <div className="rounded-lg border border-border bg-surface px-3 py-2.5 hover:brightness-110 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate leading-snug">
                        {deal.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="inline-block w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: stageColor }}
                        />
                        <span className="text-xs text-muted-foreground truncate">
                          {stageLabel}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold text-foreground">
                        {new Intl.NumberFormat("es-VE", {
                          style: "currency",
                          currency: deal.currency ?? "USD",
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(deal.amount ?? 0)}
                      </p>
                      {deal.expected_closing_date && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(
                            new Date(deal.expected_closing_date),
                            "dd MMM",
                          )}
                        </p>
                      )}
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
