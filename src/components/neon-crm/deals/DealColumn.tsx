import { Droppable } from "@hello-pangea/dnd";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { findDealLabel } from "./dealUtils";
import { DealCard } from "./DealCard";

// Palette applied by column index when a stage has no color property.
// Covers up to 10 stages; wraps beyond that.
const INDEX_COLORS = [
  "#9CA3AF", // gray
  "#60A5FA", // blue
  "#A78BFA", // purple
  "#FCD34D", // amber
  "#FB923C", // orange
  "#22c55e", // green
  "#EF4444", // red
  "#f472b6", // pink
  "#34d399", // emerald
  "#facc15", // yellow
];

export const DealColumn = ({
  stage,
  deals,
}: {
  stage: string;
  deals: Deal[];
}) => {
  const totalAmount = deals.reduce((sum, deal) => sum + deal.amount, 0);
  const { dealStages, currency } = useConfigurationContext();

  const stageIndex = dealStages.findIndex((s) => s.value === stage);
  const stageConfig = dealStages[stageIndex];
  // Use the stored color; fall back to the index-based palette so every column is distinct.
  const stageColor =
    stageConfig?.color ??
    INDEX_COLORS[stageIndex >= 0 ? stageIndex % INDEX_COLORS.length : 0];

  return (
    <div className="flex-1 pb-8 min-w-52 flex flex-col">
      {/* Column header card */}
      <div
        className="rounded-lg mb-3 px-3 py-2.5"
        style={{
          background: `linear-gradient(135deg, ${stageColor}25 0%, ${stageColor}0d 100%)`,
          borderTop: `3px solid ${stageColor}`,
          border: `1px solid ${stageColor}50`,
          borderTopWidth: "3px",
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{
                backgroundColor: stageColor,
                boxShadow: `0 0 8px ${stageColor}`,
              }}
            />
            <h3 className="text-sm font-bold" style={{ color: stageColor }}>
              {findDealLabel(dealStages, stage)}
            </h3>
          </div>
          <span
            className="text-xs font-mono font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0"
            style={{ backgroundColor: stageColor, color: "#0a0a0a" }}
          >
            {deals.length}
          </span>
        </div>
        <p className="text-xs font-mono" style={{ color: `${stageColor}bb` }}>
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
                    backgroundColor: `${stageColor}12`,
                    outline: `1.5px dashed ${stageColor}60`,
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
