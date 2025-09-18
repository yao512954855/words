import { fetchFilteredCustomers } from '@/app/lib/data';
import TableWithReading from './table-with-reading';

interface TableWrapperProps {
  query: string;
  currentPage: number;
  filters?: {
    version?: string;
    grade?: string;
    theclass?: string;
    theunit?: string;
    ok?: string;
  };
}

export default async function TableWrapper({ 
  query, 
  currentPage, 
  filters 
}: TableWrapperProps) {
  const customers = await fetchFilteredCustomers(query, currentPage, filters);

  return (
    <TableWithReading 
      query={query}
      currentPage={currentPage}
      filters={filters}
      initialCustomers={customers}
    />
  );
}