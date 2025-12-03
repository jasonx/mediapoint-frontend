import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PlatformDetectorService {
  private isPlatformBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: string) {
    this.isPlatformBrowser = isPlatformBrowser(platformId);
  }

  public isBrowser(): boolean {
    return this.isPlatformBrowser;
  }

}