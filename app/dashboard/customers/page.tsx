import postgres from 'postgres';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import TableWrapper from '@/app/ui/customers/table-wrapper';
import { fetchCustomersPages, fetchAllChoiceOptions } from '@/app/lib/data';
import { CreateCustomers } from '@/app/ui/customers/buttons';
import { Suspense } from 'react';
import { CustomersTableSkeleton } from '@/app/ui/skeletons';
import CustomersFilters from '@/app/ui/customers/filters';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const sql = postgres(process.env.POSTGRES_URL!);

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

export default async function CustomersPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    version?: string;
    grade?: string;
    theclass?: string;
    theunit?: string;
    ok?: string;
  }>;
}) {

  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  
  // 检查是否有URL筛选参数
  const hasUrlFilters = searchParams?.version || searchParams?.grade || 
                       searchParams?.theclass || searchParams?.theunit || 
                       searchParams?.ok;
  
  // 如果没有URL筛选参数，获取用户保存的筛选状态并重定向
  if (!hasUrlFilters) {
    const savedFilterState = await getUserFilterStateServer();
    if (Object.keys(savedFilterState).length > 0) {
      const params = new URLSearchParams();
      
      // 保持现有的查询参数
      if (query) params.set('query', query);
      if (currentPage > 1) params.set('page', currentPage.toString());
      
      // 应用保存的筛选状态
      Object.entries(savedFilterState).forEach(([filterType, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          params.set(filterType, values[0]); // 取第一个值
        }
      });
      
      redirect(`/dashboard/customers?${params.toString()}`);
    }
  }
  
  // 获取筛选参数
  const filters = {
    version: searchParams?.version,
    grade: searchParams?.grade,
    theclass: searchParams?.theclass,
    theunit: searchParams?.theunit,
    ok: searchParams?.ok,
  };

  const totalPages = await fetchCustomersPages(query, filters);
  
  // 获取筛选选项
  const choiceOptions = await fetchAllChoiceOptions();

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <div className="w-full max-w-md">
          <Search placeholder="搜索单词（中文或英文）..." />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
      </div>
      
      {/* 筛选组件 */}
      <CustomersFilters choiceOptions={choiceOptions} />
      
       <Suspense key={query + currentPage + JSON.stringify(filters)} fallback={<CustomersTableSkeleton />}>
        <TableWrapper query={query} currentPage={currentPage} filters={filters} />
      </Suspense>
    </div>
  );
}
