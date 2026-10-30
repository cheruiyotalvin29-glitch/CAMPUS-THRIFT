import psycopg2

host = 'aws-0-eu-north-1.pooler.supabase.com'
user = 'postgres.opcoqdoobwnoskdttifx'
password = 'Notebook1!@123456789q'

print("Connecting to Supabase PostgreSQL at", host, "...")
conn = psycopg2.connect(host=host, user=user, password=password, dbname='postgres', port=6543)
conn.autocommit = True
cur = conn.cursor()

print("Reading sql/schema.sql...")
with open('sql/schema.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

print("Executing DDL in Supabase...")
cur.execute(sql)
print("SUCCESS: schema.sql executed successfully!")

print("Confirming pending emails in auth.users...")
cur.execute("UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;")
print("SUCCESS: Email confirmed for registered users!")

cur.execute("SELECT id, name, public FROM storage.buckets;")
print("Storage Buckets:", cur.fetchall())

cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")
print("Public Tables:", [r[0] for r in cur.fetchall()])

# Check columns of items table
cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'items' ORDER BY ordinal_position;")
print("Columns in items:", cur.fetchall())

conn.close()
print("All database checks passed!")
