export interface IBaseTitle {
  id: number | string;
  title: string;
}

export interface IBaseLabel {
  id: number;
  label: string;
}

export interface IListData {
  title: string;
  value: string;
}

export interface IPagination {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
}
