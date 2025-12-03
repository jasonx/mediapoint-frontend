import { ArtworkStatus } from '../enums/status.enum';
import { ICartSummaryData } from './cart.mode';
import { IFile } from './file.model';

export interface IArtworkData {
  cartId: number;
  cartJobIds: number[];
  cartDetails: ICartSummaryData;
  fileSetupGuide: IFileSetupGuide;
  contactEmail: string;
  extraContactEmail: string;
  artworkDetails: IArtworkDetails[];
  availableContactEmail: { [key: number]: string };
}

export interface IFileSetupGuide {
  name: string;
  title: string;
  content: string;
  attachment?: string;
}

export interface IArtworkDetails {
  jobId: number;
  artworks: IFile[];
}

export interface IArtworkRequest {
  contactEmail: string;
  extraContactEmail: string;
  artworks: IFile[];
}

export interface IArtworkItem extends IFile {
  rejectComment?: string;
  status: ArtworkStatus;
}
