import { Plus } from "lucide-react";
import { useGetList, useRefresh } from "ra-core";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { ContactStatus } from "../types";
import { ContactStatusRow } from "./ContactStatusRow";
import { ContactStatusEditDialog } from "./ContactStatusEditDialog";

export const ContactStatusesPage = () => {
  const [creating, setCreating] = useState(false);
  const refresh = useRefresh();

  const { data: statuses, isPending } = useGetList<ContactStatus>(
    "contact_statuses",
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "position", order: "ASC" },
    },
  );

  return (
    <div className="max-w-xl mx-auto py-6 px-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ghost">
            Estados de contacto
          </h1>
          <p className="text-sm text-ghost-muted mt-1">
            Configura los estados que puedes asignar a tus contactos.
          </p>
        </div>
        <Button
          onClick={() => setCreating(true)}
          className="cursor-pointer"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Nuevo estado
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isPending ? (
            <div className="flex flex-col gap-3 p-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : !statuses?.length ? (
            <div className="text-center py-10 text-ghost-muted">
              <p className="text-sm">
                No hay estados configurados. Crea el primero.
              </p>
            </div>
          ) : (
            <div className="px-4">
              {statuses.map((s) => (
                <ContactStatusRow key={s.id} record={s} onMutate={refresh} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ContactStatusEditDialog
        open={creating}
        onOpenChange={setCreating}
        onSuccess={refresh}
      />
    </div>
  );
};

ContactStatusesPage.path = "/contact-statuses";
