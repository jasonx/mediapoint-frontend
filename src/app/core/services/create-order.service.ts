import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { IDialogConfig } from '../models/dialog-config.model';
import { ApiService } from './api.service';
import { API_URL, UrlGenerator } from './api-urls';
import {
  IComposeProduct,
  IComposeProductResponse,
  IGlobalError,
  IQuantityPrice,
  IQuantityPricePostData,
  ISummary,
  IWidgetPostData,
} from '../models/compose-product.model';
import { WidgetsKey } from '../enums/widget-key.enum';

@Injectable({
  providedIn: 'root',
})
export class CreateOrderService {
  // TODO: delete
  public jobs: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
  public cartId: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public quoteReference: BehaviorSubject<string> = new BehaviorSubject<string>(
    ''
  );
  ///////

  public widgetDataToSave: BehaviorSubject<IWidgetPostData> =
    new BehaviorSubject({} as IWidgetPostData);
  public isLoadedWidget: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public summary = new BehaviorSubject<ISummary | null>(null);
  public isCanAddToCart: boolean;
  private widgetErrors: IGlobalError[] = [];
  public jobIdUnsavedParams: string | null;

  dialogConfig: IDialogConfig = {
    title: 'Cancel order?',
    message:
      'Are you sure you want to leave the ordering process? You can save the current setup as the quote and get back to it later',
    acceptButtonText: 'Delete order',
    declineButtonText: 'Save as quote ',
    informationButtonText: 'Continue order',
  };

  constructor(
    public router: Router,
    public dialog: MatDialog,
    private readonly apiService: ApiService
  ) {}

  getAllWidgets(
    productId: number,
    jobId?: string | null
  ): Observable<IComposeProduct | IComposeProductResponse> {
    return this.apiService.get(
      jobId
        ? UrlGenerator.generate(API_URL.COMPOSE_PRODUCTS_BY_ID, { id: jobId })
        : UrlGenerator.generate(API_URL.FIST_STEP_BY_PRODUCT_ID, { productId })
    );
  }

  postWidgetData(
    productId: number,
    jobId: string | null,
    postData: IWidgetPostData
  ): Observable<IComposeProductResponse> {
    return jobId
      ? this.apiService.patch(
          UrlGenerator.generate(API_URL.COMPOSE_PRODUCTS_BY_ID, { id: jobId }),
          postData
        )
      : this.apiService.post(
          UrlGenerator.generate(API_URL.COMPOSE_PRODUCTS_BY_ID, {
            id: productId,
          }),
          postData
        );
  }

  calculatePrice(
    jobId: string,
    postData: IQuantityPricePostData
  ): Observable<IQuantityPrice> {
    return this.apiService
      .post(UrlGenerator.generate(API_URL.CALCULATE_PRICE, { jobId }), postData)
      .pipe(
        tap((data: IQuantityPrice) => {
          this.summary.next(data.summary);
          this.isCanAddToCart = true;
        })
      );
  }

  addToCart(jobId: string): Observable<{ message: string }> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.ADD_TO_CART, { jobId })
    );
  }

  deleteJob(jobId: string): Observable<{ message: string }> {
    return this.apiService.delete(
      UrlGenerator.generate(API_URL.JOB_BY_ID, { jobId })
    );
  }

  saveParams(jobId: string): Observable<{ message: string }> {
    return this.apiService
      .post(UrlGenerator.generate(API_URL.SAVE_JOB_PARAMETERS, { jobId }))
      .pipe(tap(() => (this.jobIdUnsavedParams = null)));
  }

  setGlobalError(key: WidgetsKey, errorMessage: string): void {
    const widgetByKey = this.widgetErrors.find((w) => w.key === key);

    widgetByKey
      ? (widgetByKey.errorMessage = errorMessage)
      : this.widgetErrors.push({ key, errorMessage });
  }

  resetGlobalError(): void {
    this.widgetErrors = [];
  }

  getGlobalError(key: WidgetsKey): string {
    return this.widgetErrors.find((e) => e.key === key)?.errorMessage || '';
  }

  get isGlobalError(): boolean {
    return this.widgetErrors.some((e) => e.errorMessage);
  }
}
