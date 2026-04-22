import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Welcome = () => (
  <Card>
    <CardHeader className="px-4">
      <CardTitle>Neon CRM — Tu universo de clientes, en orden.</CardTitle>
    </CardHeader>
    <CardContent className="px-4">
      <p className="text-sm mb-4">
        Neon CRM es el CRM interno de Arcano Hub, construido sobre{" "}
        <a
          href="https://github.com/marmelab/atomic-crm"
          className="underline hover:no-underline"
        >
          Atomic CRM
        </a>{" "}
        (MIT).
      </p>
      <p className="text-sm mb-4">
        Esta demo corre sobre una API mock — los datos se reinician al recargar.
        La versión completa usa Supabase como backend.
      </p>
    </CardContent>
  </Card>
);
