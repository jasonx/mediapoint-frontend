import { OrderStatus } from '../enums/status.enum';

export enum BarChartsTab {
  Daily = 'daily',
  Monthly = 'monthly',
  Yearly = 'yearly',
}

export enum DoughnutChartsTab {
  Today = 'today',
  Yesterday = 'yesterday',
  CurrentMonth = 'current month',
}

export interface IDashboardAdmin extends IChartBarData {
  productData: IChartDoughnutData[];
  recentOrders: IRecentOrder[];
}

export interface IChartBarData {
  dailySales: ISales[];
  monthSales: ISales[];
  yearSales: ISales[];
}

export interface ISales {
  orderPrice?: string;
  quotePrice?: string;
  date: string;
}

export interface IChartDoughnutData {
  icon: string;
  title: string;
  today: string | null;
  yesterday: string | null;
  currentMonth: string | null;
}

export interface IRecentOrder {
  createdAt: string;
  id: number;
  price: number;
  status: OrderStatus;
  companyName?: string;
  creatorName?: string;
}

export interface IBarFilteredData {
  byDays: IBarItem;
  byMonths: IBarItem;
  byYears: IBarItem;
}

export interface IBarItem {
  labels: string[] | number[];
  orderData: number[];
  quoteData: number[];
}

export interface IDashboardCustomer {
  products: IProductList[];
  recentOrders: IRecentOrder[];
  recentQuotes: IRecentQuote[];
}

export interface IProductList {
  id: number;
  description: string;
  imageUrl: string;
  title: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  slug: string;
}

export interface IRecentQuote {
  createdAt: string;
  id: number;
}

export interface ICategoryList {
  id: number;
  description: string;
  image: string;
  title: string;
  slug: string;
}
