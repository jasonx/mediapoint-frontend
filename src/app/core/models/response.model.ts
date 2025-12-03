export interface ApiResponse<IData = any> {
  error: boolean;
  data: IData;
  message: string;
  errors: any;
  status: string;
}
