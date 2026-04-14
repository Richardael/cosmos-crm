import { useState } from "react";
import { useRecordContext } from "ra-core";
import { Mail, Phone, PlusCircle } from "lucide-react";
import {
  AvatarFallback,
  AvatarImage,
  Avatar as ShadcnAvatar,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { NoteCreateSheet } from "../notes/NoteCreateSheet";
import { contactSources } from "../root/defaultConfiguration";
import type { Contact } from "../types";

export const ContactShowHeader = () => {
  const record = useRecordContext<Contact>();
  const [noteOpen, setNoteOpen] = useState(false);

  if (!record) return null;

  const phone = record.phone_jsonb?.[0]?.number;
  const email = record.email_jsonb?.[0]?.email;
  const sourceEntry = contactSources.find((s) => s.value === record.source);
  const whatsappNumber = phone?.replace(/\D/g, "");

  return (
    <>
      <NoteCreateSheet
        open={noteOpen}
        onOpenChange={setNoteOpen}
        contact_id={record.id}
      />

      <div className="flex items-center gap-5 pb-6 border-b border-border">
        {/* Large avatar */}
        <ShadcnAvatar className="w-20 h-20 shrink-0 text-2xl">
          <AvatarImage src={record.avatar?.src ?? undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
            {record.first_name?.charAt(0).toUpperCase()}
            {record.last_name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </ShadcnAvatar>

        {/* Name + subtitle */}
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-4xl leading-none tracking-wide text-foreground">
            {record.first_name} {record.last_name}
          </h1>
          {(record.title || record.company_name) && (
            <p className="text-sm text-muted-foreground mt-1.5 truncate">
              {record.title}
              {record.title && record.company_name ? " · " : ""}
              {record.company_name}
            </p>
          )}
          {sourceEntry && (
            <Badge variant="outline" className="mt-2 text-xs">
              {sourceEntry.label}
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="shrink-0 flex items-center gap-2">
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-1.5">
                <Phone className="w-4 h-4" />
                WhatsApp
              </Button>
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </a>
          )}
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setNoteOpen(true)}
          >
            <PlusCircle className="w-4 h-4" />
            Nueva Actividad
          </Button>
        </div>
      </div>
    </>
  );
};
