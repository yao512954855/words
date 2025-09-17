import postgres from 'postgres';
import { lusitana } from '@/app/ui/fonts';
import Pagination from '@/app/ui/customers/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/customers/table';
import { fetchCustomersPages, fetchAllChoiceOptions } from '@/app/lib/data';
import { CreateCustomers } from '@/app/ui/customers/buttons';
import { Suspense } from 'react';
import { CustomersTableSkeleton } from '@/app/ui/skeletons';
import CustomersFilters from '@/app/ui/customers/filters';


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
        <h1 className={`${lusitana.className} text-2xl`}>Can you spell the words?</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        {/* <Search placeholder="Search Customers..." /> */}
        {/* <CreateCustomers /> */}
      </div>
      
      {/* 筛选组件 */}
      <CustomersFilters choiceOptions={choiceOptions} />
      
       <Suspense key={query + currentPage + JSON.stringify(filters)} fallback={<CustomersTableSkeleton />}>
        <Table query={query} currentPage={currentPage} filters={filters} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
