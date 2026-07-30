import 'dotenv/config';
import bcryptjs from 'bcryptjs';
import { db, schema } from './index.js';

const { restaurants, users, tables, categories, products, modifiers } = schema;

async function seed() {
  const hash = await bcryptjs.hash('password123', 10);

  const [restaurant] = await db.insert(restaurants).values({
    name: 'Restaurante Alfredo',
    address: 'Calle Principal 123',
    phone: '555-1234',
  }).returning();

  if (!restaurant) throw new Error('Failed to create restaurant');

  await db.insert(users).values([
    { restaurantId: restaurant.id, name: 'Administrador', email: 'admin@restaurant.com', passwordHash: hash, role: 'admin' },
    { restaurantId: restaurant.id, name: 'Mesero 1', email: 'mesero1@restaurant.com', passwordHash: hash, role: 'waiter' },
    { restaurantId: restaurant.id, name: 'Cajero 1', email: 'cajero1@restaurant.com', passwordHash: hash, role: 'cashier' },
  ]);

  await db.insert(tables).values(
    Array.from({ length: 10 }, (_, i) => ({
      restaurantId: restaurant.id,
      number: i + 1,
      name: `Mesa ${String(i + 1)}`,
      capacity: i < 2 ? 2 : i < 5 ? 4 : 6,
    })),
  );

  const [catEntradas] = await db.insert(categories).values({ restaurantId: restaurant.id, name: 'Entradas', sortOrder: 1 }).returning();
  const [catPlatos] = await db.insert(categories).values({ restaurantId: restaurant.id, name: 'Platos Fuertes', sortOrder: 2 }).returning();
  const [catPostres] = await db.insert(categories).values({ restaurantId: restaurant.id, name: 'Postres', sortOrder: 3 }).returning();
  const [catBebidas] = await db.insert(categories).values({ restaurantId: restaurant.id, name: 'Bebidas', sortOrder: 4 }).returning();

  await db.insert(products).values([
    { restaurantId: restaurant.id, categoryId: catEntradas?.id ?? null, name: 'Guacamole con totopos', description: 'Guacamole fresco con totopos de maíz', basePrice: '85.0000' },
    { restaurantId: restaurant.id, categoryId: catEntradas?.id ?? null, name: 'Sopa de tortilla', description: 'Sopa tradicional con tiras de tortilla, aguacate y queso', basePrice: '75.0000' },
    { restaurantId: restaurant.id, categoryId: catEntradas?.id ?? null, name: 'Queso fundido con chorizo', description: 'Queso Oaxaca fundido con chorizo y tortillas', basePrice: '110.0000' },
    { restaurantId: restaurant.id, categoryId: catEntradas?.id ?? null, name: 'Ceviche de pescado', description: 'Pescado blanco marinado con limón, cebolla y cilantro', basePrice: '95.0000' },
    { restaurantId: restaurant.id, categoryId: catEntradas?.id ?? null, name: 'Tostadas de tinga', description: 'Tostadas con tinga de pollo, crema y queso fresco', basePrice: '70.0000' },
    { restaurantId: restaurant.id, categoryId: catPlatos?.id ?? null, name: 'Enchiladas verdes', description: 'Enchiladas rellenas de pollo con salsa verde y crema', basePrice: '130.0000' },
    { restaurantId: restaurant.id, categoryId: catPlatos?.id ?? null, name: 'Tacos de arrachera', description: 'Tres tacos de arrachera con cebolla, cilantro y salsa', basePrice: '155.0000' },
    { restaurantId: restaurant.id, categoryId: catPlatos?.id ?? null, name: 'Chiles en nogada', description: 'Chile poblano relleno de picadillo, bañado en nogada', basePrice: '195.0000' },
    { restaurantId: restaurant.id, categoryId: catPlatos?.id ?? null, name: 'Pescado a la Veracruzana', description: 'Filete de pescado con salsa veracruzana, arroz y verduras', basePrice: '165.0000' },
    { restaurantId: restaurant.id, categoryId: catPlatos?.id ?? null, name: 'Mole poblano con pollo', description: 'Pieza de pollo bañada en mole poblano con arroz', basePrice: '145.0000' },
    { restaurantId: restaurant.id, categoryId: catPlatos?.id ?? null, name: 'Hamburguesa Alfredo', description: 'Hamburguesa 200g con queso, tocino, aguacate y papas', basePrice: '140.0000' },
    { restaurantId: restaurant.id, categoryId: catPlatos?.id ?? null, name: 'Pasta Alfredo', description: 'Fettuccine con salsa cremosa Alfredo y pollo a la parrilla', basePrice: '125.0000' },
    { restaurantId: restaurant.id, categoryId: catPostres?.id ?? null, name: 'Flan de caramelo', description: 'Flan casero con caramelo líquido', basePrice: '65.0000' },
    { restaurantId: restaurant.id, categoryId: catPostres?.id ?? null, name: 'Pastel de tres leches', description: 'Pastel esponjoso bañado en tres leches con merengue', basePrice: '80.0000' },
    { restaurantId: restaurant.id, categoryId: catPostres?.id ?? null, name: 'Churros con chocolate', description: 'Churros crujientes con chocolate caliente para mojar', basePrice: '70.0000' },
    { restaurantId: restaurant.id, categoryId: catPostres?.id ?? null, name: 'Jericalla', description: 'Postre típico de Guadalajara, similar a la crema catalana', basePrice: '55.0000' },
    { restaurantId: restaurant.id, categoryId: catBebidas?.id ?? null, name: 'Agua de horchata', description: 'Agua fresca de arroz con canela', basePrice: '35.0000' },
    { restaurantId: restaurant.id, categoryId: catBebidas?.id ?? null, name: 'Agua de jamaica', description: 'Agua fresca de flor de jamaica', basePrice: '35.0000' },
    { restaurantId: restaurant.id, categoryId: catBebidas?.id ?? null, name: 'Limonada mineral', description: 'Limonada con agua mineral y hierbabuena', basePrice: '45.0000' },
    { restaurantId: restaurant.id, categoryId: catBebidas?.id ?? null, name: 'Café de olla', description: 'Café tradicional con canela y piloncillo', basePrice: '40.0000' },
  ]);

  await db.insert(modifiers).values([
    { restaurantId: restaurant.id, name: 'Sin cebolla', priceAdjustment: '0' },
    { restaurantId: restaurant.id, name: 'Extra queso', priceAdjustment: '15.0000' },
    { restaurantId: restaurant.id, name: 'Sin picante', priceAdjustment: '0' },
    { restaurantId: restaurant.id, name: 'Porción extra de tortillas', priceAdjustment: '10.0000' },
    { restaurantId: restaurant.id, name: 'Con aguacate extra', priceAdjustment: '20.0000' },
  ]);

  console.info('Seed completed successfully');
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
