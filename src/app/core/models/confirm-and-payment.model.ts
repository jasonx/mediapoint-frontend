import { IArtworkDetails } from './artwork.model';
import { IListData } from './base.model';
import { ICartSummaryData } from './cart.mode';
import { IJobTableData } from './table.model';

export interface IConfirmationData {
  cartId: string;
  cartJobIds: number[];
  cartDetails: ICartSummaryData;
  deliveryDetails: IListData[];
  artworkDetails: IArtworkDetails[];
  orderSummary: IJobTableData[];
  useCredit: ICredit;
}

export interface ICredit {
  isCreditEnabled: boolean;
  hasEnoughCredits: boolean;
}

export enum CardFieldType {
  Name = 'NAME',
  Number = 'NUMBER',
  Expiry = 'EXPIRY',
  Cvn = 'CVN',
}

export const EWAY_ERRORS = [
  {
    type: CardFieldType.Name,
    keys: 'V6021',
    text: 'Invalid card name',
  },
  {
    type: CardFieldType.Number,
    keys: 'V6022',
    text: 'Invalid card number',
  },
  {
    type: CardFieldType.Expiry,
    keys: 'V6033',
    text: 'Invalid expiry date',
  },
  {
    type: CardFieldType.Cvn,
    keys: 'V6023',
    text: 'Invalid cvn',
  },
];
