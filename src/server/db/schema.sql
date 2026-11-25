-- ============================================================
-- NEYİN NESİ - POSTGRESQL VERİTABANI MİMARİSİ (ENTERPRISE ŞEMA)
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    brand VARCHAR(150) NOT NULL,
    brand_slug VARCHAR(150) NOT NULL,
    model VARCHAR(255) NOT NULL,
    full_name TEXT NOT NULL,
    category_slug VARCHAR(100) NOT NULL,
    category_name VARCHAR(150) NOT NULL,
    release_year INT DEFAULT 2024,
    release_date VARCHAR(50),
    hero_image TEXT NOT NULL,
    identity_summary TEXT,
    target_audience TEXT,
    current_best_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    overall_trust_score INT DEFAULT 95,
    data_sources_count INT DEFAULT 1,
    barcode VARCHAR(100),
    market_region VARCHAR(255) DEFAULT 'TR',
    market_name VARCHAR(255) DEFAULT 'Türkiye Pazarı (Resmi TR)',
    keyboard_layout VARCHAR(100),
    plug_type VARCHAR(100),
    warranty_badge VARCHAR(255),
    audit_status VARCHAR(50) DEFAULT 'review',
    audit_notes TEXT,
    official_links JSONB,
    data_sources JSONB,
    view_count INT DEFAULT 0,
    compare_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_offers (
    id VARCHAR(120) PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_name VARCHAR(150) NOT NULL,
    seller_rating NUMERIC(3, 1) DEFAULT 4.8,
    price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'TL',
    in_stock BOOLEAN DEFAULT TRUE,
    url TEXT NOT NULL,
    verified_source TEXT,
    last_updated VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    UNIQUE(product_id, recorded_date)
);

CREATE TABLE IF NOT EXISTS spec_groups (
    id VARCHAR(120) PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS spec_items (
    id VARCHAR(150) PRIMARY KEY,
    spec_group_id VARCHAR(120) NOT NULL REFERENCES spec_groups(id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    label VARCHAR(200) NOT NULL,
    value TEXT NOT NULL,
    numeric_value NUMERIC(12, 2),
    unit VARCHAR(100),
    is_key_highlight BOOLEAN DEFAULT FALSE,
    verification_level VARCHAR(100) DEFAULT 'authorized_distributor',
    verification_source TEXT,
    verified_at VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS product_gallery (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS price_drop_alerts (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_name VARCHAR(150) NOT NULL,
    previous_price NUMERIC(12, 2) NOT NULL,
    current_price NUMERIC(12, 2) NOT NULL,
    drop_amount NUMERIC(12, 2) NOT NULL,
    drop_percentage INT NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hızlı Sorgulama ve Eşleştirme İndeksleri
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_slug);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(current_best_price);
CREATE INDEX IF NOT EXISTS idx_offers_product ON price_offers(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_seller ON price_offers(seller_name);
CREATE INDEX IF NOT EXISTS idx_history_product ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_specs_product ON spec_items(product_id);
CREATE INDEX IF NOT EXISTS idx_gallery_product ON product_gallery(product_id);
CREATE INDEX IF NOT EXISTS idx_alerts_product ON price_drop_alerts(product_id);
