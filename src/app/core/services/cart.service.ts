import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, map, Observable, of, switchMap, tap } from 'rxjs';
import { API_URL, UrlGenerator } from './api-urls';
import {
  IArtworksData,
  IArtworksDataByJobId,
  ICartData,
  ICartDeliveryData,
  IDeliveryMethod,
  IShippingLocations,
  ISplitArtwork,
  IUploadedArtwork,
} from '../models/cart.mode';
import { IDeliveryDetailsData } from '../models/delivery-details.model';
import { AuthorizationService } from './authorization.service';
import { IGeneralCartIds, IGeneralInfo } from '../models/general.model';
import { PlatformDetectorService } from './platform-detector.service';
import { environment } from 'src/environments/environment';
import { toCamelObj } from 'src/app/shared/utils/camel';
import { IArtworkItem } from '../models/artwork.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private pusher: any;
  public updatedArtwork$ = new BehaviorSubject<IUploadedArtwork | null>(null);
  public updatedSplitArtwork$ = new BehaviorSubject<ISplitArtwork | null>(null);

  constructor(
    private apiService: ApiService,
    private authService: AuthorizationService,
    private platformDetectorService: PlatformDetectorService
  ) {}

  get cartId(): string {
    return this.authService.generalInfo$.value.user.cartId;
  }

  get quoteId(): string {
    return this.authService.generalInfo$.value.user.quoteId;
  }

  getCartData(): Observable<ICartData> {
    return this.apiService.get(API_URL.CART).pipe(
      tap((d) => {
        this.authService.generalInfo$.next({
          ...this.authService.generalInfo$.value,
          user: {
            ...this.authService.generalInfo$.value.user,
            cartId: d.cartId,
          },
        });
      })
    );
  }

  getCartPdf(): Observable<File> {
    return this.apiService.getBlob(
      UrlGenerator.generate(API_URL.CART_PDF, { cartId: this.cartId })
    );
  }

  deleteCart(cartId: string): Observable<{ message: string }> {
    return this.apiService
      .delete(UrlGenerator.generate(API_URL.CART_BY_ID, { cartId }))
      .pipe(
        tap(() => {
          this.authService.generalInfo$.next({
            ...this.authService.generalInfo$.value,
            user: {} as IGeneralCartIds,
          });
        })
      );
  }

  createQuote(): Observable<{ message: string; quoteId: number }> {
    const postAPI = UrlGenerator.generate(API_URL.CART_CREATE_QUOTE, {
      cartId: this.cartId,
    });

    return this.apiService.post(postAPI).pipe(
      tap((data) => {
        this.authService.generalInfo$.next({
          ...this.authService.generalInfo$.value,
          user: {
            ...this.authService.generalInfo$.value.user,
            quoteId: 'Q' + data.quoteId,
          },
        });
      })
    );
  }

  saveAsQuote(quoteReference?: string): Observable<{ message: string }> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.SAVE_AS_QUOTE, { cartId: this.cartId }),
      {
        quoteReference,
      }
    );
  }

  // Delivety method
  getDeliveryMethods(): Observable<IDeliveryMethod[]> {
    return this.apiService.get(API_URL.SHIPPING_METHODS);
  }

  saveDeliveryStep(value: any): Observable<ICartDeliveryData> {
    return this.apiService.patch(API_URL.DELIVERY_DETAILS, value);
  }

  getShippingLocations(value: string): Observable<IShippingLocations[]> {
    return this.apiService.get(API_URL.SHIPPING_LOCATIONS + `?query=${value}`);
  }

  // Delivery
  getDeliveryDetails(): Observable<IDeliveryDetailsData | null> {
    return this.authService.generalInfo$.pipe(
      switchMap((info: IGeneralInfo) => {
        if (!info.user) {
          return of(null);
        }

        const quoteId = info.user.quoteId;

        return this.apiService.get(
          UrlGenerator.generate(API_URL.DELIVERY_DETAILS_BY_ID, {
            quoteId,
          })
        );
      })
    );
  }

  submitDeliveryDetails(deliveryDate: any): Observable<{ message: string }> {
    return this.apiService.postFormData(
      UrlGenerator.generate(API_URL.DELIVERY_DETAILS_BY_ID, {
        quoteId: this.quoteId,
      }),
      deliveryDate
    );
  }

  deleteMedia(mediaId: number): Observable<{ message: string }> {
    return this.apiService.delete(
      UrlGenerator.generate(API_URL.DELIVERY_DETAILS_MEDIA, {
        quoteId: this.quoteId,
        mediaId,
      })
    );
  }

  // Artwork
  getArtworks(): Observable<IArtworksData> {
    return this.authService.generalInfo$.pipe(
      switchMap((info: IGeneralInfo) => {
        if (!info.user) {
          return of(null);
        }

        const cartId = info.user.cartId;

        return this.apiService.get(
          UrlGenerator.generate(API_URL.ARTWORKS, {
            cartId,
          })
        );
      })
    );
  }

  getArtworksByJobId(jobId: number | string): Observable<IArtworksDataByJobId> {
    return this.authService.generalInfo$.pipe(
      switchMap((info: IGeneralInfo) => {
        if (!info.user) {
          return of(null);
        }

        const cartId = info.user.cartId;

        return this.apiService.get(
          UrlGenerator.generate(API_URL.ARTWORKS_BY_JOB_ID, {
            cartId,
            jobId,
          })
        );
      })
    );
  }

  changeQuantity(artworkId: string, quantity: number): Observable<any> {
    return this.apiService.patch(
      UrlGenerator.generate(API_URL.ARTWORKS_QUANTITY, {
        cartId: this.authService.generalInfo$.value.user.cartId,
        artworkId,
      }),
      { quantity }
    );
  }

  deleteArtwork(
    cartId: string,
    artworkId: string,
    query: string = ''
  ): Observable<IUploadedArtwork[]> {
    return this.apiService.delete(
      UrlGenerator.generate(API_URL.ARTWORKS_BY_ID + query, {
        cartId,
        artworkId,
      })
    );
  }

  createEmptyArtwork(
    cartId: string,
    jobId: string
  ): Observable<IUploadedArtwork[]> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.CREATE_EMPTY_ARTWORKS, {
        cartId,
        jobId,
      })
    );
  }

  trimbox(artworkIds: number[]): Observable<{ message: string }> {
    return this.apiService.post(API_URL.TRIM, { artworkIds, force: true });
  }

  scale(artworkIds: number[]): Observable<{ message: string }> {
    return this.apiService.post(API_URL.SCALE, { artworkIds, force: true });
  }

  rotate(artworkIds: number[]): Observable<{ message: string }> {
    return this.apiService.post(API_URL.ROTATE, { artworkIds, degrees: 90 });
  }

  retry(artworkIds: number[]): Observable<{ message: string }> {
    return this.apiService.post(API_URL.RETRY, {
      artworkIds,
      onlyFailed: true,
    });
  }

  resetAll(jobId: string, cartId: string): Observable<IUploadedArtwork[]> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.RESET_ALL, { jobId, cartId })
    );
  }

  getArtworkById(
    jobId: string,
    artworkId: string
  ): Observable<IUploadedArtwork> {
    return this.authService.generalInfo$.pipe(
      switchMap((info: IGeneralInfo) => {
        if (!info.user) {
          return of(null);
        }

        const cartId = info.user.cartId;

        return this.apiService.get(
          UrlGenerator.generate(API_URL.GET_ARTWORK_BY_ID, {
            cartId,
            jobId,
            artworkId,
          })
        );
      })
    );
  }

  complete(jobId: string, cartId: string): Observable<{ message: string }> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.ARTWORKS_COMPLETE, { jobId, cartId })
    );
  }

  connectPusherArtworkSplit(jobId: string): void {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn && this.platformDetectorService.isBrowser()) {
        import('pusher-js/with-encryption').then((p) => {
          this.pusher = new p.default(environment.pusher_key, {
            cluster: 'mt1',
            wsHost: environment.wsHost,
            wsPort: 6001,
            forceTLS: false,
            enabledTransports: ['ws'],
            channelAuthorization: {
              transport: 'ajax',
              endpoint: environment.pusher_url + '/broadcasting/auth',
              headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + this.authService.token,
              },
            },
          });
          const channel = this.pusher.subscribe('private-jobs.' + jobId);

          channel.bind('artwork-split-completed', (data: ISplitArtwork) => {
            this.updatedSplitArtwork$.next(toCamelObj(data));
          });
        });
      }
    });
  }

  cancelArtworkSplitChanel(jobId: string): void {
    if (this.platformDetectorService.isBrowser()) {
      this.pusher.unsubscribe('jobs.' + jobId);
      this.updatedSplitArtwork$.next(null);
    }
  }

  connectPusher(): void {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn && this.platformDetectorService.isBrowser()) {
        import('pusher-js/with-encryption').then((p) => {
          this.pusher = new p.default(environment.pusher_key, {
            cluster: 'mt1',
            wsHost: environment.wsHost,
            wsPort: 6001,
            forceTLS: false,
            enabledTransports: ['ws'],
            channelAuthorization: {
              transport: 'ajax',
              endpoint: environment.pusher_url + '/broadcasting/auth',
              headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + this.authService.token,
              },
            },
          });
          const channel = this.pusher.subscribe(
            'private-user-artwork-notifications.' + this.authService.userId
          );

          channel.bind('artwork-notification', (artwork: IUploadedArtwork) => {
            this.updatedArtwork$.next(toCamelObj(artwork));
          });
        });
      }
    });
  }

  cancelSubscriptionChanel(): void {
    if (this.platformDetectorService.isBrowser()) {
      this.pusher.unsubscribe(
        'private-user-artwork-notifications.' + this.authService.userId
      );
    }
  }

  // Payment
  createOrder(): Observable<{ message: string; orderId: number }> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.CREATE_ORDER_IN_CART, {
        cartId: this.cartId,
      })
    );
  }

  paymentComplete(
    securedCardData: string,
    cartId: string = this.cartId
  ): Observable<{
    message: string;
    errors: string[];
  }> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.PAYMENT_COMPLETE, { cartId }),
      { securedCardData }
    );
  }

  acceptAllProofs(orderId: number): Observable<IArtworkItem[]> {
    return this.apiService
      .post(UrlGenerator.generate(API_URL.ACCEPT_ALL_PROOFS, { orderId }))
      .pipe(map((d) => d.artworks));
  }
}
