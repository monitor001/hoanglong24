const { seedPermissionMatrix } = require('./src/utils/seedPermissionMatrix');

async function main() {
  try {
    console.log('🌱 Starting permission matrix seeding...');
    const result = await seedPermissionMatrix();
    console.log('✅ Seeding completed:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
