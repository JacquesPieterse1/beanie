-- ============================================================
-- Beanie Cafe — Seed Data
-- Run this AFTER 001_initial_schema.sql
-- ============================================================

do $$
declare
  -- Category IDs
  v_cat_coffee    uuid;
  v_cat_tea       uuid;
  v_cat_cold      uuid;
  v_cat_pastry    uuid;
  v_cat_breakfast uuid;

  -- Modifier IDs
  v_mod_size   uuid;
  v_mod_milk   uuid;
  v_mod_extras uuid;
  v_mod_warm   uuid;

  -- Product IDs
  v_espresso    uuid;
  v_americano   uuid;
  v_cappuccino  uuid;
  v_latte       uuid;
  v_flatwhite   uuid;
  v_mocha       uuid;
  v_macchiato   uuid;
  v_english     uuid;
  v_earl_grey   uuid;
  v_rooibos     uuid;
  v_matcha      uuid;
  v_chai        uuid;
  v_iced_latte  uuid;
  v_iced_mocha  uuid;
  v_cold_brew   uuid;
  v_lemonade    uuid;
  v_smoothie    uuid;
  v_croissant   uuid;
  v_almond_cr   uuid;
  v_muffin      uuid;
  v_banana      uuid;
  v_scone       uuid;
  v_avo_toast   uuid;
  v_eggs_benny  uuid;
  v_granola     uuid;
  v_toast       uuid;

begin

-- ── Categories ──────────────────────────────────────────────

insert into categories (name, display_order) values ('Coffee',      1) returning id into v_cat_coffee;
insert into categories (name, display_order) values ('Tea',         2) returning id into v_cat_tea;
insert into categories (name, display_order) values ('Cold Drinks', 3) returning id into v_cat_cold;
insert into categories (name, display_order) values ('Pastries',    4) returning id into v_cat_pastry;
insert into categories (name, display_order) values ('Breakfast',   5) returning id into v_cat_breakfast;

-- ── Modifiers ───────────────────────────────────────────────

-- Size (radio, required)
insert into modifiers (name, type, is_required) values ('Size', 'radio', true) returning id into v_mod_size;
insert into modifier_options (modifier_id, label, price_adjustment) values
  (v_mod_size, 'Small',   0),
  (v_mod_size, 'Medium',  5.00),
  (v_mod_size, 'Large',  10.00);

-- Milk (radio, required)
insert into modifiers (name, type, is_required) values ('Milk', 'radio', true) returning id into v_mod_milk;
insert into modifier_options (modifier_id, label, price_adjustment) values
  (v_mod_milk, 'Full Cream',  0),
  (v_mod_milk, 'Skim',        0),
  (v_mod_milk, 'Oat',         6.00),
  (v_mod_milk, 'Almond',      6.00);

-- Extras (checkbox, optional)
insert into modifiers (name, type, is_required) values ('Extras', 'checkbox', false) returning id into v_mod_extras;
insert into modifier_options (modifier_id, label, price_adjustment) values
  (v_mod_extras, 'Extra Shot',      8.00),
  (v_mod_extras, 'Vanilla Syrup',   5.00),
  (v_mod_extras, 'Caramel Drizzle', 5.00),
  (v_mod_extras, 'Whipped Cream',   4.00);

-- Warming (radio, optional — for pastries)
insert into modifiers (name, type, is_required) values ('Warming', 'radio', false) returning id into v_mod_warm;
insert into modifier_options (modifier_id, label, price_adjustment) values
  (v_mod_warm, 'As Is',   0),
  (v_mod_warm, 'Warmed',  0);

-- ── Products — Coffee ───────────────────────────────────────

insert into products (name, description, price, category_id, is_available) values
  ('Espresso', 'A bold, concentrated shot of pure coffee.', 28.00, v_cat_coffee, true) returning id into v_espresso;
insert into products (name, description, price, category_id, is_available) values
  ('Americano', 'Espresso diluted with hot water for a smooth, long black.', 32.00, v_cat_coffee, true) returning id into v_americano;
insert into products (name, description, price, category_id, is_available) values
  ('Cappuccino', 'Equal parts espresso, steamed milk, and velvety foam.', 38.00, v_cat_coffee, true) returning id into v_cappuccino;
insert into products (name, description, price, category_id, is_available) values
  ('Caffè Latte', 'Smooth espresso with steamed milk and a thin layer of foam.', 40.00, v_cat_coffee, true) returning id into v_latte;
insert into products (name, description, price, category_id, is_available) values
  ('Flat White', 'Rich espresso with micro-foamed milk, silky and strong.', 40.00, v_cat_coffee, true) returning id into v_flatwhite;
insert into products (name, description, price, category_id, is_available) values
  ('Mocha', 'Espresso meets chocolate and steamed milk — indulgent.', 45.00, v_cat_coffee, true) returning id into v_mocha;
insert into products (name, description, price, category_id, is_available) values
  ('Macchiato', 'Espresso "stained" with a dash of foamed milk.', 30.00, v_cat_coffee, true) returning id into v_macchiato;

-- ── Products — Tea ──────────────────────────────────────────

insert into products (name, description, price, category_id, is_available) values
  ('English Breakfast', 'A robust, full-bodied black tea.', 25.00, v_cat_tea, true) returning id into v_english;
insert into products (name, description, price, category_id, is_available) values
  ('Earl Grey', 'Black tea perfumed with bergamot oil.', 25.00, v_cat_tea, true) returning id into v_earl_grey;
insert into products (name, description, price, category_id, is_available) values
  ('Rooibos Latte', 'South African rooibos steamed with your choice of milk.', 32.00, v_cat_tea, true) returning id into v_rooibos;
insert into products (name, description, price, category_id, is_available) values
  ('Matcha Latte', 'Ceremonial-grade matcha whisked with steamed milk.', 42.00, v_cat_tea, true) returning id into v_matcha;
insert into products (name, description, price, category_id, is_available) values
  ('Chai Latte', 'Spiced black tea blended with steamed milk.', 38.00, v_cat_tea, true) returning id into v_chai;

-- ── Products — Cold Drinks ──────────────────────────────────

insert into products (name, description, price, category_id, is_available) values
  ('Iced Latte', 'Chilled espresso over ice with cold milk.', 42.00, v_cat_cold, true) returning id into v_iced_latte;
insert into products (name, description, price, category_id, is_available) values
  ('Iced Mocha', 'Chocolate, espresso, and cold milk over ice.', 48.00, v_cat_cold, true) returning id into v_iced_mocha;
insert into products (name, description, price, category_id, is_available) values
  ('Cold Brew', '18-hour steeped cold brew, smooth and mellow.', 38.00, v_cat_cold, true) returning id into v_cold_brew;
insert into products (name, description, price, category_id, is_available) values
  ('Fresh Lemonade', 'Freshly squeezed lemons with a touch of honey.', 30.00, v_cat_cold, true) returning id into v_lemonade;
insert into products (name, description, price, category_id, is_available) values
  ('Berry Smoothie', 'Mixed berries, banana, yoghurt, and honey.', 45.00, v_cat_cold, false) returning id into v_smoothie;

-- ── Products — Pastries ─────────────────────────────────────

insert into products (name, description, price, category_id, is_available) values
  ('Butter Croissant', 'Flaky, golden, and buttery. Baked fresh daily.', 28.00, v_cat_pastry, true) returning id into v_croissant;
insert into products (name, description, price, category_id, is_available) values
  ('Almond Croissant', 'Filled with frangipane and topped with toasted almonds.', 35.00, v_cat_pastry, true) returning id into v_almond_cr;
insert into products (name, description, price, category_id, is_available) values
  ('Blueberry Muffin', 'Loaded with blueberries and finished with a crumble top.', 30.00, v_cat_pastry, true) returning id into v_muffin;
insert into products (name, description, price, category_id, is_available) values
  ('Banana Bread', 'Moist and nutty, made with ripe bananas and walnuts.', 32.00, v_cat_pastry, true) returning id into v_banana;
insert into products (name, description, price, category_id, is_available) values
  ('Cinnamon Scone', 'Warm spiced scone served with butter and jam.', 28.00, v_cat_pastry, true) returning id into v_scone;

-- ── Products — Breakfast ────────────────────────────────────

insert into products (name, description, price, category_id, is_available) values
  ('Avo Toast', 'Smashed avo on sourdough with chilli flakes and feta.', 55.00, v_cat_breakfast, true) returning id into v_avo_toast;
insert into products (name, description, price, category_id, is_available) values
  ('Eggs Benedict', 'Poached eggs, hollandaise, and bacon on an English muffin.', 65.00, v_cat_breakfast, true) returning id into v_eggs_benny;
insert into products (name, description, price, category_id, is_available) values
  ('Granola Bowl', 'House granola with Greek yoghurt, honey, and seasonal fruit.', 48.00, v_cat_breakfast, true) returning id into v_granola;
insert into products (name, description, price, category_id, is_available) values
  ('Toast & Preserves', 'Thick-cut sourdough with butter and a selection of jams.', 25.00, v_cat_breakfast, true) returning id into v_toast;

-- ── Product ↔ Modifier Links ───────────────────────────────

-- Coffee: size + milk + extras
insert into product_modifiers (product_id, modifier_id) values
  (v_espresso,   v_mod_size),
  (v_americano,  v_mod_size),
  (v_cappuccino, v_mod_size),
  (v_cappuccino, v_mod_milk),
  (v_cappuccino, v_mod_extras),
  (v_latte,      v_mod_size),
  (v_latte,      v_mod_milk),
  (v_latte,      v_mod_extras),
  (v_flatwhite,  v_mod_size),
  (v_flatwhite,  v_mod_milk),
  (v_flatwhite,  v_mod_extras),
  (v_mocha,      v_mod_size),
  (v_mocha,      v_mod_milk),
  (v_mocha,      v_mod_extras),
  (v_macchiato,  v_mod_size),
  (v_macchiato,  v_mod_milk);

-- Tea: size + milk where applicable
insert into product_modifiers (product_id, modifier_id) values
  (v_english,   v_mod_size),
  (v_earl_grey, v_mod_size),
  (v_rooibos,   v_mod_size),
  (v_rooibos,   v_mod_milk),
  (v_matcha,    v_mod_size),
  (v_matcha,    v_mod_milk),
  (v_chai,      v_mod_size),
  (v_chai,      v_mod_milk),
  (v_chai,      v_mod_extras);

-- Cold drinks: size + milk
insert into product_modifiers (product_id, modifier_id) values
  (v_iced_latte, v_mod_size),
  (v_iced_latte, v_mod_milk),
  (v_iced_latte, v_mod_extras),
  (v_iced_mocha, v_mod_size),
  (v_iced_mocha, v_mod_milk),
  (v_cold_brew,  v_mod_size),
  (v_lemonade,   v_mod_size);

-- Pastries: warming
insert into product_modifiers (product_id, modifier_id) values
  (v_croissant, v_mod_warm),
  (v_almond_cr, v_mod_warm),
  (v_muffin,    v_mod_warm),
  (v_banana,    v_mod_warm),
  (v_scone,     v_mod_warm);

end $$;
