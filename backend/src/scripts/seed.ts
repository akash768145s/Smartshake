import { db } from '../config/firebase';

const FLAVOURS = [
  { name: 'Chocolate', icon: '🍫', price_per_scoop: 99, available: true },
  { name: 'Vanilla', icon: '🍦', price_per_scoop: 99, available: true },
  { name: 'Strawberry', icon: '🍓', price_per_scoop: 99, available: true },
  { name: 'Banana', icon: '🍌', price_per_scoop: 99, available: true },
  { name: 'Coffee', icon: '☕', price_per_scoop: 99, available: true },
];

const LOCATIONS = [
  "Gold's Gym - Bandra",
  "Talwalkar's - Andheri",
  "Snap Fitness - Powai",
  "Cult Fit - Lower Parel",
  "The Gym - Worli",
  "Fitness First - Juhu",
];

async function seedFlavours() {
  console.log('Seeding flavours...');
  const batch = db.batch();
  
  for (const flavour of FLAVOURS) {
    const existingFlavours = await db
      .collection('flavours')
      .where('name', '==', flavour.name)
      .get();
    
    if (existingFlavours.empty) {
      const ref = db.collection('flavours').doc();
      batch.set(ref, {
        ...flavour,
        created_at: new Date(),
      });
      console.log(`  Adding flavour: ${flavour.name}`);
    } else {
      console.log(`  Flavour already exists: ${flavour.name}`);
    }
  }
  
  await batch.commit();
  console.log('✓ Flavours seeded\n');
}

async function seedMachines() {
  console.log('Seeding machines...');
  const batch = db.batch();
  
  for (let i = 0; i < 12; i++) {
    const location = LOCATIONS[i % LOCATIONS.length];
    const machineNum = Math.floor(i / LOCATIONS.length) + 1;
    const name = `SV-${location.split(' ')[0].substring(0, 3).toUpperCase()}-${machineNum}`;
    
    const existingMachines = await db
      .collection('machines')
      .where('name', '==', name)
      .get();
    
    if (existingMachines.empty) {
      const ref = db.collection('machines').doc();
      batch.set(ref, {
        name,
        location,
        status: 'online',
        uptime7d: 98 + Math.random() * 2,
        dispenses24h: Math.floor(Math.random() * 100) + 50,
        milkLevel: 30 + Math.random() * 70,
        waterLevel: 40 + Math.random() * 60,
        powderLevels: {
          Chocolate: 30 + Math.random() * 70,
          Vanilla: 20 + Math.random() * 80,
          Strawberry: 25 + Math.random() * 75,
          Banana: 35 + Math.random() * 65,
          Coffee: 40 + Math.random() * 60,
        },
        lastClean: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000),
        lastPing: new Date(),
        revenue24h: Math.floor(Math.random() * 5000) + 2000,
      });
      console.log(`  Adding machine: ${name}`);
    } else {
      console.log(`  Machine already exists: ${name}`);
    }
  }
  
  await batch.commit();
  console.log('✓ Machines seeded\n');
}

async function main() {
  try {
    await seedFlavours();
    await seedMachines();
    console.log('✅ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();

