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
    <div className="flex-1 pb-8 min-w-52 flex flex-col">
      {/* Column header card with strong color identity */}
      <div
        className="rounded-lg mb-3 px-3 py-2.5"
        style={{
          background: `linear-gradient(135deg, ${stageColor}18 0%, ${stageColor}08 100%)`,
          border: `1px solid ${stageColor}40`,
          borderTop: `3px solid ${stageColor}`,
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{
                backgroundColor: stageColor,
                boxShadow: `0 0 6px ${stageColor}80`,
              }}
            />
            <h3
              className="text-sm font-bold tracking-tight"
              style={{ color: stageColor }}
            >
              {findDealLabel(dealStages, stage)}
            </h3>
          </div>
          <span
            className="text-xs font-mono font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0"
            style={{
              backgroundColor: stageColor,
              color: "#0a0a0a",
            }}
          >
            {deals.length}
          </span>
        </div>
        <p className="text-xs font-mono" style={{ color: `${stageColor}99` }}>
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
            className="flex flex-col gap-2 flex-1 rounded-lg p-1.5 min-h-16 transition-all"
            style={
              snapshot.isDraggingOver
                ? {
                    backgroundColor: `${stageColor}10`,
                    outline: `1px dashed ${stageColor}50`,
                  }
                : {}
            }
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
