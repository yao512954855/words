import { Revenue } from './definitions';

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export const formatDateToLocal = (
  dateStr: string,
  locale: string = 'en-US',
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const generateYAxis = (revenue: Revenue[]) => {
  // Calculate what labels we need to display on the y-axis
  // based on highest record
  const yAxisLabels = [];
  const highestRecord = Math.max(...revenue.map((month) => month.revenue));
  
  // For word counts, use different scaling logic
  let topLabel, step;
  
  if (highestRecord <= 10) {
    // For very small numbers, use step of 2
    topLabel = Math.ceil(highestRecord / 2) * 2;
    step = Math.round(Math.max(1, topLabel / 5));
  } else if (highestRecord <= 50) {
    // For small numbers, use step of 10
    topLabel = Math.ceil(highestRecord / 10) * 10;
    step = Math.round(Math.max(5, topLabel / 5));
  } else if (highestRecord <= 200) {
    // For medium numbers, use step of 20
    topLabel = Math.ceil(highestRecord / 20) * 20;
    step = Math.round(Math.max(10, topLabel / 5));
  } else if (highestRecord <= 1000) {
    // For larger numbers, use step of 100
    topLabel = Math.ceil(highestRecord / 100) * 100;
    step = Math.round(Math.max(50, topLabel / 5));
  } else {
    // For very large numbers, use step of 1000
    topLabel = Math.ceil(highestRecord / 1000) * 1000;
    step = Math.round(Math.max(200, topLabel / 5));
  }

  // Use integer-based loop to avoid floating point precision issues
  const numSteps = Math.floor(topLabel / step);
  for (let i = 0; i <= numSteps; i++) {
    const value = topLabel - (i * step);
    if (value >= 0) {
      yAxisLabels.push(`${value}`);
    }
  }

  return { yAxisLabels, topLabel };
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};
