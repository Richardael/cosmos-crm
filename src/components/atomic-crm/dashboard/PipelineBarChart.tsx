import { useMemo } from "react";
import { BarChart2 } from "lucide-react";
import { useGetList } from "ra-core";
import { ResponsiveBar } from "@nivo/bar";
import { Skeleton } from "@/components/ui/skeleton";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";

const nivoTheme = {
  background: "transparent",
  text: { fill: "#9CA3AF", fontSize: 12 },
  axis: {
    ticks: { text: { fill: "#9CA3AF", fontSize: 11 } },
    legend: { text: { fill: "#9CA3AF" } },
  },
  grid: { line: { stroke: "#2E3547", strokeWidth: 1 } },
  tooltip: {
    container: {
      background: "#232837",
      color: "#EBEBEB",
      border: "1px solid #2E3547",
      borderRadius: 6,
      fontSize: 12,
    },
  },
};

export const PipelineBarChart = () => {
  const { dealStages, dealPipelineStatuses } = useConfigurationContext();

  const { data: deals, isPending } = useGetList<Deal>("deals", {
    pagination: { perPage: 500, page: 1 },
  });

  const chartData = useMemo(() => {
    if (!deals) return [];
    // Only show active stages (exclude terminal ones)
    const activeStages = dealStages.filter(
      (s) => !dealPipelineStatuses.includes(s.value),
    );
    return activeStages.map((stage) => ({
      stage: stage.label.replace(/^[^\s]+\s/, ""), // strip leading emoji for display
      count: deals.filter((d) => d.stage === stage.value).length,
      color: stage.color ?? "#9CA3AF",
    }));
  }, [deals, dealStages, dealPipelineStatuses]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-4">
        <BarChart2 className="w-5 h-5 text-muted-foreground mr-2" />
        <h2 className="text-base font-semibold text-muted-foreground">
          Pipeline por Stage
        </h2>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : (
        <div style={{ height: chartData.length * 48 + 24 }}>
          <ResponsiveBar
            data={chartData}
            indexBy="stage"
            keys={["count"]}
            layout="horizontal"
            colors={({ data }) => (data as { color: string }).color}
            theme={nivoTheme}
            margin={{ top: 0, right: 40, bottom: 10, left: 110 }}
            padding={0.35}
            borderRadius={3}
            enableGridX={false}
            enableGridY={false}
            enableLabel
            label={(d) => String(d.value)}
            labelTextColor="#1A1E29"
            labelSkipWidth={24}
            axisLeft={{
              tickSize: 0,
              tickPadding: 8,
            }}
            axisBottom={null}
            tooltip={({ indexValue, value }) => (
              <div className="px-3 py-1.5 text-sm bg-surface border border-border rounded shadow">
                <span className="font-medium">{indexValue}</span>
                <span className="text-muted-foreground ml-2">
                  {value} deal{value !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
};
