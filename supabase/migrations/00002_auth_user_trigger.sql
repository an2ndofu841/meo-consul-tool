-- ============================================================
-- Auto-create app user record when a new auth user signs up
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Get the first organization (for MVP, all users join the default org)
  SELECT id INTO default_org_id FROM public.organizations LIMIT 1;

  -- If no organization exists, create one
  IF default_org_id IS NULL THEN
    INSERT INTO public.organizations (name)
    VALUES ('Default Organization')
    RETURNING id INTO default_org_id;
  END IF;

  -- Insert the new user into the public users table
  INSERT INTO public.users (
    auth_uid,
    org_id,
    email,
    full_name,
    role
  ) VALUES (
    NEW.id,
    default_org_id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email, 'ユーザー'),
    'agency_admin'  -- first user gets admin role (MVP default)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
