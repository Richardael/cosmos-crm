import { Pencil, Trash2 } from "lucide-react";
import { useDelete, useNotify } from "ra-core";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import type { ContactStatus } from "../types";
import { ContactStatusEditDialog } from "./ContactStatusEditDialog";

type Props = { record: ContactStatus; onMutate: () => void };

export const ContactStatusRow = ({ record, onMutate }: Props) => {
  const [editing, setEditing] = useState(false);
  const notify = useNotify();

  const [deleteOne, { isPending: isDeleting }] = useDelete(
    "contact_statuses",
    { id: record.id, previousData: record },
    {
      onSuccess: () => {
        notify("Estado eliminado");
        onMutate();
      },
      onError: () => notify("Error al eliminar el estado", { type: "error" }),
    },
  );

  return (
    <>
      <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: record.color }}
          />
          {record.icon && <span className="text-base">{record.icon}</span>}
          <span className="font-medium text-ghost">{record.label}</span>
          {record.is_default && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald/20 text-emerald border border-emerald/30">
              por defecto
            </span>
          )}
          <span className="text-xs text-ghost-muted">#{record.position}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 cursor-pointer"
            onClick={() => setEditing(true)}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          {!record.is_default && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 cursor-pointer text-destructive hover:text-destructive"
              disabled={isDeleting}
              onClick={() => deleteOne()}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
      <ContactStatusEditDialog
        record={record}
        open={editing}
        onOpenChange={setEditing}
        onSuccess={onMutate}
      />
    </>
  );
};
