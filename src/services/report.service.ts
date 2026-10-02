import prisma from '@/config/prisma';
import { formatTransaction } from '@/services/transaction.service';

export type ReportPeriod = 'week' | 'month' | 'year';

export interface DashboardMetricsResponse {
  dailySales: {
    totalSales: number;
    transactionCount: number;
    itemCount: number;
  };
  stockAlerts: Array<{
    barcode: string;
    name: string;
    stock: number;
    minStock: number;
    status: 'low' | 'empty';
  }>;
  recentTransactions: any[];
  activeDebtTotal: number;
  todayCashBalance: number;
}

export const getDashboardMetrics = async (userId: string): Promise<DashboardMetricsResponse> => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // 1. Daily Sales
  const todayTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      createdAt: { gte: startOfToday, lte: endOfToday },
    },
    include: { items: true },
  });

  const totalSales = todayTransactions.reduce((acc, t) => acc + Number(t.totalAmount), 0);
  const transactionCount = todayTransactions.length;
  const itemCount = todayTransactions.reduce(
    (acc, t) => acc + t.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0),
    0
  );

  // 2. Stock Alerts
  const lowStockProducts = await prisma.product.findMany({
    where: {
      userId,
    },
  });

  const stockAlerts = lowStockProducts
    .filter((p) => p.stock <= p.minStock)
    .map((p) => ({
      barcode: p.barcode,
      name: p.name,
      stock: p.stock,
      minStock: p.minStock,
      status: (p.stock === 0 ? 'empty' : 'low') as 'low' | 'empty',
    }))
    .slice(0, 10);

  // 3. Recent Transactions
  const recentTransactionsRaw = await prisma.transaction.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const recentTransactions = recentTransactionsRaw.map(formatTransaction);

  // 4. Active Debt Total
  const activeDebts = await prisma.debt.findMany({
    where: {
      userId,
      status: { in: ['ACTIVE', 'PARTIAL'] },
    },
  });

  const activeDebtTotal = activeDebts.reduce(
    (acc, d) => acc + Math.max(0, Number(d.totalDebt) - Number(d.paidAmount)),
    0
  );

  // 5. Today Cash Balance
  const todayCashFlows = await prisma.cashFlow.findMany({
    where: {
      userId,
      date: { gte: startOfToday, lte: endOfToday },
    },
  });

  const todayCashBalance = todayCashFlows.reduce((acc, c) => {
    const amt = Number(c.amount);
    return c.type === 'INCOME' ? acc + amt : acc - amt;
  }, 0);

  return {
    dailySales: {
      totalSales,
      transactionCount,
      itemCount,
    },
    stockAlerts,
    recentTransactions,
    activeDebtTotal,
    todayCashBalance,
  };
};

export const getFinancialReport = async (
  userId: string,
  period: ReportPeriod = 'month',
  offset = 0
) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();
  let periodLabel = '';

  if (period === 'week') {
    // Week calculations with offset
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    startDate = new Date(now);
    startDate.setDate(now.getDate() + distanceToMonday + offset * 7);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    periodLabel = `${startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  } else if (period === 'year') {
    const targetYear = now.getFullYear() + offset;
    startDate = new Date(targetYear, 0, 1, 0, 0, 0, 0);
    endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
    periodLabel = `Tahun ${targetYear}`;
  } else {
    // Month
    const targetMonth = now.getMonth() + offset;
    const targetYear = now.getFullYear() + Math.floor(targetMonth / 12);
    const normalizedMonth = ((targetMonth % 12) + 12) % 12;

    startDate = new Date(targetYear, normalizedMonth, 1, 0, 0, 0, 0);
    endDate = new Date(targetYear, normalizedMonth + 1, 0, 23, 59, 59, 999);
    periodLabel = startDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }

  // 1. Fetch transactions & items
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      createdAt: { gte: startDate, lte: endDate },
    },
    include: { items: true },
    orderBy: { createdAt: 'asc' },
  });

  const totalSales = transactions.reduce((acc, t) => acc + Number(t.totalAmount), 0);
  const transactionCount = transactions.length;

  let totalHpp = 0;
  const productSalesMap = new Map<
    string,
    { productBarcode: string; productName: string; quantity: number; totalSales: number }
  >();

  for (const t of transactions) {
    for (const item of t.items) {
      const itemHpp = item.quantity * Number(item.buyPrice);
      totalHpp += itemHpp;

      const existing = productSalesMap.get(item.productBarcode) ?? {
        productBarcode: item.productBarcode,
        productName: item.productName,
        quantity: 0,
        totalSales: 0,
      };

      existing.quantity += item.quantity;
      existing.totalSales += Number(item.subtotal);
      productSalesMap.set(item.productBarcode, existing);
    }
  }

  const grossProfit = totalSales - totalHpp;

  // 2. Fetch CashFlows in period
  const cashFlows = await prisma.cashFlow.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: 'asc' },
  });

  let totalIn = 0;
  let totalOut = 0;

  for (const c of cashFlows) {
    const amt = Number(c.amount);
    if (c.type === 'INCOME') {
      totalIn += amt;
    } else {
      totalOut += amt;
    }
  }

  const operationalExpenses = totalOut;
  const netProfit = grossProfit - operationalExpenses;
  const profitMargin = totalSales > 0 ? Number(((netProfit / totalSales) * 100).toFixed(2)) : 0;

  // 3. Top Products
  const topProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 5);

  // 4. Timeline
  const timelineMap = new Map<
    string,
    { date: string; label: string; sales: number; expense: number }
  >();

  for (const t of transactions) {
    const dateKey = t.createdAt.toISOString().slice(0, 10);
    const existing = timelineMap.get(dateKey) ?? {
      date: dateKey,
      label: new Date(dateKey).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      sales: 0,
      expense: 0,
    };
    existing.sales += Number(t.totalAmount);
    timelineMap.set(dateKey, existing);
  }

  for (const c of cashFlows) {
    if (c.type === 'EXPENSE') {
      const dateKey = c.date.toISOString().slice(0, 10);
      const existing = timelineMap.get(dateKey) ?? {
        date: dateKey,
        label: new Date(dateKey).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        sales: 0,
        expense: 0,
      };
      existing.expense += Number(c.amount);
      timelineMap.set(dateKey, existing);
    }
  }

  const timeline = Array.from(timelineMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  return {
    period: {
      period,
      offset,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      label: periodLabel,
    },
    financial: {
      totalSales,
      transactionCount,
      totalHpp,
      grossProfit,
      operationalExpenses,
      netProfit,
      profitMargin,
    },
    cashFlow: {
      totalIn,
      totalOut,
      balance: totalIn - totalOut,
    },
    topProducts,
    timeline,
  };
};
