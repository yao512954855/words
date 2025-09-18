import { ArrowPathIcon, EyeIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import { LatestInvoice } from '@/app/lib/definitions';
import { fetchFrequentErrorWords } from '@/app/lib/data';


export default async function LatestInvoices() {
  const latestInvoices: LatestInvoice[] = await fetchFrequentErrorWords();
  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Frequent error words
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        {/* NOTE: Uncomment this code in Chapter 7 */}

        <div className="bg-white px-6">
          {latestInvoices.map((invoice, i) => {
            return (
              <div
                key={invoice.id}
                className={clsx(
                  'flex flex-row items-center justify-between py-4',
                  {
                    'border-t': i !== 0,
                  },
                )}
              >
                <div className="flex items-center">
                  <Image
                    src={invoice.image_url}
                    alt={`${invoice.name}'s profile picture`}
                    className="mr-4 rounded-full"
                    width={32}
                    height={32}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold md:text-base">
                      {invoice.name}
                    </p>
                    <p className="hidden text-sm text-gray-500 sm:block">
                      {invoice.email}
                    </p>
                    
                  </div>
                </div>
                <p
                  className={`${lusitana.className} truncate text-sm font-medium md:text-base text-red-600`}
                >
                  {invoice.amount} 次
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between pb-2 pt-6">
          <div className="flex items-center">
            <ArrowPathIcon className="h-5 w-5 text-gray-500" />
            <h3 className="ml-2 text-sm text-gray-500 ">实时统计错误单词</h3>
          </div>
          <Link
            href="/dashboard/error-words"
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            查看全部
          </Link>
        </div>
      </div>
    </div>
  );
}
