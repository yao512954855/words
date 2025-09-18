import CardWrapper from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import ErrorWordsSection from '@/app/ui/dashboard/error-words-section';
import FavoriteWordsSection from '@/app/ui/dashboard/favorite-words-section';
import HintWordsSection from '@/app/ui/dashboard/hint-words-section';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import {
  RevenueChartSkeleton,
  LatestInvoicesSkeleton,
  CardsSkeleton,
} from '@/app/ui/skeletons';
 
export default async function Page() {
    // const revenue = await fetchRevenue();

    // const latestInvoices = await fetchLatestInvoices();
    // const { totalPaidInvoices, totalPendingInvoices, numberOfInvoices, numberOfCustomers } = await fetchCardData();
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        统计仪表盘
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <ErrorWordsSection />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <FavoriteWordsSection />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <HintWordsSection />
        </Suspense>
      </div>
    </main>
  );
}