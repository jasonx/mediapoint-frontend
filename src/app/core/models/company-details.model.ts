export interface ICompanyDetails {
  abn: string;
  address1: string;
  address2: string;
  companyLogo: string;
  companyName: string;
  contactOptions: IOption[];
  email: string;
  mainContactId: number;
  phone: string;
  postcode: string;
  secondaryEmail: string;
  defaultProofEmailOptions: IOption[];
  defaultProofEmailId: number;
  state: string;
  suburb: string;
  website: string;
}

export interface IOption {
  id: number;
  label: string;
}
