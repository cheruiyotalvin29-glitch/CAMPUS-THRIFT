-- ============================================================================
-- CAMPUS THRIFT MARKET - MIGRATION UPDATE V2
-- Run this in your Supabase SQL Editor to update an existing database:
-- 1. Cleans up any legacy 'Email' contact entries to 'WhatsApp'
-- 2. Enforces contact_method constraint strictly to ('WhatsApp', 'Phone')
-- 3. Ensures campus_location column exists
-- 4. Installs the auto-confirm trigger so student sign-ups are instant!
-- ============================================================================

-- 1. Ensure campus_location column exists on items
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS campus_location TEXT DEFAULT 'Main Campus';

-- 2. Update any legacy listings with 'Email' to 'WhatsApp'
UPDATE public.items 
SET contact_method = 'WhatsApp' 
WHERE contact_method = 'Email';

-- 3. Enforce constraint to only allow ('WhatsApp', 'Phone')
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_contact_method_check;
ALTER TABLE public.items ADD CONSTRAINT items_contact_method_check 
    CHECK (contact_method IN ('WhatsApp', 'Phone'));

-- 4. Auto-Confirm Trigger: Makes all student signups instant without email confirmation wait!
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, NOW());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
    BEFORE INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_new_user();

-- 5. Confirm any existing unconfirmed users
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- 6. Helper RPC Function to check if an email is already registered
CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE LOWER(email) = LOWER(TRIM(email_to_check))
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO anon, authenticated, service_role;
