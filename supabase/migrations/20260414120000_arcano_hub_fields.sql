-- Migration: Arcano Hub custom fields
-- Adds currency to deals and source (lead origin) to contacts

alter table public.deals
    add column if not exists currency text not null default 'USD';

alter table public.contacts
    add column if not exists source text;
