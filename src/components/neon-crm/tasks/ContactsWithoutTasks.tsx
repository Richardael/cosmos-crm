import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { es } from "date-fns/locale";
import { Plus } from "lucide-react";
import { useGetList } from "ra-core";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import type { Contact, Task } from "../types";
import { TaskCreateSheet } from "./TaskCreateSheet";

type ContactWithoutTaskRowProps = {
  contact: Contact;
};

const ContactWithoutTaskRow = ({ contact }: ContactWithoutTaskRowProps) => {
  const [openCreate, setOpenCreate] = useState(false);
  const createdAgo = contact.first_seen
    ? formatDistanceToNow(new Date(contact.first_seen), {
        addSuffix: true,
        locale: es,
      })
    : null;

  return (
    <>
      <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={`/contacts/${contact.id}/show`}
            className="font-medium text-foreground hover:text-primary transition-colors truncate"
          >
            {contact.first_name} {contact.last_name}
          </Link>
          {contact.source && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border shrink-0">
              {contact.source}
            </span>
          )}
          {createdAgo && (
            <span className="text-xs text-muted-foreground hidden sm:inline shrink-0">
              {createdAgo}
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setOpenCreate(true)}
          className="shrink-0 ml-2 cursor-pointer"
        >
          <Plus className="w-3 h-3 mr-1" />
          Crear tarea
        </Button>
      </div>
      <TaskCreateSheet
        open={openCreate}
        onOpenChange={setOpenCreate}
        contact_id={contact.id}
      />
    </>
  );
};

export const ContactsWithoutTasks = ({
  onCountChange,
}: {
  onCountChange?: (count: number) => void;
}) => {
  const { data: contacts, isPending: contactsPending } = useGetList<Contact>(
    "contacts",
    {
      pagination: { page: 1, perPage: 1000 },
      sort: { field: "created_at", order: "DESC" },
    },
  );

  const { data: tasks, isPending: tasksPending } = useGetList<Task>("tasks", {
    pagination: { page: 1, perPage: 1000 },
    filter: {},
  });

  const contactsWithoutPendingTask = useMemo(() => {
    if (!contacts || !tasks) return [];
    const contactIdsWithPendingTask = new Set(
      tasks.filter((t) => !t.done_date).map((t) => String(t.contact_id)),
    );
    const result = contacts.filter(
      (c) => !contactIdsWithPendingTask.has(String(c.id)),
    );
    onCountChange?.(result.length);
    return result;
  }, [contacts, tasks, onCountChange]);

  if (contactsPending || tasksPending) {
    return (
      <div className="flex flex-col gap-3 mt-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (!contactsWithoutPendingTask.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-base font-medium">¡Todo al día!</p>
        <p className="text-sm mt-1">
          Todos los contactos tienen al menos una tarea pendiente.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <p className="text-xs text-muted-foreground mb-3">
        {contactsWithoutPendingTask.length} contacto
        {contactsWithoutPendingTask.length !== 1 ? "s" : ""} sin tarea pendiente
      </p>
      <div>
        {contactsWithoutPendingTask.map((contact) => (
          <ContactWithoutTaskRow key={contact.id} contact={contact} />
        ))}
      </div>
    </div>
  );
};
