import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!);

async function seedWordFavorites() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create the "word_favorites" table if it doesn't exist
    const createTable = await sql`
      CREATE TABLE IF NOT EXISTS word_favorites (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        word_id UUID NOT NULL,
        word_text VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, word_id)
      );
    `;

    console.log(`Created "word_favorites" table`);

    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_word_favorites_user_id ON word_favorites(user_id);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_word_favorites_word_id ON word_favorites(word_id);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_word_favorites_created_at ON word_favorites(created_at);
    `;

    console.log(`Created indexes for "word_favorites" table`);

    return {
      createTable,
    };
  } catch (error) {
    console.error('Error seeding word favorites:', error);
    throw error;
  }
}

export async function GET() {
  try {
    await seedWordFavorites();
    return Response.json({ message: 'Word favorites table created successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}