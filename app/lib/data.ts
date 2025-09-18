import { unstable_noStore as noStore } from 'next/cache';
import postgres from 'postgres';
import { auth } from '@/auth';
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

// 按月统计用户学习单词数量
export async function fetchMonthlyWordProgress() {
  try {
    console.log('Fetching monthly word progress data...');
    
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 获取当前用户信息
    const session = await auth();
    const userId = session?.user?.email || 'anonymous';

    // 获取用户筛选状态
    const filterState = await getUserFilterStateServer();
    const selectedVersion = filterState.version?.[0];
    const selectedGrade = filterState.grade?.[0];
    const selectedClass = filterState.theclass?.[0];

    let query;
    let params;

    if (selectedVersion && selectedGrade && selectedClass) {
      // 有筛选条件时，只统计符合条件的单词
      query = `
        WITH months AS (
          SELECT 
            TO_CHAR(date_trunc('month', date_trunc('year', CURRENT_DATE) + INTERVAL '1 month' * generate_series(0, 11)), 'Mon') as month,
            date_trunc('month', date_trunc('year', CURRENT_DATE) + INTERVAL '1 month' * generate_series(0, 11)) as month_date
        )
        SELECT 
          m.month,
          COALESCE(COUNT(uwp.id), 0) as revenue
        FROM months m
        LEFT JOIN user_word_progress uwp ON date_trunc('month', uwp.learned_at) = m.month_date
          AND uwp.user_id = $1
          AND uwp.is_learned = true
          AND uwp.learned_at IS NOT NULL
          AND EXTRACT(YEAR FROM uwp.learned_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        LEFT JOIN customers c ON uwp.word_id = c.id
          AND c.version = $2
          AND c.grade = $3
          AND c.theclass = $4
        GROUP BY m.month, m.month_date
        ORDER BY m.month_date
      `;
      params = [userId, selectedVersion, selectedGrade, selectedClass];
    } else {
      // 无筛选条件时，统计所有学习的单词
      query = `
        WITH months AS (
          SELECT 
            TO_CHAR(date_trunc('month', date_trunc('year', CURRENT_DATE) + INTERVAL '1 month' * generate_series(0, 11)), 'Mon') as month,
            date_trunc('month', date_trunc('year', CURRENT_DATE) + INTERVAL '1 month' * generate_series(0, 11)) as month_date
        )
        SELECT 
          m.month,
          COALESCE(COUNT(uwp.id), 0) as revenue
        FROM months m
        LEFT JOIN user_word_progress uwp ON date_trunc('month', uwp.learned_at) = m.month_date
          AND uwp.user_id = $1
          AND uwp.is_learned = true
          AND uwp.learned_at IS NOT NULL
          AND EXTRACT(YEAR FROM uwp.learned_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        GROUP BY m.month, m.month_date
        ORDER BY m.month_date
      `;
      params = [userId];
    }

    const data = await sql.unsafe(query, params);

    console.log('Monthly word progress data fetch completed after 3 seconds.');

    return data.map((row: any) => ({
      month: row.month,
      revenue: Number(row.revenue)
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch monthly word progress data.');
  }
}

// 按周统计用户学习单词数量
export async function fetchWeeklyWordProgress() {
  try {
    console.log('Fetching weekly word progress data...');
    
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 获取当前用户信息
    const session = await auth();
    const userId = session?.user?.email || 'anonymous';

    // 获取用户筛选状态
    const filterState = await getUserFilterStateServer();
    const selectedVersion = filterState.version?.[0];
    const selectedGrade = filterState.grade?.[0];
    const selectedClass = filterState.theclass?.[0];

    let query;
    let params;

    if (selectedVersion && selectedGrade && selectedClass) {
      // 有筛选条件时，只统计符合条件的单词
      query = `
        WITH week_days AS (
          SELECT 
            TO_CHAR(date_trunc('week', CURRENT_DATE) + INTERVAL '1 day' * generate_series(0, 6), 'Dy') as day_name,
            date_trunc('day', date_trunc('week', CURRENT_DATE) + INTERVAL '1 day' * generate_series(0, 6)) as day_date
        )
        SELECT 
          wd.day_name as month,
          COALESCE(COUNT(uwp.id), 0) as revenue
        FROM week_days wd
        LEFT JOIN user_word_progress uwp ON date_trunc('day', uwp.learned_at) = wd.day_date
          AND uwp.user_id = $1
          AND uwp.is_learned = true
          AND uwp.learned_at IS NOT NULL
        LEFT JOIN customers c ON uwp.word_id = c.id
          AND c.version = $2
          AND c.grade = $3
          AND c.theclass = $4
        GROUP BY wd.day_name, wd.day_date
        ORDER BY wd.day_date
      `;
      params = [userId, selectedVersion, selectedGrade, selectedClass];
    } else {
      // 无筛选条件时，统计所有学习的单词
      query = `
        WITH week_days AS (
          SELECT 
            TO_CHAR(date_trunc('week', CURRENT_DATE) + INTERVAL '1 day' * generate_series(0, 6), 'Dy') as day_name,
            date_trunc('day', date_trunc('week', CURRENT_DATE) + INTERVAL '1 day' * generate_series(0, 6)) as day_date
        )
        SELECT 
          wd.day_name as month,
          COALESCE(COUNT(uwp.id), 0) as revenue
        FROM week_days wd
        LEFT JOIN user_word_progress uwp ON date_trunc('day', uwp.learned_at) = wd.day_date
          AND uwp.user_id = $1
          AND uwp.is_learned = true
          AND uwp.learned_at IS NOT NULL
        GROUP BY wd.day_name, wd.day_date
        ORDER BY wd.day_date
      `;
      params = [userId];
    }

    const data = await sql.unsafe(query, params);

    console.log('Weekly word progress data fetch completed after 3 seconds.');

    return data.map((row: any) => ({
      month: row.month,
      revenue: Number(row.revenue)
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch weekly word progress data.');
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

// 获取用户筛选状态（服务端版本）
async function getUserFilterStateServer(): Promise<Record<string, string[]>> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {};
    }

    const userId = session.user.email;
    
    const result = await sql`
      SELECT filter_type, filter_value 
      FROM user_filter_state 
      WHERE user_id = ${userId}
    `;

    const filterState: Record<string, string[]> = {};
    
    result.forEach((row: any) => {
      if (!filterState[row.filter_type]) {
        filterState[row.filter_type] = [];
      }
      filterState[row.filter_type].push(row.filter_value);
    });

    return filterState;
  } catch (error) {
    console.error('Error fetching filter state:', error);
    return {};
  }
}

// 计算累计单词数量
async function calculateCumulativeWords(filterState: Record<string, string[]>): Promise<number> {
  try {
    // 获取当前选择的版本、年级、学期
    const selectedVersion = filterState.version?.[0];
    const selectedGrade = filterState.grade?.[0];
    const selectedClass = filterState.theclass?.[0];

    if (!selectedVersion || !selectedGrade || !selectedClass) {
      // 如果没有选择筛选条件，返回所有单词数量
      const result = await sql`SELECT COUNT(*) FROM customers`;
      return Number(result[0].count ?? '0');
    }

    // 构建累计查询条件
    // 例如：选择人教版4年级上册，则统计一年级上到四年级上的所有单词
    const conditions = [];
    const params = [];

    // 版本必须匹配
    conditions.push(`customers.version = $${params.length + 1}`);
    params.push(selectedVersion);

    // 年级范围：从1年级到当前选择的年级
    const gradeOrder = ['k1', 'k2', 'k3', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const selectedGradeIndex = gradeOrder.indexOf(selectedGrade);
    
    if (selectedGradeIndex >= 0) {
      const cumulativeGrades = gradeOrder.slice(0, selectedGradeIndex + 1);
      const gradePlaceholders = cumulativeGrades.map((_, index) => `$${params.length + index + 1}`).join(',');
      conditions.push(`customers.grade IN (${gradePlaceholders})`);
      params.push(...cumulativeGrades);
    }

    // 学期条件：如果选择下学期(2)，则包含上学期(1)和下学期(2)；如果选择上学期(1)，则只包含上学期(1)
    if (selectedClass === '2') {
      // 下学期：包含上学期和下学期
      conditions.push(`customers.theclass IN ('1', '2')`);
    } else {
      // 上学期：只包含上学期
      conditions.push(`customers.theclass = '1'`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const result = await sql.unsafe(`
      SELECT COUNT(*) 
      FROM customers 
      ${whereClause}
    `, params);

    return Number(result[0].count ?? '0');
  } catch (error) {
    console.error('Database Error:', error);
    return 0;
  }
}

// 计算已掌握的单词数量
async function calculateMasteredWords(filterState: Record<string, string[]>): Promise<number> {
  try {
    // 获取当前用户信息
    const session = await auth();
    const userId = session?.user?.email || 'anonymous';

    // 获取当前选择的版本、年级、学期
    const selectedVersion = filterState.version?.[0];
    const selectedGrade = filterState.grade?.[0];
    const selectedClass = filterState.theclass?.[0];

    // 构建查询条件
    const conditions = [];
    const params = [userId]; // 第一个参数是用户ID

    // 必须是已掌握的单词
    conditions.push(`uwp.is_learned = true`);

    if (selectedVersion && selectedGrade && selectedClass) {
      // 如果有筛选条件，则按照累计逻辑统计（类似calculateCumulativeWords）
      
      // 版本必须匹配
      conditions.push(`customers.version = $${params.length + 1}`);
      params.push(selectedVersion);

      // 年级范围：从1年级到当前选择的年级
      const gradeOrder = ['k1', 'k2', 'k3', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
      const selectedGradeIndex = gradeOrder.indexOf(selectedGrade);
      
      if (selectedGradeIndex >= 0) {
        const cumulativeGrades = gradeOrder.slice(0, selectedGradeIndex + 1);
        const gradePlaceholders = cumulativeGrades.map((_, index) => `$${params.length + index + 1}`).join(',');
        conditions.push(`customers.grade IN (${gradePlaceholders})`);
        params.push(...cumulativeGrades);

        // 学期范围：如果选择上册(1)，只统计上册；如果选择下册(2)，统计上册+下册
        if (selectedClass === '1') {
          conditions.push(`customers.theclass = $${params.length + 1}`);
          params.push('1');
        } else if (selectedClass === '2') {
          conditions.push(`customers.theclass IN ($${params.length + 1}, $${params.length + 2})`);
          params.push('1', '2');
        }
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const result = await sql.unsafe(`
      SELECT COUNT(*) 
      FROM customers 
      INNER JOIN user_word_progress uwp ON customers.id = uwp.word_id AND uwp.user_id = $1
      ${whereClause}
    `, params);

    return Number(result[0].count ?? '0');
  } catch (error) {
    console.error('Database Error:', error);
    return 0;
  }
}

// 计算当前学期单词数量
async function calculateTermWords(filterState: Record<string, string[]>): Promise<number> {
  try {
    // 获取当前选择的版本、年级、学期
    const selectedVersion = filterState.version?.[0];
    const selectedGrade = filterState.grade?.[0];
    const selectedClass = filterState.theclass?.[0];

    if (!selectedVersion || !selectedGrade || !selectedClass) {
      // 如果没有选择筛选条件，返回0
      return 0;
    }

    // 构建查询条件 - 只统计当前选择的学期
    const conditions = [];
    const params = [];

    // 版本必须匹配
    conditions.push(`customers.version = $${params.length + 1}`);
    params.push(selectedVersion);

    // 年级必须匹配
    conditions.push(`customers.grade = $${params.length + 1}`);
    params.push(selectedGrade);

    // 学期必须匹配
    conditions.push(`customers.theclass = $${params.length + 1}`);
    params.push(selectedClass);

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const result = await sql.unsafe(`
      SELECT COUNT(*) 
      FROM customers 
      ${whereClause}
    `, params);

    return Number(result[0].count ?? '0');
  } catch (error) {
    console.error('Database Error:', error);
    return 0;
  }
}

// 计算当前学期已掌握的单词数量
async function calculateTermMasteredWords(filterState: Record<string, string[]>): Promise<number> {
  try {
    // 获取当前用户信息
    const session = await auth();
    const userId = session?.user?.email || 'anonymous';

    // 获取当前选择的版本、年级、学期
    const selectedVersion = filterState.version?.[0];
    const selectedGrade = filterState.grade?.[0];
    const selectedClass = filterState.theclass?.[0];

    if (!selectedVersion || !selectedGrade || !selectedClass) {
      // 如果没有选择筛选条件，返回0
      return 0;
    }

    // 构建查询条件 - 只统计当前选择的学期中已掌握的单词
    const conditions = [];
    const params = [userId]; // 第一个参数是用户ID

    // 必须是已掌握的单词
    conditions.push(`uwp.is_learned = true`);

    // 版本必须匹配
    conditions.push(`customers.version = $${params.length + 1}`);
    params.push(selectedVersion);

    // 年级必须匹配
    conditions.push(`customers.grade = $${params.length + 1}`);
    params.push(selectedGrade);

    // 学期必须匹配
    conditions.push(`customers.theclass = $${params.length + 1}`);
    params.push(selectedClass);

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const result = await sql.unsafe(`
      SELECT COUNT(*) 
      FROM customers 
      INNER JOIN user_word_progress uwp ON customers.id = uwp.word_id AND uwp.user_id = $1
      ${whereClause}
    `, params);

    return Number(result[0].count ?? '0');
  } catch (error) {
    console.error('Database Error:', error);
    return 0;
  }
}

export async function fetchCardData() {
  try {
    // 获取用户筛选状态
    const filterState = await getUserFilterStateServer();
    
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const totalwordsmasteredPromise = calculateMasteredWords(filterState); // 使用新的已掌握单词统计
    const totalwordsPromise = calculateCumulativeWords(filterState); // 使用新的累计统计
    const termwordsPromise = calculateTermWords(filterState); // 使用新的当前学期统计
    const termwordsmasteredPromise = calculateTermMasteredWords(filterState); // 使用新的当前学期已掌握单词统计

    const data = await Promise.all([
      totalwordsmasteredPromise,
      totalwordsPromise,
      termwordsPromise,
      termwordsmasteredPromise,
    ]);

    const totalwordsmastered = Number(data[0] ?? '0'); // 这里是已掌握单词数量
    const totalwords = Number(data[1] ?? '0'); // 这里是累计单词数量
    const termwords = Number(data[2] ?? '0'); // 这里是当前学期单词数量
    const termwordsmastered = Number(data[3] ?? '0'); // 这里是当前学期已掌握单词数量

    const totalPendingInvoices = 0; // 暂时设为0，因为不再使用发票数据

    return {
      termwordsmastered,
      totalwordsmastered,
      totalwords,
      termwords,
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
    // 获取当前用户信息
    const session = await auth();
    const userId = session?.user?.email || 'anonymous';

    // 构建WHERE条件
    const conditions = [];
    const params = [userId]; // 第一个参数是用户ID

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
    
    // 处理掌握状态筛选
    if (filters?.ok) {
      if (filters.ok === '0') {
        // 未掌握：没有记录或is_learned为false
        conditions.push(`(uwp.is_learned IS NULL OR uwp.is_learned = false)`);
      } else if (filters.ok === '1') {
        // 已掌握：is_learned为true
        conditions.push(`uwp.is_learned = true`);
      }
      // 如果filters.ok存在但不是'0'或'1'，则显示全部（不添加任何条件）
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const data = await sql.unsafe(`
      SELECT COUNT(*) 
      FROM customers 
      LEFT JOIN user_word_progress uwp ON customers.id = uwp.word_id AND uwp.user_id = $1
      ${whereClause}
    `, params);
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
    // 获取当前用户信息
    const session = await auth();
    const userId = session?.user?.email || 'anonymous';

    // 构建WHERE条件
    const conditions = [];
    const params = [userId]; // 第一个参数是用户ID

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
    
    // 处理掌握状态筛选
    if (filters?.ok) {
      if (filters.ok === '0') {
        // 未掌握：没有记录或is_learned为false
        conditions.push(`(uwp.is_learned IS NULL OR uwp.is_learned = false)`);
      } else if (filters.ok === '1') {
        // 已掌握：is_learned为true
        conditions.push(`uwp.is_learned = true`);
      }
      // 如果filters.ok存在但不是'0'或'1'，则显示全部（不添加任何条件）
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // 添加LIMIT和OFFSET参数
    params.push(String(ITEMS_PER_PAGE2), String(offset));
    
    const customers = await sql.unsafe(`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url,
        CASE 
          WHEN uwp.is_learned = true THEN '1'
          ELSE '0'
        END as ok,
        customers.version,
        customers.grade,
        customers.theclass,
        customers.theunit,
        customers.studytimes,
        customers.orderid
      FROM customers
      LEFT JOIN user_word_progress uwp ON customers.id = uwp.word_id AND uwp.user_id = $1
      ${whereClause}
      ORDER BY customers.orderid ASC
      LIMIT $${params.length - 1} OFFSET $${params.length}
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




// 获取用户最常出错的单词统计
export async function fetchFrequentErrorWords(sortBy: 'count' | 'latest' = 'count') {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return [];
    }

    const userId = session.user.email;
    
    // 首先检查是否有错误输入数据
    const hasData = await sql`
      SELECT COUNT(*) as count FROM word_wrong_inputs WHERE user_id = ${userId}
    `;
    
    if (Number(hasData[0].count) === 0) {
      // 如果没有错误输入数据，返回空数组
      return [];
    }
    
    // 根据排序方式构建不同的查询
    let data;
    if (sortBy === 'latest') {
      data = await sql`
        SELECT 
          wwi.word_id,
          wwi.correct_word,
          COUNT(*) as error_count,
          c.image_url,
          MAX(wwi.created_at) as last_error_at,
          array_agg(DISTINCT wwi.wrong_input ORDER BY wwi.wrong_input) as wrong_inputs
        FROM word_wrong_inputs wwi
        LEFT JOIN customers c ON (
          CASE 
            WHEN wwi.word_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
            THEN CAST(wwi.word_id AS uuid) = c.id
            ELSE false
          END
        )
        WHERE wwi.user_id = ${userId}
        GROUP BY wwi.word_id, wwi.correct_word, c.image_url
        ORDER BY last_error_at DESC, error_count DESC
        LIMIT 6
      `;
    } else {
      data = await sql`
        SELECT 
          wwi.word_id,
          wwi.correct_word,
          COUNT(*) as error_count,
          c.image_url,
          MAX(wwi.created_at) as last_error_at,
          array_agg(DISTINCT wwi.wrong_input ORDER BY wwi.wrong_input) as wrong_inputs
        FROM word_wrong_inputs wwi
        LEFT JOIN customers c ON (
          CASE 
            WHEN wwi.word_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
            THEN CAST(wwi.word_id AS uuid) = c.id
            ELSE false
          END
        )
        WHERE wwi.user_id = ${userId}
        GROUP BY wwi.word_id, wwi.correct_word, c.image_url
        ORDER BY error_count DESC, last_error_at DESC
        LIMIT 6
      `;
    }

    return data.map((item: any) => ({
      id: item.word_id,
      name: item.correct_word,
      email: `错误输入: ${item.wrong_inputs.slice(0, 3).join(', ')}${item.wrong_inputs.length > 3 ? '...' : ''}`,
      image_url: item.image_url || '/customers/default-avatar.png',
      amount: item.error_count,
      wrong_inputs: item.wrong_inputs,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    // 如果出错，返回空数组而不是抛出错误
    return [];
  }
}




// 获取用户错误单词总数
export async function fetchErrorWordsCount() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return 0;
    }

    const userId = session.user.email;
    
    const result = await sql`
      SELECT COUNT(DISTINCT wwi.word_id) as total_count
      FROM word_wrong_inputs wwi
      WHERE wwi.user_id = ${userId}
    `;

    return Number(result[0]?.total_count || 0);
  } catch (error) {
    console.error('Database Error:', error);
    return 0;
  }
}

// 获取用户所有错误单词的详细信息（支持分页）
export async function fetchAllErrorWords(
  sortBy: 'count' | 'latest' = 'count',
  page: number = 1,
  itemsPerPage: number = 15
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return [];
    }

    const userId = session.user.email;
    const offset = (page - 1) * itemsPerPage;
    
    // 根据排序方式构建不同的查询
    let data;
    if (sortBy === 'latest') {
      data = await sql`
        SELECT 
          wwi.word_id,
          wwi.correct_word,
          COUNT(*) as error_count,
          c.image_url,
          MAX(wwi.created_at) as last_error_at,
          array_agg(wwi.wrong_input ORDER BY wwi.created_at DESC) as wrong_inputs,
          array_agg(wwi.created_at ORDER BY wwi.created_at DESC) as error_times
        FROM word_wrong_inputs wwi
        LEFT JOIN customers c ON (
          CASE 
            WHEN wwi.word_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
            THEN CAST(wwi.word_id AS uuid) = c.id
            ELSE false
          END
        )
        WHERE wwi.user_id = ${userId}
        GROUP BY wwi.word_id, wwi.correct_word, c.image_url
        ORDER BY last_error_at DESC, error_count DESC
        LIMIT ${itemsPerPage} OFFSET ${offset}
      `;
    } else {
      data = await sql`
        SELECT 
          wwi.word_id,
          wwi.correct_word,
          COUNT(*) as error_count,
          c.image_url,
          MAX(wwi.created_at) as last_error_at,
          array_agg(wwi.wrong_input ORDER BY wwi.created_at DESC) as wrong_inputs,
          array_agg(wwi.created_at ORDER BY wwi.created_at DESC) as error_times
        FROM word_wrong_inputs wwi
        LEFT JOIN customers c ON (
          CASE 
            WHEN wwi.word_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
            THEN CAST(wwi.word_id AS uuid) = c.id
            ELSE false
          END
        )
        WHERE wwi.user_id = ${userId}
        GROUP BY wwi.word_id, wwi.correct_word, c.image_url
        ORDER BY error_count DESC, last_error_at DESC
        LIMIT ${itemsPerPage} OFFSET ${offset}
      `;
    }

    return data.map((item: any) => ({
      id: item.word_id,
      correct_word: item.correct_word,
      error_count: item.error_count,
      image_url: item.image_url || '/customers/default-avatar.png',
      wrong_inputs: item.wrong_inputs,
      error_times: item.error_times,
      last_error_at: item.last_error_at,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

// 获取用户最常收藏的单词统计
export async function fetchFrequentFavoriteWords(sortBy: 'count' | 'latest' = 'count') {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return [];
    }

    const userId = session.user.email;
    
    // 首先检查是否有收藏数据
    const hasData = await sql`
      SELECT COUNT(*) as count FROM word_favorites WHERE user_id = ${userId}
    `;
    
    if (Number(hasData[0].count) === 0) {
      // 如果没有收藏数据，返回空数组
      return [];
    }
    
    // 根据排序方式构建不同的查询
    let data;
    if (sortBy === 'latest') {
      data = await sql`
        SELECT 
          wf.word_id,
          wf.word_text,
          CONCAT('/wordspic/', wf.word_text, '.png') as image_url,
          wf.created_at as favorite_at,
          1 as favorite_count
        FROM word_favorites wf
        WHERE wf.user_id = ${userId}
        ORDER BY wf.created_at DESC
        LIMIT 6
      `;
    } else {
      // 按收藏次数排序（虽然每个单词只能收藏一次，但为了保持接口一致性）
      data = await sql`
        SELECT 
          wf.word_id,
          wf.word_text,
          CONCAT('/wordspic/', wf.word_text, '.png') as image_url,
          wf.created_at as favorite_at,
          1 as favorite_count
        FROM word_favorites wf
        WHERE wf.user_id = ${userId}
        ORDER BY wf.created_at DESC
        LIMIT 6
      `;
    }

    return data.map((item: any) => ({
      word_id: item.word_id,
      word: item.word_text,
      favorite_count: item.favorite_count,
      image_url: item.image_url,
      favorite_at: item.favorite_at,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

// 获取收藏单词总数
export async function fetchFavoriteWordsCount() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return 0;
    }

    const userId = session.user.email;
    
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM word_favorites 
      WHERE user_id = ${userId}
    `;
    
    return Number(result[0].count ?? '0');
  } catch (error) {
    console.error('Database Error:', error);
    return 0;
  }
}

// 获取用户所有收藏单词的详细信息（支持分页）
export async function fetchAllFavoriteWords(
  sortBy: 'count' | 'latest' = 'latest',
  page: number = 1,
  itemsPerPage: number = 15
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return [];
    }

    const userId = session.user.email;
    const offset = (page - 1) * itemsPerPage;
    
    // 根据排序方式构建不同的查询
    let data;
    if (sortBy === 'latest') {
      data = await sql`
        SELECT 
          wf.word_id,
          wf.word_text,
          CONCAT('/wordspic/', wf.word_text, '.png') as image_url,
          wf.created_at as favorite_at,
          wf.updated_at,
          1 as favorite_count
        FROM word_favorites wf
        WHERE wf.user_id = ${userId}
        ORDER BY wf.created_at DESC
        LIMIT ${itemsPerPage} OFFSET ${offset}
      `;
    } else {
      // 按收藏次数排序（虽然每个单词只能收藏一次，但为了保持接口一致性）
      data = await sql`
        SELECT 
          wf.word_id,
          wf.word_text,
          CONCAT('/wordspic/', wf.word_text, '.png') as image_url,
          wf.created_at as favorite_at,
          wf.updated_at,
          1 as favorite_count
        FROM word_favorites wf
        WHERE wf.user_id = ${userId}
        ORDER BY wf.created_at DESC
        LIMIT ${itemsPerPage} OFFSET ${offset}
      `;
    }

    return data.map((item: any) => ({
      word_id: item.word_id,
      word: item.word_text,
      favorite_count: item.favorite_count,
      image_url: item.image_url,
      favorite_at: item.favorite_at,
      updated_at: item.updated_at,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}



