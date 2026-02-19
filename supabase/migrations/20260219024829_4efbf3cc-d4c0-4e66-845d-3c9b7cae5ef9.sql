
-- 1. Enum for roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'shop_admin', 'staff');

-- 2. Enum for plan types
CREATE TYPE public.plan_type AS ENUM ('basic', 'premium');

-- 3. Enum for appointment status
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');

-- 4. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. User roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 6. Barbershops table
CREATE TABLE public.barbershops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan_type plan_type NOT NULL DEFAULT 'basic',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#D4A853',
  secondary_color TEXT DEFAULT '#1A1A2E',
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  whatsapp_enabled BOOLEAN NOT NULL DEFAULT false,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.barbershops ENABLE ROW LEVEL SECURITY;

-- 7. Barbershop members (links users to barbershops with roles)
CREATE TABLE public.barbershop_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'staff',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, barbershop_id)
);
ALTER TABLE public.barbershop_members ENABLE ROW LEVEL SECURITY;

-- 8. Barbers table
CREATE TABLE public.barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  specialty TEXT,
  phone TEXT,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;

-- 9. Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 10. Business hours table
CREATE TABLE public.business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL DEFAULT '09:00',
  close_time TIME NOT NULL DEFAULT '18:00',
  is_open BOOLEAN NOT NULL DEFAULT true,
  is_appointment_only BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(barbershop_id, day_of_week)
);
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- 11. Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE NOT NULL,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status appointment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 12. Blocked slots table
CREATE TABLE public.blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE NOT NULL,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECURITY DEFINER HELPER FUNCTIONS
-- ============================================================

-- Check if user has a specific global role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin');
$$;

-- Check if user is shop_admin for a specific barbershop
CREATE OR REPLACE FUNCTION public.is_shop_admin(_barbershop_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.barbershop_members
    WHERE user_id = auth.uid()
      AND barbershop_id = _barbershop_id
      AND role = 'shop_admin'
      AND is_active = true
  );
$$;

-- Check if user is a member of a barbershop (any role)
CREATE OR REPLACE FUNCTION public.is_shop_member(_barbershop_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.barbershop_members
    WHERE user_id = auth.uid()
      AND barbershop_id = _barbershop_id
      AND is_active = true
  );
$$;

-- Get barbershop_id for current user's membership
CREATE OR REPLACE FUNCTION public.get_user_barbershop_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT barbershop_id FROM public.barbershop_members
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$;

-- Count barbers for a barbershop
CREATE OR REPLACE FUNCTION public.count_barbers(_barbershop_id UUID)
RETURNS INTEGER
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM public.barbers
  WHERE barbershop_id = _barbershop_id AND is_active = true;
$$;

-- Check if barbershop has premium plan
CREATE OR REPLACE FUNCTION public.has_premium_plan(_barbershop_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.barbershops
    WHERE id = _barbershop_id AND plan_type = 'premium'
  );
$$;

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_barbershops_updated_at BEFORE UPDATE ON public.barbershops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON public.barbers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- TRIGGER: validate barber limit by plan
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_barber_limit()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  shop_plan plan_type;
  barber_count INTEGER;
BEGIN
  SELECT plan_type INTO shop_plan FROM public.barbershops WHERE id = NEW.barbershop_id;
  
  IF shop_plan = 'basic' THEN
    SELECT COUNT(*) INTO barber_count FROM public.barbers
    WHERE barbershop_id = NEW.barbershop_id AND is_active = true;
    
    IF barber_count >= 1 THEN
      RAISE EXCEPTION 'Plano Básico permite apenas 1 barbeiro. Faça upgrade para Premium.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_barber_limit
  BEFORE INSERT ON public.barbers
  FOR EACH ROW EXECUTE FUNCTION public.validate_barber_limit();

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Super admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_super_admin());

-- User roles (only super_admin can manage)
CREATE POLICY "Super admins can manage roles" ON public.user_roles FOR ALL USING (public.is_super_admin());
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Barbershops
CREATE POLICY "Super admins full access barbershops" ON public.barbershops FOR ALL USING (public.is_super_admin());
CREATE POLICY "Shop admins can view own barbershop" ON public.barbershops FOR SELECT USING (public.is_shop_member(id));
CREATE POLICY "Shop admins can update own barbershop" ON public.barbershops FOR UPDATE USING (public.is_shop_admin(id));
CREATE POLICY "Public can view active barbershops" ON public.barbershops FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Authenticated can view active barbershops" ON public.barbershops FOR SELECT TO authenticated USING (is_active = true);

-- Barbershop members
CREATE POLICY "Super admins full access members" ON public.barbershop_members FOR ALL USING (public.is_super_admin());
CREATE POLICY "Shop admins can manage own members" ON public.barbershop_members FOR ALL USING (public.is_shop_admin(barbershop_id));
CREATE POLICY "Members can view own membership" ON public.barbershop_members FOR SELECT USING (auth.uid() = user_id);

-- Barbers
CREATE POLICY "Super admins full access barbers" ON public.barbers FOR ALL USING (public.is_super_admin());
CREATE POLICY "Shop admins can manage own barbers" ON public.barbers FOR ALL USING (public.is_shop_admin(barbershop_id));
CREATE POLICY "Members can view own shop barbers" ON public.barbers FOR SELECT USING (public.is_shop_member(barbershop_id));
CREATE POLICY "Public can view active barbers" ON public.barbers FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Authenticated can view active barbers" ON public.barbers FOR SELECT TO authenticated USING (is_active = true);

-- Services
CREATE POLICY "Super admins full access services" ON public.services FOR ALL USING (public.is_super_admin());
CREATE POLICY "Shop admins can manage own services" ON public.services FOR ALL USING (public.is_shop_admin(barbershop_id));
CREATE POLICY "Public can view active services" ON public.services FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Authenticated can view active services" ON public.services FOR SELECT TO authenticated USING (is_active = true);

-- Business hours
CREATE POLICY "Super admins full access hours" ON public.business_hours FOR ALL USING (public.is_super_admin());
CREATE POLICY "Shop admins can manage own hours" ON public.business_hours FOR ALL USING (public.is_shop_admin(barbershop_id));
CREATE POLICY "Public can view hours" ON public.business_hours FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated can view hours" ON public.business_hours FOR SELECT TO authenticated USING (true);

-- Appointments
CREATE POLICY "Super admins full access appointments" ON public.appointments FOR ALL USING (public.is_super_admin());
CREATE POLICY "Shop admins can manage own appointments" ON public.appointments FOR ALL USING (public.is_shop_admin(barbershop_id));
CREATE POLICY "Staff can view own appointments" ON public.appointments FOR SELECT USING (
  barber_id IN (SELECT id FROM public.barbers WHERE user_id = auth.uid())
);
CREATE POLICY "Customers can view own appointments" ON public.appointments FOR SELECT USING (customer_user_id = auth.uid());
CREATE POLICY "Anon can create appointments" ON public.appointments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Authenticated can create appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (true);

-- Blocked slots
CREATE POLICY "Super admins full access blocked" ON public.blocked_slots FOR ALL USING (public.is_super_admin());
CREATE POLICY "Shop admins can manage blocked slots" ON public.blocked_slots FOR ALL USING (public.is_shop_admin(barbershop_id));
CREATE POLICY "Members can view blocked slots" ON public.blocked_slots FOR SELECT USING (public.is_shop_member(barbershop_id));

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_barbershop_members_user ON public.barbershop_members(user_id);
CREATE INDEX idx_barbershop_members_shop ON public.barbershop_members(barbershop_id);
CREATE INDEX idx_barbers_shop ON public.barbers(barbershop_id);
CREATE INDEX idx_services_shop ON public.services(barbershop_id);
CREATE INDEX idx_appointments_shop ON public.appointments(barbershop_id);
CREATE INDEX idx_appointments_barber ON public.appointments(barber_id);
CREATE INDEX idx_appointments_start ON public.appointments(start_time);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_blocked_slots_shop ON public.blocked_slots(barbershop_id);
CREATE INDEX idx_barbershops_slug ON public.barbershops(slug);
