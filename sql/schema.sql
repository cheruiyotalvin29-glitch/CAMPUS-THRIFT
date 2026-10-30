-- ============================================================================
-- CAMPUS ONLINE THRIFT MARKET - COMPLETE DATABASE INITIALIZATION SCRIPT
-- PostgreSQL DDL for Supabase BaaS (Production-Grade, Strict Schema)
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create User Profiles Table (Extends Supabase Auth Schema)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL DEFAULT '',
    campus_location TEXT DEFAULT 'Main Campus',
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Items Table for Marketplace Listings
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL CHECK (category IN ('Textbooks', 'Electronics', 'Clothing', 'Dorm Essentials', 'Other')),
    condition TEXT DEFAULT 'Gently Used' CHECK (condition IN ('Brand New', 'Like New', 'Gently Used', 'Fair')),
    campus_location TEXT DEFAULT 'Main Campus',
    image_url TEXT,
    contact_method TEXT NOT NULL CHECK (contact_method IN ('WhatsApp', 'Phone')),
    contact_value TEXT NOT NULL, -- Target phone number or WhatsApp number
    is_sold BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) on All Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies for `profiles`
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Allow public read access to seller profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Allow authenticated users to insert their own profile record
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to modify only their own profile record
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 6. Row Level Security Policies for `items`
DROP POLICY IF EXISTS "Items are viewable by everyone" ON public.items;
DROP POLICY IF EXISTS "Authenticated users can create items" ON public.items;
DROP POLICY IF EXISTS "Users can update their own items" ON public.items;
DROP POLICY IF EXISTS "Users can delete their own items" ON public.items;

-- Allow open public read access to all posted marketplace listings
CREATE POLICY "Items are viewable by everyone" 
ON public.items FOR SELECT 
USING (true);

-- Allow logged-in students to create new listings tied strictly to their auth ID
CREATE POLICY "Authenticated users can create items" 
ON public.items FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated' 
    AND auth.uid() = user_id
);

-- Allow sellers to modify only their own active listings
CREATE POLICY "Users can update their own items" 
ON public.items FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow sellers to delete only their own listings
CREATE POLICY "Users can delete their own items" 
ON public.items FOR DELETE 
USING (auth.uid() = user_id);

-- 7. Configure Supabase Storage Bucket for Uploaded Item Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public access to item images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload item images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own uploaded images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploaded images" ON storage.objects;

-- Allow public read access to images stored in the 'item-images' bucket
CREATE POLICY "Public access to item images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'item-images');

-- Allow authenticated users to upload images into 'item-images'
CREATE POLICY "Authenticated users can upload item images" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'item-images' 
    AND auth.role() = 'authenticated'
);

-- Allow image owners to update their uploaded images
CREATE POLICY "Users can update their own uploaded images" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'item-images' 
    AND auth.uid() = owner
);

-- Allow image owners to delete their uploaded images
CREATE POLICY "Users can delete their own uploaded images" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'item-images' 
    AND auth.uid() = owner
);

-- 8. Automated Trigger: Automatically Create Profile on User Sign Up (Security Definer)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone_number, campus_location)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'phone_number', ''),
        COALESCE(new.raw_user_meta_data->>'campus_location', 'Main Campus')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        phone_number = COALESCE(EXCLUDED.phone_number, public.profiles.phone_number),
        campus_location = COALESCE(EXCLUDED.campus_location, public.profiles.campus_location);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Automated Trigger: Instant Email Confirmation (No Confirmation Required!)
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

-- 10. Update existing unconfirmed users and apply schema migrations for existing tables
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- Safe migration for existing tables:
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS campus_location TEXT DEFAULT 'Main Campus';
UPDATE public.items SET contact_method = 'WhatsApp' WHERE contact_method = 'Email';
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_contact_method_check;
ALTER TABLE public.items ADD CONSTRAINT items_contact_method_check 
    CHECK (contact_method IN ('WhatsApp', 'Phone'));

-- 11. RPC Helper: Check If Email Already Exists (Prevents Duplicate Sign-Ups)
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
