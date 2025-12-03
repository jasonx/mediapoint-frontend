import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthorizationService } from './authorization.service';
import { API_URL } from './api-urls';
import { ApiService } from './api.service';
import { IGlobalSearch } from '../models/general.model';
import { PlatformDetectorService } from './platform-detector.service';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private _cutOff: string;
  public headerHeight$ = new BehaviorSubject<number>(40);
  public cartCounter: number = 0;

  constructor(
    private authorizationService: AuthorizationService,
    private apiService: ApiService,
    private platformDetectorService: PlatformDetectorService
  ) {}

  get timer(): string {
    return this._cutOff;
  }

  setTimer(input: string): void {
    if (this.platformDetectorService.isBrowser()) {
      const countDownDate = new Date(input).getTime();
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = countDownDate - now;
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        this._cutOff = `${days ? days + 'd ' : ''}${hours ? hours + 'h ' : ''}${
          minutes ? minutes + 'm ' : ''
        }`;

        if (distance < 0) {
          clearInterval(interval);
          this._cutOff = 'Expired';
        }
      }, 1000);
    }
  }

  globalSearch(text: string): Observable<IGlobalSearch> {
    return this.apiService.get(API_URL.GLOBAL_SEARCH + '?search=' + text);
  }

  connectPusher(): void {
    if (this.platformDetectorService.isBrowser()) {
      import('pusher-js/with-encryption').then((p) => {
        const pusher = new p.default(environment.pusher_key, {
          cluster: 'mt1',
          wsHost: environment.wsHost,
          wsPort: 6001,
          wssPort: 6001,
          forceTLS: false,
          enabledTransports: ['ws', 'wss'],
          channelAuthorization: {
            transport: 'ajax',
            endpoint: environment.pusher_url + '/broadcasting/auth',
            headers: {
              Accept: 'application/json',
              Authorization: 'Bearer ' + this.authorizationService.token,
            },
          },
        });
        const channel = pusher.subscribe(
          'private-carts.' + this.authorizationService.userId
        );

        channel.bind('cart-updated', (data: { total: number }) => {
          this.authorizationService.generalInfo$.next({
            ...this.authorizationService.generalInfo$.value,
            total: data.total
          })
        });
      });
    }
  }
}
