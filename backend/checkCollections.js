const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://127.0.0.1:27017/fleetflow';

const EXPECTED = ['users', 'vehicles', 'trips', 'maintenances', 'fuellogs'];

async function checkCollections() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(`\n🔗 Connected to MongoDB: ${MONGO_URI}\n`);

        const collections = await mongoose.connection.db.listCollections().toArray();
        const names = collections.map(c => c.name);

        console.log('📦 Existing collections:');
        if (names.length === 0) {
            console.log('   (none)\n');
        } else {
            names.forEach(n => console.log(`   • ${n}`));
            console.log();
        }

        console.log('🔍 Expected collection check:');
        EXPECTED.forEach(expected => {
            if (names.includes(expected)) {
                console.log(`   ✅ ${expected} collection exists`);
            } else {
                console.log(`   ❌ ${expected} collection missing`);
            }
        });

        console.log();
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Connection closed.\n');
    }
}

checkCollections();
