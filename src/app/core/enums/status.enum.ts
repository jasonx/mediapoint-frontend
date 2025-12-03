export enum QuotesStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Expired = 'expired',
  Incomplete = 'incomplete',
}

export enum InvoiceStatus {
  Paid = 'paid',
  NotPaid = 'not paid',
  Refunded = 'refunded',
}

export enum OrderStatus {
  awaitingDeliveryInformation = 'awaiting delivery information',
  awaitingArtwork = 'awaiting artwork',
  awaitingPayment = 'awaiting payment',
  awaitingProof = 'awaiting proof',
  proofAwaitingApproval = 'proof awaiting approval',
  production = 'production',
  complete = 'complete',
  canceled = 'canceled',
  artworkError = 'artwork error',
  dispatched = 'dispatched',
  readyForPickup = 'ready for pickup',
}

export const orderStatusArray: IStatusGroup[] = [
  {
    status: OrderStatus.awaitingDeliveryInformation,
    groupIndex: 0,
  },
  {
    status: OrderStatus.awaitingArtwork,
    groupIndex: 0,
  },
  {
    status: OrderStatus.awaitingPayment,
    groupIndex: 0,
  },
  {
    status: OrderStatus.awaitingProof,
    groupIndex: 1,
  },
  {
    status: OrderStatus.proofAwaitingApproval,
    groupIndex: 2,
  },
  {
    status: OrderStatus.production,
    groupIndex: 3,
  },
  {
    status: OrderStatus.dispatched,
    groupIndex: 3,
  },
  {
    status: OrderStatus.readyForPickup,
    groupIndex: 3,
  },
  {
    status: OrderStatus.complete,
    groupIndex: 4,
  },
  {
    status: OrderStatus.canceled,
    groupIndex: 5,
  },
];

export enum JobStatus {
  awaitingArtwork = 'awaiting artwork',
  awaitingPayment = 'awaiting payment',
  awaitingProof = 'awaiting proof',
  proofAwaitingApproval = 'proof awaiting approval',
  proofApproved = 'proof approved',
  prepressReady = 'prepress ready',
  printReady = 'print ready',
  finishingReady = 'finishing ready',
  complete = 'complete',
  canceled = 'canceled',
  artworkError = 'artwork error',
  dispatched = 'dispatched',
  readyForPickup = 'ready for pickup',
}

export const jobStatusArray: IStatusGroup[] = [
  {
    status: JobStatus.awaitingArtwork,
    groupIndex: 0,
  },
  {
    status: JobStatus.awaitingPayment,
    groupIndex: 0,
  },
  {
    status: JobStatus.awaitingProof,
    groupIndex: 1,
  },
  {
    status: JobStatus.proofAwaitingApproval,
    groupIndex: 2,
  },
  {
    status: JobStatus.proofApproved,
    groupIndex: 3,
  },
  {
    status: JobStatus.prepressReady,
    groupIndex: 3,
  },
  {
    status: JobStatus.printReady,
    groupIndex: 3,
  },
  {
    status: JobStatus.finishingReady,
    groupIndex: 3,
  },
  {
    status: JobStatus.dispatched,
    groupIndex: 3,
  },
  {
    status: JobStatus.readyForPickup,
    groupIndex: 3,
  },
  {
    status: JobStatus.complete,
    groupIndex: 4,
  },
  {
    status: JobStatus.canceled,
    groupIndex: 5,
  },
];

export type Status = QuotesStatus | InvoiceStatus | OrderStatus | JobStatus;

export interface IStatusGroup {
  status: Status;
  groupIndex: number;
}

export enum ArtworkStatus {
  created = 'created',
  adminApproved = 'admin-approved',
  adminRejected = 'admin-rejected',
  clientApproved = 'client-approved',
  clientRejected = 'client-rejected',

  // New
  awaitingProof = 'awaiting proof',
  proofAwaitingApproval = 'proof awaiting approval',
  artworkError = 'artwork error',
}

export enum ProductionStatus {
  proofApproved = 'proof approved',
  prepressReady = 'prepress ready',
  printReady = 'print ready',
  finishingReady = 'finishing ready',
  complete = 'complete',
}
