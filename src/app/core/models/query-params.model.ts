import { FilterType } from '../enums/filter-by.enum';
import { OrderDirection } from '../enums/order-direction.enum';

export interface IQueryParams {
  orderBy: string;
  orderDirection: OrderDirection;
  perPage: number;
  currentPage: number;
  search?: string;
  filterType?: FilterType | string;
  status?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  dispatchEtaAtFrom?: string;
  dispatchEtaAtTo?: string;
  productSizeFrom?: string;
  productSizeTo?: string;
  quantityFrom?: string;
  quantityTo?: string;
  priceFrom?: string;
  priceTo?: string;
  typeOfPrint?: string;
  customer?: string;
  category?: string;
  type?: string;
}
