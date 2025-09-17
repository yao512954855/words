import postgres from 'postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

const sql = postgres(process.env.POSTGRES_URL!);

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log('Fetching revenue data...');
    
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue[]>`SELECT * FROM revenue`;

    console.log('Data fetch completed after 3 seconds.');

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw[]>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0].count ?? '0');
    const numberOfCustomers = Number(data[1][0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const customers = await sql<CustomerField[]>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

// export async function fetchFilteredCustomers(query: string) {
//   try {
//     const data = await sql<CustomersTableType[]>`
// 		SELECT
// 		  customers.id,
// 		  customers.name,
// 		  customers.email,
// 		  customers.image_url,
// 		  COUNT(invoices.id) AS total_invoices,
// 		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
// 		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
// 		FROM customers
// 		LEFT JOIN invoices ON customers.id = invoices.customer_id
// 		WHERE
// 		  customers.name ILIKE ${`%${query}%`} OR
//         customers.email ILIKE ${`%${query}%`}
// 		GROUP BY customers.id, customers.name, customers.email, customers.image_url
// 		ORDER BY customers.name ASC
// 	  `;

//     const customers = data.map((customer) => ({
//       ...customer,
//       total_pending: formatCurrency(customer.total_pending),
//       total_paid: formatCurrency(customer.total_paid),
//     }));

//     return customers;
//   } catch (err) {
//     console.error('Database Error:', err);
//     throw new Error('Failed to fetch customer table.');
//   }
// }


export async function fetchCustomersPages(
  query: string,
  filters?: {
    version?: string;
    grade?: string;
    theclass?: string;
    theunit?: string;
    ok?: string;
  }
) {
  try {
    // 构建WHERE条件
    const conditions = [];
    const params = [];

    if (query) {
      conditions.push(`(customers.name ILIKE $${params.length + 1} OR customers.email ILIKE $${params.length + 2})`);
      params.push(`%${query}%`, `%${query}%`);
    }

    if (filters?.version) {
      conditions.push(`customers.version = $${params.length + 1}`);
      params.push(filters.version);
    }
    if (filters?.grade) {
      conditions.push(`customers.grade = $${params.length + 1}`);
      params.push(filters.grade);
    }
    if (filters?.theclass) {
      conditions.push(`customers.theclass = $${params.length + 1}`);
      params.push(filters.theclass);
    }
    if (filters?.theunit) {
      conditions.push(`customers.theunit = $${params.length + 1}`);
      params.push(filters.theunit);
    }
    if (filters?.ok) {
      conditions.push(`customers.ok = $${params.length + 1}`);
      params.push(filters.ok);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const data = await sql.unsafe(`SELECT COUNT(*) FROM customers ${whereClause}`, params);
    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE2);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of customers.');
  }
}


export async function fetchCustomerById(id: string) {
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

const ITEMS_PER_PAGE2 = 6;
export async function fetchFilteredCustomers(
  query: string,
  currentPage: number,
  filters?: {
    version?: string;
    grade?: string;
    theclass?: string;
    theunit?: string;
    ok?: string;
  }
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE2;

  try {
    // 构建WHERE条件
    const conditions = [];
    const params = [];

    if (query) {
      conditions.push(`(customers.name ILIKE $${params.length + 1} OR customers.email ILIKE $${params.length + 2})`);
      params.push(`%${query}%`, `%${query}%`);
    }

    if (filters?.version) {
      conditions.push(`customers.version = $${params.length + 1}`);
      params.push(filters.version);
    }
    if (filters?.grade) {
      conditions.push(`customers.grade = $${params.length + 1}`);
      params.push(filters.grade);
    }
    if (filters?.theclass) {
      conditions.push(`customers.theclass = $${params.length + 1}`);
      params.push(filters.theclass);
    }
    if (filters?.theunit) {
      conditions.push(`customers.theunit = $${params.length + 1}`);
      params.push(filters.theunit);
    }
    if (filters?.ok) {
      conditions.push(`customers.ok = $${params.length + 1}`);
      params.push(filters.ok);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // 添加LIMIT和OFFSET参数
    const limitIndex = params.length + 1;
    const offsetIndex = params.length + 2;
    params.push(ITEMS_PER_PAGE2, offset);
    
    const customers = await sql.unsafe(`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url,
        customers.ok,
        customers.version,
        customers.grade,
        customers.theclass,
        customers.theunit,
        customers.studytimes,
        customers.orderid
      FROM customers
      ${whereClause}
      ORDER BY customers.orderid ASC
      LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `, params);

    return customers;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch filtered customers.');
  }
}

// 获取筛选选项的函数
export async function fetchChoiceOptions(type: string) {
  try {
    const options = await sql`
      SELECT id, type, value, label, sort_order, is_active
      FROM choicetable
      WHERE type = ${type} AND is_active = true
      ORDER BY sort_order ASC, label ASC
    `;
    return options;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch ${type} options.`);
  }
}

// 获取所有筛选选项
export async function fetchAllChoiceOptions() {
  try {
    const options = await sql`
      SELECT id, type, value, label, sort_order, is_active
      FROM choicetable
      WHERE is_active = true
      ORDER BY type ASC, sort_order ASC, label ASC
    `;
    
    // 按类型分组
    const groupedOptions = options.reduce((acc, option) => {
      if (!acc[option.type]) {
        acc[option.type] = [];
      }
      acc[option.type].push(option);
      return acc;
    }, {});
    
    return groupedOptions;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch choice options.');
  }
}



