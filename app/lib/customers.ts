'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';

import { signIn, auth } from '@/auth';
import { AuthError } from 'next-auth';

import {
  Customer,
} from '@/app/lib/definitions';
 
const sql = postgres(process.env.POSTGRES_URL!);

 
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });

const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
export async function createInvoice(formData: FormData) {
  const {customerId,amount,status} = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  // Test it out:
//   console.log(rawFormData);
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
 
  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/customers');
}



const FormSchema2 = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
 
const CreateCustomer = FormSchema2.omit({ id: true, date: true });

const UpdateCustomer = FormSchema2.omit({ id: true, date: true });
 
export async function createCustomer(formData: FormData) {
  const {customerId,amount,status} = CreateCustomer.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  // Test it out:
//   console.log(rawFormData);
  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function updateCustomer(id: string, ok:string, searchParams?: string) {
  try {
    // 获取当前用户信息
    const session = await auth();
    const userId = session?.user?.email || 'anonymous';
    
    // 插入或更新用户单词学习状态
    await sql`
      INSERT INTO user_word_progress (user_id, word_id, is_learned, learned_at)
      VALUES (${userId}, ${id}, ${ok === '1'}, ${ok === '1' ? new Date().toISOString() : null})
      ON CONFLICT (user_id, word_id)
      DO UPDATE SET 
        is_learned = ${ok === '1'},
        learned_at = ${ok === '1' ? new Date().toISOString() : null},
        updated_at = NOW()
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Customer.' };
  }

  revalidatePath('/dashboard/customers');
  const redirectUrl = searchParams ? `/dashboard/customers?${searchParams}` : '/dashboard/customers';
  redirect(redirectUrl);
}

export async function deleteCustomer(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/customers');
}




export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}


const ITEMS_PER_PAGE2 = 10;
export async function fetchFilteredCustomers(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE2;

  try {
    // 获取当前用户信息
    const session = await auth();
    const userId = session?.user?.email || 'anonymous';

    const customers =  await sql<Customer[]>`
      SELECT
        c.id,
        c.name,
        c.email,
        c.image_url,
        CASE 
          WHEN uwp.is_learned = true THEN '1'
          ELSE '0'
        END as ok
      FROM customers c
      LEFT JOIN user_word_progress uwp ON c.id = uwp.word_id AND uwp.user_id = ${userId}
      WHERE uwp.is_learned IS NULL OR uwp.is_learned = false
      ORDER BY c.id DESC
      LIMIT ${ITEMS_PER_PAGE2} OFFSET ${offset}
    `;

    return customers;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customers.');
  }
}