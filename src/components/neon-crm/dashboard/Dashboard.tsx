import { useGetList } from "ra-core";

import type { Contact, ContactNote } from "../types";
import { DashboardActivityLog } from "./DashboardActivityLog";
import { DashboardStepper } from "./DashboardStepper";
import { DealsAtRisk } from "./DealsAtRisk";
import { HotContacts } from "./HotContacts";
import { KPICards } from "./KPICards";
import { PipelineBarChart } from "./PipelineBarChart";
import { TasksList } from "./TasksList";
import { Welcome } from "./Welcome";

export const Dashboard = () => {
  // Onboarding gates — same logic as before
  const {
    data: dataContact,
    total: totalContact,
    isPending: isPendingContact,
  } = useGetList<Contact>("contacts", {
    pagination: { page: 1, perPage: 1 },
  });

  const { total: totalContactNotes, isPending: isPendingContactNotes } =
    useGetList<ContactNote>("contact_notes", {
      pagination: { page: 1, perPage: 1 },
    });

  const { total: totalDeal, isPending: isPendingDeal } = useGetList<Contact>(
    "deals",
    {
      pagination: { page: 1, perPage: 1 },
    },
  );

  const isPending = isPendingContact || isPendingContactNotes || isPendingDeal;

  if (isPending) return null;

  if (!totalContact) return <DashboardStepper step={1} />;

  if (!totalContactNotes)
    return <DashboardStepper step={2} contactId={dataContact?.[0]?.id} />;

  // ─── Main dashboard ─────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 mt-1 pb-8">
      {/* Demo welcome banner */}
      {import.meta.env.VITE_IS_DEMO === "true" && <Welcome />}

      {/* Row 1 — KPI cards */}
      <KPICards />

      {/* Row 2 — Pipeline chart + Deals at risk */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 bg-card border border-border rounded-xl p-5">
          <PipelineBarChart />
        </div>
        <div className="md:col-span-5">
          <DealsAtRisk />
        </div>
      </div>

      {/* Row 3 — Activity log + Hot contacts + Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7">
          <DashboardActivityLog />
        </div>
        <div className="md:col-span-5 flex flex-col gap-6">
          {totalDeal ? <HotContacts /> : null}
          <TasksList />
        </div>
      </div>
    </div>
  );
};
