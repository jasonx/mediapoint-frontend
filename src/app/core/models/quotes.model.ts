import { QuotesStatus } from '../enums/status.enum';
import { IJob } from './job.model';
import { IPriceDetails } from './price-details.model';

export interface IQuoteItem {
  id: string;
  quoteReference: string;
  createdAt: string;
  validUntil: string;
  createdBy: string;
  price: number;
  status: QuotesStatus;
}

export interface IQuoteJob {
  id: string;
  quoteReference?: string;
  validUntil: string;
  status: QuotesStatus;
  jobs: IJob[];
  priceDetails: IPriceDetails;
}
