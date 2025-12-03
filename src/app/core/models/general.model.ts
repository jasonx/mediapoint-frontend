export interface IGeneralInfo {
  categories: ICategoriesMenu[];

  header1: string;
  header2: string;
  header3: string;
  nextCutOff: string;
  stickyBar: {
    textBar: string;
    turnBar: boolean;
  };

  footerContactAddress: string;
  footerContactEmail: string;
  footerContactTelephone: string;
  footerContactWorking: string;
  footerSocialFacebook: string;
  footerSocialInstagram: string;
  footerSocialLinkedin: string;

  total: number;

  user: IGeneralCartIds;
}

export interface ICategoriesMenu {
  id: number;
  name: string;
  slug: string;
  subcategories: ISubcategoriesMenu[],
}

export interface ISubcategoriesMenu {
  id: number,
  name: string,
  slug: string;
  products: IProductMenu[]
}

export interface IProductMenu {
  id: number;
  imageUrl: string;
  shortDescription: string;
  title: string;
  categorySlug: string;
  slug: string;
  categoryName: string;
  categoryId: number;
  promoLabels: IPromoLabel[];
}

export interface IPromoLabel {
  id: number;
  color: string;
  iconUrl?: string;
  title: string;
}

export interface IGlobalSearch {
  products: IProductMenu[];
  categories: ISearchCategory[];
  message?: string;
}

export interface ISearchCategory {
  id: number;
  title: string;
  slug: string;
}
export interface IGeneralCartIds {
  cartId: string;
  orderId: string;
  quoteId: string;
}
