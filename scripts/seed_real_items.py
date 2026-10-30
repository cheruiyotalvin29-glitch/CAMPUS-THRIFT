import psycopg2
import json

host = 'aws-0-eu-north-1.pooler.supabase.com'
user = 'postgres.opcoqdoobwnoskdttifx'
password = 'Notebook1!@123456789q'

conn = psycopg2.connect(host=host, user=user, password=password, dbname='postgres', port=6543)
conn.autocommit = True
cur = conn.cursor()

# Get existing student profile ID
cur.execute("SELECT id FROM public.profiles LIMIT 1;")
row = cur.fetchone()
if not row:
    print("No profiles found!")
    exit(1)

seller_id = row[0]
print("Using seller profile ID:", seller_id)

sample_items = [
    (
        seller_id,
        "TI-84 Plus CE Graphing Calculator",
        "Color screen graphing calculator in excellent condition with USB charging cable and sliding hard case. Pre-loaded with statistics tools.",
        4500,
        "Electronics",
        "Like New",
        "Engineering Complex",
        "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80",
        "WhatsApp",
        "+254712345678"
    ),
    (
        seller_id,
        "Hisense 45L Dorm Mini-Fridge",
        "Compact energy-efficient dormitory refrigerator with working freezer compartment. Whisper-quiet compressor, perfect for hostel rooms.",
        6500,
        "Dorm Essentials",
        "Gently Used",
        "Hall 4 Hostels",
        "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80",
        "WhatsApp",
        "+254712345678"
    ),
    (
        seller_id,
        "Sony WH-1000XM4 Noise-Cancelling Headphones",
        "Active noise cancelling wireless headphones. 30 hours battery life. Includes audio cable and carrying case for quiet library study.",
        11000,
        "Electronics",
        "Like New",
        "Postgraduate Wing",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        "Phone",
        "+254712345678"
    ),
    (
        seller_id,
        "Campus Fleece Varsity Hoodie (Navy, Size L)",
        "Heavyweight official university fleece sweater. Only worn twice, washed and clean. Great for chilly early-morning lecture halls.",
        1200,
        "Clothing",
        "Like New",
        "Student Center",
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
        "WhatsApp",
        "+254712345678"
    ),
    (
        seller_id,
        "Heavy-Duty Campus Mountain Bike with U-Lock",
        "Shimano 21-speed gear system, rear luggage rack, puncture-resistant tyres. Includes heavy combination steel U-lock and helmet.",
        8500,
        "Other",
        "Fair",
        "Sports Pavilion",
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
        "Phone",
        "+254712345678"
    ),
    (
        seller_id,
        "Adjustable LED Study Desk Lamp with USB Port",
        "Touch-sensitive brightness controls with 3 color temperatures (warm, natural, cool white). Built-in USB phone charging port.",
        950,
        "Dorm Essentials",
        "Like New",
        "Hall 4 Hostels",
        "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=800&q=80",
        "WhatsApp",
        "+254712345678"
    )
]

for item in sample_items:
    cur.execute("""
        INSERT INTO public.items (user_id, title, description, price, category, condition, campus_location, image_url, contact_method, contact_value)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """, item)

print(f"Successfully inserted {len(sample_items)} real listings into Supabase!")
cur.execute("SELECT COUNT(*) FROM public.items;")
print("Total real listings in Supabase:", cur.fetchone()[0])
conn.close()
