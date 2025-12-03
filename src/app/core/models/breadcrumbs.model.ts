export interface IBreadcrumbs {
  name: string;
  url?: BreadcrumbsType;
}

export type BreadcrumbsType = string | 'back';
