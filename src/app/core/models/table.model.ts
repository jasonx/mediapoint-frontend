export interface ITableRequest<T> {
  data: T;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

export interface IJobTableData {
  id: number;
  productType: string;
  typeOfPrint?: string;
  size: string;
  quantity: number;
  numberOfKinds: number;
  totalQuantity: number;
  price: string;
}
