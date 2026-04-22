import {
  CreateBase,
  Form,
  useGetIdentity,
  useNotify,
  useRedirect,
  type MutationMode,
  type RaRecord,
} from "ra-core";
import { Card, CardContent } from "@/components/ui/card";

import { ContactInputs } from "./ContactInputs";
import { FormToolbar } from "../layout/FormToolbar";
import {
  cleanupContactForCreate,
  defaultEmailJsonb,
  defaultPhoneJsonb,
} from "./contactModel";

export const ContactCreate = ({
  mutationMode,
}: {
  mutationMode?: MutationMode;
}) => {
  const { identity } = useGetIdentity();
  const notify = useNotify();
  const redirect = useRedirect();

  const handleSuccess = (data: RaRecord) => {
    notify("crm.contacts.created_task_reminder", {
      type: "info",
      autoHideDuration: 7000,
    });
    redirect("show", "contacts", data.id);
  };

  return (
    <CreateBase
      redirect={false}
      transform={cleanupContactForCreate}
      mutationMode={mutationMode}
      mutationOptions={{ onSuccess: handleSuccess }}
    >
      <div className="mt-2 flex lg:mr-72">
        <div className="flex-1">
          <Form
            defaultValues={{
              sales_id: identity?.id,
              email_jsonb: defaultEmailJsonb,
              phone_jsonb: defaultPhoneJsonb,
            }}
          >
            <Card>
              <CardContent>
                <ContactInputs />
                <FormToolbar />
              </CardContent>
            </Card>
          </Form>
        </div>
      </div>
    </CreateBase>
  );
};
