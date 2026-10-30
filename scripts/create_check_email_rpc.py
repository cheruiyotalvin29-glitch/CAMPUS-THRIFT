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

# Create check_email_exists function
cur.execute("""
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
""")

print("Successfully created public.check_email_exists() function!")

# Test with existing email
cur.execute("SELECT public.check_email_exists('faith.wanjiku@testmail.com');")
res_exists = cur.fetchone()[0]

# Test with non-existing email
cur.execute("SELECT public.check_email_exists('doesnotexist_random123@univ.edu');")
res_not_exists = cur.fetchone()[0]

print("Existing email test ('faith.wanjiku@testmail.com'):", res_exists)
print("Non-existing email test ('doesnotexist_random123@univ.edu'):", res_not_exists)

conn.close()
