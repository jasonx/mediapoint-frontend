export interface ICategory {
  id: number;
  name: string;
  seoDescriptionLeft: string;
  seoDescriptionRight: string;
  products: IProductByCategory[];
}
export interface IProductByCategory {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  image: string;
}

export interface IProduct {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  images: IProductImage[];
  iconsBar: IProductIcon[];
  labelsBar: IProductLabelsBar[];
  about: IProductAbout[];
  benefits: IProductBenefits[];
  sustainabilities: IProductSustainabilities[];
  faqs: IProductFaqs[];
  downloads: IProductDownloads[];
  specifications: IProductSpecifications[];
  testimonials: string[];
}

export interface IProductImage {
  id: number;
  url: string;
  name: string;
  size: number;
}

export interface IProductIcon {
  id: number;
  tooltip: string;
  type: string;
  icon: string;
  color: string | null;
}

export interface IProductLabelsBar {
  id: number;
  title: string;
  type: string;
  color: string;
  iconUrl: string;
}

export interface IProductAbout {
  id: number;
  title: string;
  content: string;
  type: string;
  sort: number;
  published: boolean;
}

export interface IProductBenefits {
  id: number;
  title: string;
  content: string;
  type: string;
  sort: number;
  published: boolean;
  imageUrl: string | null;
}

export interface IProductSustainabilities {
  id: number;
  title: string;
  content: string;
  type: string;
  sort: number;
  published: boolean;
  imageUrl: string;
}

export interface IProductFaqs {
  id: number;
  title: string;
  content: string;
  type: string;
  sort: number;
  published: boolean;
}
export interface IProductDownloads {
  id: number;
  title: string;
  content: string;
  type: string;
  sort: number;
  published: boolean;
  downloadAttachment: IProductDownloadAttachment[];
}

export interface IProductDownloadAttachment {
  id: number;
  url: string;
  name: string;
  size: number;
}

export interface IProductSpecifications {
  propertyId: number;
  propertyTitle: string;
  propertyOption: {
    isActive: boolean;
    titleOption: string;
  }[];
  validationRules: {
    name: string;
    parameters: number;
  }[];
}

export enum ProductTabs {
  ABOUT = 'About',
  BENEFITS = 'Benefits',
  SUSTAINABILITY = 'Sustainability',
  FAQ = 'FAQ',
  DOWNLOAD = 'Download',
  SPECIFICATIONS = 'Specifications',
  TESTIMONIALS = 'Testimonials',
}
