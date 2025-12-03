export interface IPriceDetails {
  subTotal: string | number | null;
  package: number | null;
  shipping?: number | null;
  gst: string | number | null;
  total: number | null;
  shippingPrice?: string | null;
  voucher?: string | null;
  amountDue?: string | null;
  numberOfJobs?: number;
}
