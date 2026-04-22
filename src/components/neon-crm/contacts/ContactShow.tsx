import { useState } from "react";
import {
  InfiniteListBase,
  RecordRepresentation,
  ShowBase,
  useShowContext,
  useTranslate,
} from "ra-core";
import type { ShowBaseProps } from "ra-core";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReferenceField } from "@/components/admin/reference-field";
import { TextField } from "@/components/admin/text-field";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pencil } from "lucide-react";
import { Link } from "react-router";

import MobileHeader from "../layout/MobileHeader";
import { MobileContent } from "../layout/MobileContent";
import { CompanyAvatar } from "../companies/CompanyAvatar";
import { NoteCreate, NotesIterator, NotesIteratorMobile } from "../notes";
import { NoteCreateSheet } from "../notes/NoteCreateSheet";
import { TagsListEdit } from "./TagsListEdit";
import { ContactEditSheet } from "./ContactEditSheet";
import { ContactStatusSelector } from "./ContactInputs";
import { ContactPersonalInfo } from "./ContactPersonalInfo";
import { ContactBackgroundInfo } from "./ContactBackgroundInfo";
import { ContactTasksList } from "./ContactTasksList";
import type { Contact } from "../types";
import { Avatar } from "./Avatar";
import { ContactShowHeader } from "./ContactShowHeader";
import { ContactQuickNotes } from "./ContactQuickNotes";
import { ContactDeals } from "./ContactDeals";
import { AsideSection } from "../misc/AsideSection";
import { AddTask } from "../tasks/AddTask";
import { TasksIterator } from "../tasks/TasksIterator";
import { ReferenceManyField } from "@/components/admin/reference-many-field";
import { ExportVCardButton } from "./ExportVCardButton";
import { ContactMergeButton } from "./ContactMergeButton";
import { DeleteButton } from "@/components/admin";
import { MobileBackButton } from "../misc/MobileBackButton";

export const ContactShow = (props: ShowBaseProps = {}) => {
  const isMobile = useIsMobile();

  return (
    <ShowBase
      queryOptions={{
        onError: isMobile
          ? () => {
              {
                /** Disable error notification as the content handles offline */
              }
            }
          : undefined,
      }}
      {...props}
    >
      {isMobile ? <ContactShowContentMobile /> : <ContactShowContent />}
    </ShowBase>
  );
};

const ContactShowContentMobile = () => {
  const translate = useTranslate();
  const { defaultTitle, record, isPending } = useShowContext<Contact>();
  const [noteCreateOpen, setNoteCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  if (isPending || !record) return null;

  const taskCount = record.nb_tasks ?? 0;

  return (
    <>
      {/* We need to repeat the note creation sheet here to support the note 
      create button that is rendered when there are no notes. */}
      <NoteCreateSheet
        open={noteCreateOpen}
        onOpenChange={setNoteCreateOpen}
        contact_id={record.id}
      />
      <ContactEditSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        contactId={record.id}
      />
      <MobileHeader>
        <MobileBackButton />
        <div className="flex flex-1 min-w-0">
          <Link to="/contacts" className="flex-1 min-w-0">
            <h1 className="truncate text-xl font-semibold">{defaultTitle}</h1>
          </Link>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={translate("ra.action.edit")}
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-5" />
        </Button>
      </MobileHeader>
      <MobileContent>
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Avatar />
            <div className="mx-3 flex-1">
              <h2 className="text-2xl font-bold">
                <RecordRepresentation />
              </h2>
              <div className="text-sm text-muted-foreground">
                {record.title && record.company_id != null
                  ? `${translate("resources.contacts.position_at", {
                      title: record.title,
                    })} `
                  : record.title}
                {record.company_id != null && (
                  <ReferenceField
                    source="company_id"
                    reference="companies"
                    link="show"
                  >
                    <TextField source="name" className="underline" />
                  </ReferenceField>
                )}
              </div>
            </div>
            <div>
              <ReferenceField
                source="company_id"
                reference="companies"
                link="show"
                className="no-underline"
              >
                <CompanyAvatar />
              </ReferenceField>
            </div>
          </div>
        </div>

        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger value="notes">
              {translate("resources.notes.name", { smart_count: 2 })}
            </TabsTrigger>
            <TabsTrigger value="tasks">
              {translate("crm.common.task_count", {
                smart_count: taskCount ?? 0,
              })}
            </TabsTrigger>
            <TabsTrigger value="details">
              {translate("crm.common.details")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-2">
            <InfiniteListBase
              resource="contact_notes"
              filter={{ contact_id: record.id }}
              sort={{ field: "date", order: "DESC" }}
              perPage={25}
              disableSyncWithLocation
              storeKey={false}
              empty={
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    {translate("resources.notes.empty")}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setNoteCreateOpen(true)}
                  >
                    {translate("resources.notes.action.add")}
                  </Button>
                </div>
              }
              loading={false}
              error={false}
              queryOptions={{
                onError: () => {
                  /** override to hide notification as error case is handled by NotesIteratorMobile */
                },
              }}
            >
              <NotesIteratorMobile contactId={record.id} showStatus />
            </InfiniteListBase>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <ContactTasksList />
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">
                  {translate("resources.notes.fields.status")}
                </h3>
                <Separator />
                <div className="mt-3">
                  <ContactStatusSelector />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {translate(
                    "resources.contacts.field_categories.personal_info",
                  )}
                </h3>
                <Separator />
                <div className="mt-3">
                  <ContactPersonalInfo />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {translate(
                    "resources.contacts.field_categories.background_info",
                  )}
                </h3>
                <Separator />
                <div className="mt-3">
                  <ContactBackgroundInfo />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {translate("resources.tags.name", { smart_count: 2 })}
                </h3>
                <Separator />
                <div className="mt-3">
                  <TagsListEdit />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </MobileContent>
    </>
  );
};

const ContactShowContent = () => {
  const translate = useTranslate();
  const { record, isPending } = useShowContext<Contact>();
  if (isPending || !record) return null;

  return (
    <div className="mt-2 mb-8 flex flex-col gap-6">
      {/* Full-width header */}
      <ContactShowHeader />

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] gap-6 items-start">
        {/* Left column — info */}
        <div className="flex flex-col gap-0">
          <AsideSection title={translate("resources.notes.fields.status")}>
            <ContactStatusSelector />
          </AsideSection>

          <AsideSection
            title={translate(
              "resources.contacts.field_categories.personal_info",
            )}
          >
            <ContactPersonalInfo />
          </AsideSection>

          <AsideSection
            title={translate(
              "resources.contacts.field_categories.background_info",
            )}
          >
            <ContactBackgroundInfo />
          </AsideSection>

          <AsideSection
            title={translate("resources.tags.name", { smart_count: 2 })}
          >
            <TagsListEdit />
          </AsideSection>

          <AsideSection
            title={translate("resources.tasks.name", { smart_count: 2 })}
          >
            <ReferenceManyField
              target="contact_id"
              reference="tasks"
              sort={{ field: "due_date", order: "ASC" }}
              perPage={1000}
            >
              <TasksIterator />
            </ReferenceManyField>
            <AddTask />
          </AsideSection>

          <div className="pt-4 border-t border-border flex flex-col gap-2 items-start">
            <ExportVCardButton />
            <ContactMergeButton />
          </div>
          <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2 items-start">
            <DeleteButton
              className="h-6 cursor-pointer hover:bg-destructive/10! text-destructive! border-destructive! focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
              size="sm"
            />
          </div>
        </div>

        {/* Center column — activity timeline */}
        <div>
          <InfiniteListBase
            resource="contact_notes"
            filter={{ contact_id: record.id }}
            sort={{ field: "date", order: "DESC" }}
            perPage={25}
            disableSyncWithLocation
            storeKey={false}
            empty={
              <NoteCreate reference="contacts" showStatus className="mt-4" />
            }
          >
            <NotesIterator reference="contacts" showStatus />
          </InfiniteListBase>
        </div>

        {/* Right column — deals + quick notes */}
        <div className="flex flex-col gap-6">
          <ContactDeals contactId={record.id} />
          <div className="border-t border-border pt-4">
            <ContactQuickNotes />
          </div>
        </div>
      </div>
    </div>
  );
};
