import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { PlatformDetectorService } from './platform-detector.service';

const MAX_NAVIGATION_HISTORY_LENGTH = 13;
const LOCAL_STORAGE_KEY = 'navigation_history';

@Injectable({
  providedIn: 'root',
})
export class NavigationHistoryService {
  private navigationHistory: string[] = [];

  constructor(
    private router: Router,
    private platformDetectorService: PlatformDetectorService
  ) {
    this.initNavHistory();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateNavHistory(event.urlAfterRedirects);
        this.scrollTop();
      }
    });
  }

  private initNavHistory(): void {
    const storedHistory = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'
    );

    this.navigationHistory = [...storedHistory];
  }

  private updateNavHistory(url: string): void {
    const lastUrl = this.navigationHistory[this.navigationHistory.length - 1];

    if (lastUrl && url.split('?')[0] === lastUrl.split('?')[0]) {
      this.navigationHistory[this.navigationHistory.length - 1] = url;
    } else {
      this.navigationHistory.push(url);
    }

    this.setNavHistoryToLocalStorage();
  }

  private setNavHistoryToLocalStorage(): void {
    this.navigationHistory = this.navigationHistory.slice(
      -MAX_NAVIGATION_HISTORY_LENGTH
    );
    const historyJson = JSON.stringify(this.navigationHistory);

    localStorage.setItem(LOCAL_STORAGE_KEY, historyJson);
  }

  back(): void {
    this.navigationHistory.pop();

    const previousUrl =
      this.navigationHistory[this.navigationHistory.length - 1];

    this.router.navigateByUrl(previousUrl || '/').then();
  }

  scrollTop(): void {
    if (this.platformDetectorService.isBrowser()) {
      window.scroll({
        top: 0,
        left: 0,
      });
    }
  }
}
