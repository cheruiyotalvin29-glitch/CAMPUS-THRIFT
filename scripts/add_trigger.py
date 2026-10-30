import psycopg2

conn = psycopg2.connect(
    host='aws-0-eu-north-1.pooler.supabase.com',
    user='postgres.opcoqdoobwnoskdttifx',
    password='Notebook1!@123456789q',
    dbname='postgres',
    port=6543
)
conn.autocommit = True
cur = conn.cursor()

# Auto-confirm trigger on auth.users
cur.execute("""
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
""")

print("Successfully installed auto_confirm_new_user trigger on auth.users!")

# Also ensure any existing unconfirmed users are confirmed
cur.execute("UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;")
print("Confirmed all existing auth.users!")

conn.close()
