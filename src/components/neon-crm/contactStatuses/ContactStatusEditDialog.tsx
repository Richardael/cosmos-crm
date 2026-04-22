import { useCreate, useNotify, useUpdate } from "ra-core";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { ContactStatus } from "../types";

type FormValues = {
  label: string;
  color: string;
  icon: string;
  position: number;
  is_default: boolean;
};

type Props = {
  record?: ContactStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export const ContactStatusEditDialog = ({
  record,
  open,
  onOpenChange,
  onSuccess,
}: Props) => {
  const notify = useNotify();
  const isEdit = !!record;

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      label: record?.label ?? "",
      color: record?.color ?? "#9CA3AF",
      icon: record?.icon ?? "",
      position: record?.position ?? 0,
      is_default: record?.is_default ?? false,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        label: record?.label ?? "",
        color: record?.color ?? "#9CA3AF",
        icon: record?.icon ?? "",
        position: record?.position ?? 0,
        is_default: record?.is_default ?? false,
      });
    }
  }, [open, record, reset]);

  const [update] = useUpdate();
  const [create] = useCreate();

  const onSubmit = async (values: FormValues) => {
    if (isEdit) {
      await update(
        "contact_statuses",
        { id: record.id, data: values, previousData: record },
        {
          onSuccess: () => {
            notify("Estado actualizado");
            onSuccess();
            onOpenChange(false);
          },
          onError: () =>
            notify("Error al actualizar el estado", { type: "error" }),
        },
      );
    } else {
      await create(
        "contact_statuses",
        { data: values },
        {
          onSuccess: () => {
            notify("Estado creado");
            onSuccess();
            onOpenChange(false);
          },
          onError: () => notify("Error al crear el estado", { type: "error" }),
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar estado" : "Nuevo estado de contacto"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Nombre del estado</label>
            <input
              {...register("label", { required: true })}
              className="border border-border rounded-md px-3 py-2 bg-card text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="ej: Activo"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium">Color (hex)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  {...register("color")}
                  className="w-9 h-9 cursor-pointer appearance-none rounded border bg-transparent p-0.5"
                />
                <input
                  {...register("color")}
                  className="border border-border rounded-md px-3 py-2 bg-card text-foreground text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="#9CA3AF"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 w-24">
              <label className="text-sm font-medium">Ícono</label>
              <input
                {...register("icon")}
                className="border border-border rounded-md px-3 py-2 bg-card text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="✅"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium">Orden</label>
              <input
                type="number"
                {...register("position", { valueAsNumber: true, min: 0 })}
                className="border border-border rounded-md px-3 py-2 bg-card text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-end pb-2 gap-2">
              <input
                type="checkbox"
                id="is_default"
                {...register("is_default")}
              />
              <label htmlFor="is_default" className="text-sm">
                Por defecto
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
