import {
  Datagrid,
  DateField,
  FunctionField,
  List,
  TextField,
  useRecordContext,
} from "react-admin";

const MessageTypeBadge = () => {
  const record = useRecordContext();
  if (!record) return null;

  const config: Record<string, { label: string; color: string; bg: string }> = {
    welcome: { label: "Bienvenida", color: "#4ADE80", bg: "#14532D" },
    scheduler_d1: { label: "D1 Kevin", color: "#60A5FA", bg: "#1E3A5F" },
    scheduler_d3: { label: "D3 Kevin", color: "#A78BFA", bg: "#3B1F6B" },
    scheduler_d7: { label: "D7 Kevin", color: "#FCD34D", bg: "#5C3D0E" },
    kevin_command: { label: "Comando", color: "#F5C518", bg: "#412402" },
    kevin_reply: { label: "Respuesta", color: "#9CA3AF", bg: "#374151" },
  };

  const c = config[record.message_type] ?? {
    label: record.message_type,
    color: "#9CA3AF",
    bg: "#374151",
  };

  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: "4px",
        color: c.color,
        backgroundColor: c.bg,
        fontFamily: "DM Sans, sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      {c.label}
    </span>
  );
};

const DirectionBadge = () => {
  const record = useRecordContext();
  if (!record) return null;
  const isOut = record.direction === "outbound";
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: "4px",
        color: isOut ? "#F5C518" : "#4ADE80",
        backgroundColor: isOut
          ? "rgba(245,197,24,0.12)"
          : "rgba(74,222,128,0.12)",
        fontFamily: "DM Sans, sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      {isOut ? "↑ Saliente" : "↓ Entrante"}
    </span>
  );
};

const StatusBadge = () => {
  const record = useRecordContext();
  if (!record) return null;
  const map: Record<string, { label: string; color: string }> = {
    sent: { label: "Enviado", color: "#60A5FA" },
    failed: { label: "Fallido", color: "#F87171" },
    delivered: { label: "Entregado", color: "#4ADE80" },
    read: { label: "Leído", color: "#F5C518" },
  };
  const s = map[record.status] ?? { label: record.status, color: "#9CA3AF" };
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: "4px",
        color: s.color,
        backgroundColor: "rgba(255,255,255,0.05)",
        fontFamily: "JetBrains Mono, monospace",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
};

const StageChange = () => {
  const record = useRecordContext();
  if (!record?.stage_before || !record?.stage_after) return null;
  if (record.stage_before === record.stage_after) return null;
  return (
    <span
      style={{
        fontSize: "12px",
        fontFamily: "DM Sans, sans-serif",
        color: "#A0A0A0",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: "#606060" }}>{record.stage_before}</span>
      {" → "}
      <span style={{ color: "#F5C518", fontWeight: 500 }}>
        {record.stage_after}
      </span>
    </span>
  );
};

export const WhatsappMessageList = () => (
  <List
    resource="whatsapp_messages"
    sort={{ field: "created_at", order: "DESC" }}
    perPage={25}
    title="NeonBot"
  >
    <Datagrid bulkActionButtons={false} rowClick={false}>
      <FunctionField label="Tipo" render={() => <MessageTypeBadge />} />
      <FunctionField label="Dir." render={() => <DirectionBadge />} />
      <TextField
        label="Teléfono"
        source="phone_number"
        sx={{
          fontFamily: "JetBrains Mono",
          fontSize: "12px",
          color: "#A0A0A0",
        }}
      />
      <TextField
        label="Mensaje"
        source="message_text"
        sx={{
          maxWidth: "320px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: "13px",
          display: "block",
        }}
      />
      <FunctionField label="Stage" render={() => <StageChange />} />
      <FunctionField label="Estado" render={() => <StatusBadge />} />
      <DateField
        label="Fecha"
        source="created_at"
        showTime
        sx={{
          fontFamily: "JetBrains Mono",
          fontSize: "12px",
          color: "#606060",
          whiteSpace: "nowrap",
        }}
      />
    </Datagrid>
  </List>
);
