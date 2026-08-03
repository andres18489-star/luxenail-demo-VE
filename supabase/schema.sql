-- ============================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR LUXENAIL & BEAUTY STUDIO MVP
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    category TEXT NOT NULL CHECK (category IN ('Sistemas', 'Semipermanente', 'Pedicura', 'Pestañas', 'Manicure', 'Pedicure', 'Extensions', 'Nail Art', 'Add-ons')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    popular BOOLEAN DEFAULT false,
    image TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SPECIALISTS TABLE
CREATE TABLE IF NOT EXISTS public.specialists (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    specialty TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 1,
    bio TEXT,
    available_days TEXT[] DEFAULT ARRAY['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PORTFOLIO ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.portfolio_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    artist TEXT DEFAULT 'Victoria Vance',
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    reference_code TEXT UNIQUE NOT NULL,
    service_id TEXT REFERENCES public.services(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    service_price NUMERIC(10, 2) NOT NULL,
    specialist_id TEXT REFERENCES public.specialists(id) ON DELETE SET NULL,
    specialist_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Services RLS
CREATE POLICY "Public Read Services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public Insert Services" ON public.services FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Services" ON public.services FOR UPDATE USING (true);
CREATE POLICY "Public Delete Services" ON public.services FOR DELETE USING (true);

-- Specialists RLS
CREATE POLICY "Public Read Specialists" ON public.specialists FOR SELECT USING (true);
CREATE POLICY "Public Insert Specialists" ON public.specialists FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Specialists" ON public.specialists FOR UPDATE USING (true);
CREATE POLICY "Public Delete Specialists" ON public.specialists FOR DELETE USING (true);

-- Portfolio Items RLS
CREATE POLICY "Public Read Portfolio" ON public.portfolio_items FOR SELECT USING (true);
CREATE POLICY "Public Insert Portfolio" ON public.portfolio_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Portfolio" ON public.portfolio_items FOR UPDATE USING (true);
CREATE POLICY "Public Delete Portfolio" ON public.portfolio_items FOR DELETE USING (true);

-- Appointments RLS
CREATE POLICY "Public Read Appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Public Insert Appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Appointments" ON public.appointments FOR UPDATE USING (true);
CREATE POLICY "Public Delete Appointments" ON public.appointments FOR DELETE USING (true);
