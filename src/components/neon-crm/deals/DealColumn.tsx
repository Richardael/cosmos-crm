import { Droppable } from "@hello-pangea/dnd";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { findDealLabel } from "./dealUtils";
import { DealCard } from "./DealCard";

export const DealColumn = ({
  stage,
  deals,
}: {
  stage: string;
  deals: Deal[];
}) => {
  const totalAmount = deals.reduce((sum, deal) => sum + deal.amount, 0);
  const { dealStages, currency } = useConfigurationContext();

  const stageConfig = dealStages.find((s) => s.value === stage);
  const stageColor = stageConfig?.color ?? "#4b5563";

  return (
    <div className="flex-1 pb-8 min-w-50">
      {/* Colored top accent bar */}
      <div
        className="h-0.5 w-full rounded-full mb-3"
        style={{ backgroundColor: stageColor }}
      />

      <div className="flex flex-col items-center mb-2">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: stageColor }}
          />
          <h3 className="text-sm font-semibold tracking-tight">
            {findDealLabel(dealStages, stage)}
          </h3>
          <span
            className="text-xs font-mono font-bold px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `${stageColor}22`,
              color: stageColor,
            }}
          >
            {deals.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground font-mono">
          {totalAmount.toLocaleString("en-US", {
            notation: "compact",
            style: "currency",
            currency,
            currencyDisplay: "narrowSymbol",
            minimumSignificantDigits: 3,
          })}
        </p>
      </div>

      <Droppable droppableId={stage}>
        {(droppableProvided, snapshot) => (
          <div
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
            className={`flex flex-col rounded-xl mt-1 gap-2 min-h-12 p-1 transition-colors ${
              snapshot.isDraggingOver
                ? "bg-muted/60 ring-1 ring-border"
                : "bg-transparent"
            }`}
          >
            {deals.map((deal, index) => (
              <DealCard key={deal.id} deal={deal} index={index} />
            ))}
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
