-- ============================================================
-- Beanie Cafe — Product image URLs
-- Run this AFTER 001_initial_schema.sql + seed.sql
-- Source: Unsplash (https://unsplash.com/license — free to use)
-- ============================================================

-- ── Coffee ───────────────────────────────────────────────────

update products set image_url =
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
  where name = 'Espresso';

update products set image_url =
  'https://images.unsplash.com/photo-1532012197267-da0b279b8d2e?auto=format&fit=crop&w=800&q=80'
  where name = 'Americano';

update products set image_url =
  'https://images.unsplash.com/photo-1572286258217-215cf8e3c65b?auto=format&fit=crop&w=800&q=80'
  where name = 'Cappuccino';

update products set image_url =
  'https://images.unsplash.com/photo-1447933601-adfccc7cf0d0?auto=format&fit=crop&w=800&q=80'
  where name = 'Caffè Latte';

update products set image_url =
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80'
  where name = 'Flat White';

update products set image_url =
  'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?auto=format&fit=crop&w=800&q=80'
  where name = 'Mocha';

update products set image_url =
  'https://images.unsplash.com/photo-1542181961-9590d0c79dab?auto=format&fit=crop&w=800&q=80'
  where name = 'Macchiato';

-- ── Tea ──────────────────────────────────────────────────────

update products set image_url =
  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80'
  where name = 'English Breakfast';

update products set image_url =
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80'
  where name = 'Earl Grey';

update products set image_url =
  'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=800&q=80'
  where name = 'Rooibos Latte';

update products set image_url =
  'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=800&q=80'
  where name = 'Matcha Latte';

update products set image_url =
  'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&w=800&q=80'
  where name = 'Chai Latte';

-- ── Cold Drinks ───────────────────────────────────────────────

update products set image_url =
  'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80'
  where name = 'Iced Latte';

update products set image_url =
  'https://images.unsplash.com/photo-1514315384763-ba401779410f?auto=format&fit=crop&w=800&q=80'
  where name = 'Iced Mocha';

update products set image_url =
  'https://images.unsplash.com/photo-1546100769-aa84963dbb51?auto=format&fit=crop&w=800&q=80'
  where name = 'Cold Brew';

update products set image_url =
  'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80'
  where name = 'Fresh Lemonade';

update products set image_url =
  'https://images.unsplash.com/photo-1553530666-ba11a90a0868?auto=format&fit=crop&w=800&q=80'
  where name = 'Berry Smoothie';

-- ── Pastries ─────────────────────────────────────────────────

update products set image_url =
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80'
  where name = 'Butter Croissant';

update products set image_url =
  'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=800&q=80'
  where name = 'Almond Croissant';

update products set image_url =
  'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=800&q=80'
  where name = 'Blueberry Muffin';

update products set image_url =
  'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?auto=format&fit=crop&w=800&q=80'
  where name = 'Banana Bread';

update products set image_url =
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=80'
  where name = 'Cinnamon Scone';

-- ── Breakfast ────────────────────────────────────────────────

update products set image_url =
  'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?auto=format&fit=crop&w=800&q=80'
  where name = 'Avo Toast';

update products set image_url =
  'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80'
  where name = 'Eggs Benedict';

update products set image_url =
  'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=800&q=80'
  where name = 'Granola Bowl';

update products set image_url =
  'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=800&q=80'
  where name = 'Toast & Preserves';
