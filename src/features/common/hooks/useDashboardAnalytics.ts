import { useMemo } from 'react';

/**
 * Hook to manage financial analytics and collection trends for the dashboard.
 */
export const useDashboardAnalytics = (dbTransactions: any[]) => {
  // Dynamic Financial Analytics: Aggregate VERIFIED transactions by month for the trend chart
  const collectionTrends = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const last6Months: { month: string; value: number; raw: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      let m = currentMonthIndex - i;
      if (m < 0) m += 12;
      last6Months.push({ month: months[m], value: 0, raw: 0 });
    }

    dbTransactions.filter((tx: any) => tx.status === 'VERIFIED' && tx.paid_at).forEach((tx: any) => {
      const txDate = new Date(tx.paid_at!);
      const txMonth = months[txDate.getMonth()];
      const trendItem = last6Months.find(l => l.month === txMonth);
      if (trendItem) {
        trendItem.raw += Number(tx.amount);
      }
    });

    // Normalize values for the 0-100% chart (using max collection as 100%)
    const maxVal = Math.max(...last6Months.map(m => m.raw), 1000); // Floor of 1k
    return last6Months.map(m => ({
      ...m,
      value: Math.max(10, (m.raw / maxVal) * 100) // Minimum 10% for visibility
    }));
  }, [dbTransactions]);

  return { collectionTrends };
};
