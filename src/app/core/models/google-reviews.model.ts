export interface IGoogleReviews {
  rating: number;
  reviewCount: number;
  reviews: IReview[];
}

export interface IReview {
  authorName: string;
  authorPhotoUrl: string;
  profileUrl: string;
  rating: number;
  text: string;
}
