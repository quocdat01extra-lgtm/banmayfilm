import pg from 'pg';
import { env } from './config/env.js';
import { supabase } from './config/supabase.js';

const { Client } = pg;

const schemaSql = `
-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_order INT DEFAULT 0
);

-- 2. Create banners table
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    specifications TEXT NOT NULL DEFAULT '',
    price BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create product_media table
CREATE TABLE IF NOT EXISTS public.product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(50) NOT NULL DEFAULT 'image', -- 'image' or 'video'
    display_order INT DEFAULT 0
);

-- 5. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    delivery_method VARCHAR(100) NOT NULL,
    address TEXT,
    pickup_datetime TIMESTAMP,
    payment_method VARCHAR(100) NOT NULL,
    note TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_price BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function runSeed() {
  console.log('Starting DB migration and seed...');

  // Initialize DB Tables using Direct connection
  const client = new Client({
    connectionString: env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database directly. Creating tables...');
    await client.query(schemaSql);
    console.log('Tables verified/created successfully.');

    // Seed default categories
    const defaultCategories = ['Máy ảnh', 'Pin', 'Film'];
    for (let i = 0; i < defaultCategories.length; i++) {
      const cat = defaultCategories[i];
      const res = await client.query('SELECT id FROM public.categories WHERE name = $1', [cat]);
      if (res.rows.length === 0) {
        console.log(`Seeding category: ${cat}`);
        await client.query(
          'INSERT INTO public.categories (name, display_order) VALUES ($1, $2)',
          [cat, i]
        );
      }
    }
    console.log('Categories seeded.');
  } catch (err: any) {
    console.error('Error during PostgreSQL migration:', err.message);
    console.log('Falling back: If tables already exist or if local, you might skip PG DDL.');
  } finally {
    await client.end();
  }

  // Create Storage Buckets using Supabase JS client
  try {
    console.log('Checking Supabase Storage buckets...');
    const { data: buckets, error: getBucketsError } = await supabase.storage.listBuckets();
    if (getBucketsError) {
      throw getBucketsError;
    }

    const bucketNames = buckets.map(b => b.name);

    if (!bucketNames.includes('banners')) {
      console.log('Creating "banners" storage bucket...');
      const { error } = await supabase.storage.createBucket('banners', { public: true });
      if (error) console.error('Error creating banners bucket:', error.message);
    } else {
      console.log('"banners" storage bucket already exists.');
    }

    if (!bucketNames.includes('products')) {
      console.log('Creating "products" storage bucket...');
      const { error } = await supabase.storage.createBucket('products', { public: true });
      if (error) console.error('Error creating products bucket:', error.message);
    } else {
      console.log('"products" storage bucket already exists.');
    }

    console.log('Supabase Storage setup complete.');
  } catch (err: any) {
    console.error('Error during storage buckets setup:', err.message);
  }

  console.log('Migration and seeding process finished.');
}

runSeed().catch(err => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
