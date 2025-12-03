import { JobStatus, OrderStatus } from '../enums/status.enum';
import { IListData } from './base.model';
import { ICredit } from './confirm-and-payment.model';
import { IFile } from './file.model';
import { IJob } from './job.model';
import { IPriceDetails } from './price-details.model';

export interface IOrderItem {
  id: string;
  createdBy: string;
  poNumber: number;
  dispatchEta: string;
  totalPrice: string;
  customer: string;
  accepted: string;
  status: OrderStatus;
  jobs: IOrderJobItem[];
  jobEntered: string;
  isXmlAvailable: boolean;
}

export interface IOrderJobItem {
  id: string;
  orederId: string;
  productIcon: string;
  productName: string;
  quantity: number;
  accepted: string;
  jobEntered: string;
  price: number;
  status: JobStatus;
  artworks: IFile[];
  errorArtwork: boolean;
}

export interface IOrderDetails {
  id: string;
  price: number;
  status: OrderStatus;
  orderDetails: IOrderPriceDetails;
  dateOfProcessing: {
    accepted: string;
    jobEntered: string;
    dispatchEta: string;
  };
  jobs: IJob[];
  priceDetails: IPriceDetails;
  freightDetails: IListData[];
  useCredit: ICredit;
}

export interface IOrderPriceDetails {
  deliveryTracking: string;
  createdBy: string;
  poNumber: string;
  numberOfJobs: number;
  weight: string;
}

export interface IOrderJobDetails extends IJob {
  priceDetails: IPriceDetails;
}

export interface IStatusChangesData {
  order?: IStatusChangesItem<OrderStatus>;
  orders?: IStatusChangesItem<OrderStatus>[];
  jobs?: IStatusChangesItem<JobStatus>[];
}

export interface IStatusChangesItem<T> {
  id: string;
  oldStatus: T;
  newStatus?: T;
}

export interface IOrderRedirectData {
  message: string;
  redirectData: {
    step: CreateOrderStep;
    entityId: string;
  };
}

export enum CreateOrderStep {
  ComposeAProduct = 'compose-a-product',
  ReviewTheCart = 'review-the-cart',
  DeliveryDetails = 'delivery-details',
  Artwork = 'artwork',
  Confirm = 'confirm',
}
