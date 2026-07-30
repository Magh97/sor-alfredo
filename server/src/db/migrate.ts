import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './index.js';

await migrate(db, { migrationsFolder: './src/db/migrations' });
console.info('Migrations applied');
process.exit(0);
