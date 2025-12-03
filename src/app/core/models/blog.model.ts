import { IPagination } from './base.model'

export interface IBlogData extends IPagination {
  data: IGeneralArticle[];
}

export interface IGeneralArticle {
  id: number,
  title: string,
  content: string,
  previewContent: string,
  imageUrl: string,
  slug: string,
  createdAt: string,
  updatedAt: string,
  publishedAt: string,
  blogPostCategoryId: 0,
  blogPostCategory: IBlogPostCategory,
}

export interface IBlogPostCategory {
  id: 0,
  title: string,
  name: string
}
