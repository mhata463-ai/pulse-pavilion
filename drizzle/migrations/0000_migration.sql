CREATE TABLE public.hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  last_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.hospital_vitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT current_date,
  revenue numeric NOT NULL DEFAULT 0, returns numeric NOT NULL DEFAULT 0,
  surgeries jsonb NOT NULL DEFAULT '{}', emergency jsonb NOT NULL DEFAULT '{}',
  beds jsonb NOT NULL DEFAULT '{}', attendance jsonb NOT NULL DEFAULT '{}',
  electricity jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (hospital_id, day)
);
CREATE TABLE public.cashbox_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT current_date,
  cash numeric NOT NULL DEFAULT 0, wallets numeric NOT NULL DEFAULT 0, cheques numeric NOT NULL DEFAULT 0,
  insurance numeric NOT NULL DEFAULT 0, deferred numeric NOT NULL DEFAULT 0,
  pledges jsonb NOT NULL DEFAULT '{}',
  match_status text NOT NULL DEFAULT 'pending',
  matched_at timestamptz,
  matched_snapshot jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (hospital_id, day)
);
CREATE TABLE public.revenue_returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  external_ref text,
  kind text NOT NULL, amount numeric NOT NULL, quantity int NOT NULL DEFAULT 1,
  reason text, status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (hospital_id, external_ref)
);
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  external_ref text,
  period text NOT NULL, category text NOT NULL, item text NOT NULL,
  amount numeric NOT NULL, invoice_no text, details jsonb NOT NULL DEFAULT '{}',
  spent_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (hospital_id, external_ref)
);
CREATE TABLE public.expense_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  category text NOT NULL, period text NOT NULL, max_amount numeric NOT NULL,
  UNIQUE (hospital_id, category, period)
);
CREATE TABLE public.staff_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  employee_code text NOT NULL, employee_name text NOT NULL, job_title text,
  day date NOT NULL, shift text NOT NULL DEFAULT 'day',
  check_in timestamptz, check_out timestamptz,
  status text NOT NULL DEFAULT 'present', late_minutes int NOT NULL DEFAULT 0,
  UNIQUE (hospital_id, employee_code, day, shift)
);
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  source text NOT NULL, kind text NOT NULL, sender text,
  body text NOT NULL, is_read boolean NOT NULL DEFAULT false, reply text,
  remind_at timestamptz, external_ref text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX notifications_sync_ref ON public.notifications(hospital_id,external_ref);

CREATE TABLE public.hospital_access (hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE, user_id uuid NOT NULL, PRIMARY KEY(hospital_id,user_id));
GRANT SELECT ON public.hospital_access TO authenticated;
GRANT ALL ON public.hospital_access TO service_role;
ALTER TABLE public.hospital_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_access ON public.hospital_access FOR SELECT TO authenticated USING (user_id=auth.uid());

CREATE FUNCTION public.can_access_hospital(hid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.hospital_access WHERE hospital_id=hid AND user_id=auth.uid()) $$;
REVOKE ALL ON FUNCTION public.can_access_hospital(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_hospital(uuid) TO authenticated;

DO $$ DECLARE t text; BEGIN
FOREACH t IN ARRAY ARRAY['hospitals','hospital_vitals','cashbox_records','revenue_returns','expenses','expense_limits','staff_attendance','notifications'] LOOP
  EXECUTE format('GRANT SELECT ON public.%I TO authenticated', t);
  EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  EXECUTE format('CREATE POLICY hospital_read ON public.%I FOR SELECT TO authenticated USING (public.can_access_hospital(%I))',t,CASE WHEN t='hospitals' THEN 'id' ELSE 'hospital_id' END);
END LOOP; END $$;

GRANT UPDATE(match_status,matched_at,matched_snapshot) ON public.cashbox_records TO authenticated;
CREATE POLICY cashbox_action ON public.cashbox_records FOR UPDATE TO authenticated USING(public.can_access_hospital(hospital_id)) WITH CHECK(public.can_access_hospital(hospital_id));
GRANT UPDATE(status) ON public.revenue_returns TO authenticated;
CREATE POLICY returns_action ON public.revenue_returns FOR UPDATE TO authenticated USING(public.can_access_hospital(hospital_id)) WITH CHECK(public.can_access_hospital(hospital_id));
GRANT UPDATE(is_read,reply,remind_at) ON public.notifications TO authenticated;
CREATE POLICY notifications_action ON public.notifications FOR UPDATE TO authenticated USING(public.can_access_hospital(hospital_id)) WITH CHECK(public.can_access_hospital(hospital_id));
GRANT INSERT,UPDATE ON public.expense_limits TO authenticated;
CREATE POLICY limits_insert ON public.expense_limits FOR INSERT TO authenticated WITH CHECK(public.can_access_hospital(hospital_id));
CREATE POLICY limits_update ON public.expense_limits FOR UPDATE TO authenticated USING(public.can_access_hospital(hospital_id)) WITH CHECK(public.can_access_hospital(hospital_id));

CREATE FUNCTION public.match_cashbox(record_id uuid, undo boolean) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$ BEGIN
IF undo THEN UPDATE public.cashbox_records SET match_status='undone',matched_at=NULL WHERE id=record_id AND match_status='done';
ELSE UPDATE public.cashbox_records SET match_status='done',matched_at=now(),matched_snapshot=jsonb_build_object('cash',cash,'wallets',wallets,'cheques',cheques,'insurance',insurance,'deferred',deferred,'pledges',pledges) WHERE id=record_id AND match_status='pending'; END IF;
IF NOT FOUND THEN RAISE EXCEPTION 'Record unavailable or already processed'; END IF; END $$;
REVOKE ALL ON FUNCTION public.match_cashbox(uuid,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_cashbox(uuid,boolean) TO authenticated;

INSERT INTO public.hospitals (code, name) VALUES
 ('H1','المستشفى الأول'),('H2','المستشفى الثاني'),('H3','المستشفى الثالث');