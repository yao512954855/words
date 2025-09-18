import Image from 'next/image';
import { UpdateCustomer, DeleteCustomer,WriteCustomer } from '@/app/ui/customers/buttons';
import CustomerStatus from '@/app/ui/customers/status';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import { fetchFilteredCustomers } from '@/app/lib/data';
import LetterBoxInput from '@/app/ui/customers/letter-box-input';
import WordHint from '@/app/ui/customers/word-hint';


export default async function CustomersTable({
  query,
  currentPage,
  filters,
}: {
  query: string;
  currentPage: number;
  filters?: {
    version?: string;
    grade?: string;
    theclass?: string;
    theunit?: string;
    ok?: string;
  };
}) {
  const customers = await fetchFilteredCustomers(query, currentPage, filters);


  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {customers?.map((customer, index) => (
              <div
                key={customer.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <Image
                        src={customer.image_url}
                        className="mr-2 rounded-md"
                        width={256}
                        height={256}
                        alt={`${customer.name}'s profile picture`}
                        priority={index === 0}
                      />

                    </div>
                    {/* <p className="text-sm text-gray-500">{customer.email}</p> */}
                  </div>
                  {/* <CustomerStatus status={customer.status} /> */}
                  
                </div>
                <div className="flex flex-col w-full items-center justify-between pt-4">
                  
                    <div className="flex flex-col items-center gap-1 width:256px height:256px text-gray-300 m-3">
                      <p>提示：字母长度{customer.name.length}</p>
                      <WordHint word={customer.name} wordId={customer.id} />
                    </div>
                    <div className="flex items-center gap-3 width:256px height:256px">
                      
                      <LetterBoxInput id={customer.id} word={customer.name} placeholder="请输入单词" />
                    </div>
                 
                  {/* <div>
                    <p className="text-xl font-medium">
                      {formatCurrency(customer.amount)}
                    </p>
                    <p>{formatDateToLocal(customer.date)}</p>
                  </div> */}
                  <div className="flex justify-end gap-2">
                    {/* <UpdateCustomer id={customer.id} />
                    <DeleteCustomer id={customer.id} /> */}
                    {/* <WriteCustomer id={customer.id} /> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Words
                </th>
                {/* <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th> */}
                {/* <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th> */}
              </tr>
            </thead>
            <tbody className="bg-white">
              {customers?.map((customer, index) => (
                <tr
                  key={customer.id}
                  className="w-full border-b py-3 text-lg last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={customer.image_url}
                        className="rounded-md"
                        width={256}
                        height={256}
                        alt={`${customer.name}'s profile picture`}
                        priority={index === 0}
                      />
                      {/* <p>{customer.name}</p> */}
                    </div>
                  </td>

                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex flex-col items-start gap-1 width:256px height:256px text-gray-500 m-3">
                      <p>提示：字母长度{customer.name.length}</p>
                      <WordHint word={customer.name} wordId={customer.id} />
                    </div>
                    <div className="flex items-center gap-3 width:256px height:256px">
                      
                      <LetterBoxInput id={customer.id} word={customer.name} placeholder="请输入单词" />
                    </div>
                  </td>
                  {/* <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3 width:256px height:256px">
                      <p>{customer.name}</p>
                    </div>
                  </td> */}

                  {/* <td className="whitespace-nowrap px-3 py-3">
                    {customer.email}
                  </td> */}
                  {/* <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(customer.amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(customer.date)}
                  </td> */}
                  {/* <td className="whitespace-nowrap px-3 py-3">
                    <CustomerStatus status={customer.status} />
                  </td> */}
                  {/* <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateCustomer id={customer.id} />
                      <DeleteCustomer id={customer.id} />
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
