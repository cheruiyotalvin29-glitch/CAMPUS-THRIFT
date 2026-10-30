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

cur.execute("""
UPDATE auth.users 
SET encrypted_password = crypt('campus2026', gen_salt('bf'))
WHERE email ILIKE 'faith.wanjiku@testmail.com';
""")

print("Successfully updated faith.wanjiku@testmail.com password to campus2026!")
conn.close()
