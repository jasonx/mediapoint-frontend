import { FilterType } from '../enums/filter-by.enum';
import { IBaseLabel } from './base.model';
import { IOption } from './company-details.model';

export interface IFilter {
  status?: string;
  startDate?: string;
  endDate?: string;
  priceFrom?: string;
  priceTo?: string;
  productSizeFrom?: string;
  productSizeTo?: string;
  quantityFrom?: string;
  quantityTo?: string;
  typeOfPrint?: IOption;
  customer?: IOption;
}

export interface IFilterConfig {
  isLoaded: boolean;
  filterType?: FilterType;
  statuses?: any[];

  isFilterDate?: boolean;
  filterDateTitle?: string;
  maxCreatedAt?: Date;
  minCreatedAt?: Date;

  isFilterPrise?: boolean;
  minPrice?: number;
  maxPrice?: number;

  isSizeRange?: boolean;
  isQuantity?: boolean;
  isFilterStatus?: boolean;

  typeOfPrint?: IOption[];
  customers?: IOption[];
  categories?: IBaseLabel[];
}

export interface IFilterDefaultValues {
  customers?: IOption[];
  products?: IOption[];
  maxCreatedAt?: Date;
  minCreatedAt?: Date;
  maxDispatchEtaAt?: Date;
  minDispatchEtaAt?: Date;
  maxPrice?: number;
  minPrice?: number;
  categories?: IBaseLabel[];
}
