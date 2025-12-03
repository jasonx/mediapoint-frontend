import { IJob } from './job.model';
import { IPriceDetails } from './price-details.model';

// TODO: delete
export interface ICart {
  cartId: number;
  proofApprovalDate: string;
  timeCutOff: string;
  dispatchDate: string;
  nextCutOff: string;
  priceDetails: IPriceDetails;
  jobs: IJob[];
  cartJobIds: number[];
}
