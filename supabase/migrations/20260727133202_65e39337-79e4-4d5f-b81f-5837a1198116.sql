-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ WISHES ============
CREATE TYPE public.wish_status AS ENUM ('pending', 'approved', 'rejected', 'hidden');

CREATE TABLE public.wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  profile_image_url TEXT,
  note_image_url TEXT NOT NULL,
  transcription TEXT,
  status public.wish_status NOT NULL DEFAULT 'pending',
  paper_tint TEXT,      -- e.g. 'cream','yellow','pink','mint','blue'
  pin_color TEXT,       -- e.g. hex or name
  rotation NUMERIC DEFAULT 0,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_ip TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX wishes_status_idx ON public.wishes(status);
CREATE INDEX wishes_created_at_idx ON public.wishes(created_at DESC);

GRANT SELECT ON public.wishes TO anon;
GRANT SELECT, INSERT ON public.wishes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishes TO authenticated;
GRANT ALL ON public.wishes TO service_role;

ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

-- Public can view only approved wishes
CREATE POLICY "Approved wishes are public"
  ON public.wishes FOR SELECT TO anon, authenticated
  USING (status = 'approved');

-- Anyone (including anon) can submit a wish - forced to pending status
CREATE POLICY "Anyone can submit a wish"
  ON public.wishes FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending');

-- Admins can see everything
CREATE POLICY "Admins can view all wishes"
  ON public.wishes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update wishes"
  ON public.wishes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete wishes"
  ON public.wishes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER wishes_set_updated_at
  BEFORE UPDATE ON public.wishes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();