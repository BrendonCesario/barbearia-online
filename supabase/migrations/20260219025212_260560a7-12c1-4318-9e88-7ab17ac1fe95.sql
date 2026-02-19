
-- Add 'intermediario' to plan_type enum
ALTER TYPE public.plan_type ADD VALUE 'intermediario';

-- Add is_plan_active to barbershops for blocking logic
ALTER TABLE public.barbershops ADD COLUMN is_plan_active BOOLEAN NOT NULL DEFAULT true;
