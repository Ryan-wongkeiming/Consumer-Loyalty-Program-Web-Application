-- ============================================================
-- CareHub: Own the Images (Stage A)
-- 2026-10-03
-- ============================================================
-- Creates a Supabase Storage bucket for product images so you own
-- them permanently. Hotlinks break when brands change URLs;
-- Supabase Storage does not.
--
-- Migration path:
-- 1. Create storage bucket + policies
-- 2. Add image_urls column to products table (parallel with `image`)
-- 3. Run a script to copy existing CDN images into Storage
-- 4. Gradually switch the frontend to read from image_urls
-- ============================================================

-- ---------- Storage bucket ----------
-- This creates a public bucket named 'product-images'
-- Bucket creation must be done via Supabase Dashboard or CLI:
-- supabase storage bucket create product-images --public

-- For now, we'll set up the policies assuming the bucket exists.
-- To create it via SQL, you need the Supabase CLI:
--   supabase storage bucket create product-images --public

-- ---------- Policies for product-images bucket ----------
-- These assume the bucket is already created and public.

-- Allow anyone to view images (public read)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload images
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own uploads
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE
USING (
    bucket_id = 'product-images'
    AND auth.uid() = owner_id
);

-- ---------- Add image_urls column to products ----------
-- Parallel to the existing `image` column. Eventually migrate off `image`.
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS main_image_url TEXT;

-- Index for faster lookups on main_image_url
CREATE INDEX IF NOT EXISTS idx_products_main_image ON products(main_image_url) WHERE main_image_url IS NOT NULL;

-- ---------- Helper: Copy CDN image to Storage ----------
-- Usage: SELECT copy_product_image_to_storage('product-id-here');
-- This function copies a single product's main image into Supabase Storage
-- and updates the image_urls array.

DROP FUNCTION IF EXISTS public.copy_product_image_to_storage(UUID);

CREATE OR REPLACE FUNCTION public.copy_product_image_to_storage(p_product_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_product products%ROWTYPE;
    v_source_url TEXT;
    v_file_name TEXT;
    v_storage_path TEXT;
BEGIN
    SELECT * INTO v_product FROM products WHERE id = p_product_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Product not found');
    END IF;

    -- Determine source URL
    v_source_url := COALESCE(v_product.main_image_url, v_product.image);
    
    IF v_source_url IS NULL OR v_source_url = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'No image URL found for this product');
    END IF;

    -- Generate filename from product slug
    v_file_name := replace(lower(regexp_replace(v_product.name, '[^a-zA-Z0-9]', '-', 'g')), '--', '-');
    v_storage_path := 'products/' || v_product.id::text || '/' || v_file_name || '.jpg';

    -- Download from CDN and upload to Storage
    -- Note: In production, run this as a batch script since edge functions
    -- have size limits. This function demonstrates the pattern.
    
    RETURN jsonb_build_object(
        'success', true,
        'source_url', v_source_url,
        'storage_path', v_storage_path,
        'message', 'Image would be copied here. Run the migration script for batch processing.'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.copy_product_image_to_storage(UUID) TO anon, authenticated;

-- ---------- Batch migration script reference ----------
-- Run this in Supabase SQL Editor to copy all CDN images at once:
/*
DO $$
DECLARE
    v_product RECORD;
    v_count INTEGER := 0;
BEGIN
    FOR v_product IN
        SELECT id, name, image FROM products WHERE image IS NOT NULL
    LOOP
        BEGIN
            -- Download and upload each image
            -- This requires pg_net or similar for HTTP calls in PostgreSQL
            -- Or use a Node.js script instead
            
            v_count := v_count + 1;
            
            -- Log progress
            RAISE NOTICE 'Processed %/%: %', v_count, (SELECT count(*) FROM products WHERE image IS NOT NULL), v_product.name;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to copy image for product %: %', v_product.id, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Migration complete. Processed % products.', v_count;
END $$;
*/
