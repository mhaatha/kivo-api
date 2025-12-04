import 'dotenv/config';
import mongoose from 'mongoose';
import { Chat, Message } from '../app/models/chat.model.js';
import { BmcPost } from '../app/models/bmc.model.js';

async function initCollections() {
  const mongoUri = process.env.MONGODB_URI;
  
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log(`✅ Connected to database: ${mongoose.connection.name}`);

  // Get existing collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);
  console.log('\n📋 Existing collections:', collectionNames);

  // Create collections if they don't exist
  const requiredCollections = [
    { name: 'chats', model: Chat },
    { name: 'messages', model: Message },
    { name: 'bmcposts', model: BmcPost }
  ];

  for (const { name, model } of requiredCollections) {
    if (!collectionNames.includes(name)) {
      console.log(`\n📦 Creating collection: ${name}`);
      await mongoose.connection.db.createCollection(name);
      
      // Create indexes
      await model.createIndexes();
      console.log(`   ✅ Collection '${name}' created with indexes`);
    } else {
      console.log(`\n✅ Collection '${name}' already exists`);
      // Ensure indexes are created
      await model.createIndexes();
      console.log(`   📇 Indexes synchronized`);
    }
  }

  // Show final state
  const finalCollections = await mongoose.connection.db.listCollections().toArray();
  console.log('\n🎉 Final collections:', finalCollections.map(c => c.name));

  // Show collection stats
  console.log('\n📊 Collection Statistics:');
  for (const col of finalCollections) {
    const count = await mongoose.connection.db.collection(col.name).countDocuments();
    console.log(`   ${col.name}: ${count} documents`);
  }

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected from MongoDB');
}

initCollections().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
