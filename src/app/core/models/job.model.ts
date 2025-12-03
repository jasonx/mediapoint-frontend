import { JobStatus } from '../enums/status.enum';
import { IArtworkItem } from './artwork.model';
import { IListData } from './base.model';

export interface IJob {
  id: string;
  price: number;
  status: JobStatus;
  artworks?: IArtworkItem[];
  jobDetails: IListData[];
}
