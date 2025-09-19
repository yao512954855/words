import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { customers } from '../../lib/placeholder-data';
import { NextResponse } from 'next/server';

const sql = postgres(process.env.POSTGRES_URL!);

async function seedUsers(name:string) {

    return await sql`SELECT * FROM customers WHERE name = ${name}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json(
        { error: 'Missing name parameter' },
        { status: 400 }
      );
    }

    const result = await sql.begin((sql) => [
        seedUsers(name),
    ]);

    return Response.json({ message: result }, { status: 200 });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
