#!/usr/bin/env node

/**
 * Simple script to help set up .env file
 * Run: node setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('\n🚀 PostgreSQL Database Setup Helper\n');
  console.log('This will help you create your .env file.\n');

  // Database type
  const dbType = await question('Are you using (1) Local PostgreSQL or (2) Cloud (Supabase/Railway/Neon)? [1/2]: ');
  
  let databaseUrl = '';

  if (dbType === '1') {
    console.log('\n📦 Local PostgreSQL Setup\n');
    const username = await question('PostgreSQL username [postgres]: ') || 'postgres';
    const password = await question('PostgreSQL password: ');
    const host = await question('Host [localhost]: ') || 'localhost';
    const port = await question('Port [5432]: ') || '5432';
    const database = await question('Database name [ecommerce_db]: ') || 'ecommerce_db';
    
    databaseUrl = `postgresql://${username}:${password}@${host}:${port}/${database}?schema=public`;
  } else {
    console.log('\n☁️  Cloud PostgreSQL Setup\n');
    console.log('Please get your connection string from your cloud provider:');
    console.log('- Supabase: Project Settings → Database → Connection string');
    console.log('- Railway: PostgreSQL service → Variables → DATABASE_URL');
    console.log('- Neon: Project Dashboard → Connection Details\n');
    
    const connectionString = await question('Paste your full DATABASE_URL here: ');
    databaseUrl = connectionString;
  }

  // Cloudinary setup
  console.log('\n☁️  Cloudinary Setup\n');
  console.log('Get your credentials from: https://console.cloudinary.com/settings/api-keys\n');
  const cloudName = await question('Cloudinary Cloud Name: ');
  const apiKey = await question('Cloudinary API Key: ');
  const apiSecret = await question('Cloudinary API Secret: ');

  // Create .env content
  const envContent = `# PostgreSQL Database
DATABASE_URL="${databaseUrl}"

# Cloudinary (Server-side)
CLOUDINARY_CLOUD_NAME=${cloudName}
CLOUDINARY_API_KEY=${apiKey}
CLOUDINARY_API_SECRET=${apiSecret}

# Cloudinary (Client-side - Safe to expose)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${cloudName}

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
`;

  // Write .env file
  const envPath = path.join(process.cwd(), '.env');
  
  if (fs.existsSync(envPath)) {
    const overwrite = await question('\n⚠️  .env file already exists. Overwrite? [y/N]: ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Cancelled. Your .env file was not modified.');
      rl.close();
      return;
    }
  }

  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ .env file created successfully!\n');
  console.log('Next steps:');
  console.log('1. Run: npx prisma generate');
  console.log('2. Run: npx prisma db push');
  console.log('3. Test connection: npm run dev (then visit http://localhost:3000/api/test-db)\n');

  rl.close();
}

setup().catch(console.error);

