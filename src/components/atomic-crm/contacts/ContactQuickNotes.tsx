import { useCallback, useEffect, useRef, useState } from "react";
import { useRecordContext, useUpdate } from "ra-core";
import { Textarea } from "@/components/ui/textarea";

import type { Contact } from "../types";

export const ContactQuickNotes = () => {
  const record = useRecordContext<Contact>();
  const [update] = useUpdate();
  const [value, setValue] = useState(record?.background ?? "");
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(record?.background ?? "");
  }, [record?.id]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newVal = e.target.value;
      setValue(newVal);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setSaving(true);
        update(
          "contacts",
          {
            id: record!.id,
            data: { background: newVal },
            previousData: record,
          },
          {
            onSuccess: () => setSaving(false),
            onError: () => setSaving(false),
          },
        );
      }, 1500);
    },
    [record, update],
  );

  if (!record) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Notas rápidas
        </span>
        {saving && (
          <span className="text-xs text-muted-foreground animate-pulse">
            Guardando...
          </span>
        )}
      </div>
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder="Agrega contexto sobre este contacto..."
        className="resize-none text-sm min-h-[120px] bg-surface border-border"
      />
    </div>
  );
};
