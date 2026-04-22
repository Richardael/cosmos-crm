-- Update the configuration table with Arcano Hub's custom deal stages (with colors)
-- and pipeline settings. This replaces the upstream English stages.
UPDATE configuration
SET config = jsonb_set(
  jsonb_set(
    jsonb_set(
      COALESCE(config, '{}'::jsonb),
      '{dealStages}',
      '[
        {"value":"prospecto",    "label":"Prospecto",      "color":"#9CA3AF","probability":10},
        {"value":"contactado",   "label":"Contactado",     "color":"#60A5FA","probability":25},
        {"value":"reunion",      "label":"En Reunión",     "color":"#A78BFA","probability":40},
        {"value":"propuesta",    "label":"Propuesta",      "color":"#FCD34D","probability":60},
        {"value":"negociacion",  "label":"Negociación",    "color":"#FB923C","probability":75},
        {"value":"cerrado_won",  "label":"✅ Cerrado Won", "color":"#22c55e","probability":100},
        {"value":"cerrado_lost", "label":"❌ Cerrado Lost","color":"#EF4444","probability":0}
      ]'::jsonb
    ),
    '{dealPipelineStatuses}',
    '["cerrado_won","cerrado_lost"]'::jsonb
  ),
  '{dealCategories}',
  '[
    {"value":"arepay",       "label":"🍽️ ArePay"},
    {"value":"neon_crm",     "label":"⚡ Neon CRM"},
    {"value":"landing_page", "label":"🚀 Landing Page"},
    {"value":"webapp",       "label":"💻 Web App a Medida"},
    {"value":"consultoria",  "label":"🧠 Consultoría Tech"},
    {"value":"banco_horas",  "label":"⏱️ Banco de Horas"},
    {"value":"otro",         "label":"📦 Otro"}
  ]'::jsonb
)
WHERE id = 1;
