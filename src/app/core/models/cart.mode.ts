import { AddressType } from '../enums/address-type.enum';
import { ArtworkStatus, JobStatus } from '../enums/status.enum';
import { IListData } from './base.model';
import { ICredit } from './confirm-and-payment.model';
import { DeliveryType } from './delivery-details.model';
import { IPriceDetails } from './price-details.model';

export interface ICartData extends ICartSummaryData {
  jobs: {
    id: string;
    image: string;
    title: string;
    jobDetails: IListData[];
    price: number;
  }[];
}

export interface ICartSummaryData extends ICartSummary {
  cartId: string;
  cartJobIds: number[];
  proofApprovalDate: string;
  dispatchDate: string;
  deliveryType: DeliveryType;
  shippingMethodId?: string;
  checkoutHistory: {
    currentStep: string;
    nextStep: 'delivery' | 'artworks' | 'checkout';
    previousStep: string | null;
  };

  steps: {
    currentStep: CartDeliverySteps;
    completedSteps: {
      type: DeliveryType;
      package: {
        packageId: number;
        title: string;
        description: string;
        price: number;
      };
      address: {
        addressType: AddressType;
        suburb: string;
      };
      deliveryMethodId: number;
    };
  };
}

export interface ICartSummary {
  priceDetails: IPriceDetails;
  productionTime: number;
  estimationShippingTime: number | 'N/A';
  packagingInformation: IPackagingInformation | null;
  packages: IPackages[];
  addressDetails: {
    addressType: AddressType;
    compiledAddress: string;
    postcode: string;
    state: string;
    suburb: string;
  };
  carrierDisplayName: string;
}

export interface IPackages {
  jobId: number;
  jobTitle: string;
  depth: number;
  length: number;
  weight: number;
  width: number;
  quantity: number;
}

export interface IPackagingInformation {
  wording: string;
  availablePackages: {
    jobId: number;
    jobTitle: string;
    selectablePackages: {
      id: number;
      default: string;
      isSelected: boolean;
      packageType: string;
      price: string;
      title: string;
    }[];
  }[];
}

export interface IDeliveryMethod {
  shippingVendor: string;
  fromLocationId: number;
  toLocationId: string;
  carrierId: number;
  carrierDisplayName: string;
  carrierServiceId: string;
  carrierServiceDisplayName: string;
  carrierAccountId: number;
  carrierAccountName: string;
  companyCarrierAccountId: number;
  priceDisplay: number;
  totalDays: number;
  totalBusinessDays: number;
  despatchDateLocal: string;
  etaLocal: string;
}

export interface ICartDeliveryData {
  deliveryDetails: {
    deliveryType: DeliveryType;
    shippingVendor: string;
    packageId: number;
    addressType: AddressType;
    suburb: string;
    deliveryMethodId: number;
    type: DeliveryType;
  };
  packagingInformation: IPackagingInformation | null;
  currentStep: CartDeliverySteps;
  completedSteps: {
    type: DeliveryType;
    package: {
      packageId: number;
      title: string;
      description: string;
      price: number;
    };
    address: {
      addressType: AddressType;
      suburb: string;
    };
    deliveryMethodId: number;
  };
  summary: ICartSummary;
  message: string;
}

export interface IShippingLocations {
  locationId: number;
  suburbPostcode: string;
}

export interface IArtworksData {
  allQuantityApplied: boolean;
  cartDetails: ICartSummaryData;
  artworkDetails: IArtworkDetails[];
  deliveryDetails: IListData[];
  useCredit: ICredit;
}

export interface IArtworkDetails {
  jobId: number;
  price: number;
  artworkImageUrl: string;
  productName: string;
  status: JobStatus;
  jobDetails: IListData[];
}
export interface IArtwork {
  id: number;
  url: string;
  previewUrl: string;
  name: string;
  size: 0;
}

export interface IArtworksDataByJobId {
  cartId: string;
  jobId: string;
  labelSize: string;
  numberOfKinds?: number;
  numberOfSavedKinds: number;
  productName: string;
  totalQuantity: number;
  artworks: IUploadedArtwork[];
  jobSides: 'single' | 'double';
}

export interface IUploadedArtwork {
  id: string;
  fileName: string | null;
  url: string | null;
  quantity: number;
  rejectComment: string;
  othersErrors: string;
  previewUrl: string | null;
  imageSize: string;
  status: ArtworkStatus;
  kindSerialNumber: number;
  side: 'front' | 'rear';
}

export enum CartDeliverySteps {
  Type = 'type',
  Package = 'package',
  Address = 'address',
  deliveryMethodId = 'delivery_method',
}

export interface ISplitArtwork {
  parentArtworkId: number;
  children: IUploadedArtwork[];
}
