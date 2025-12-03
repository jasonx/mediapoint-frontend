import { Component, OnInit, Renderer2 } from '@angular/core';
import { NavigationHistoryService } from './core/services/navigation-history.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from './shared/components/dialog/dialog.component';
import { AuthorizationService } from './core/services/authorization.service';
import { PlatformDetectorService } from './core/services/platform-detector.service';
import { SeoService } from './core/services/seo.service';
import { metaSeoData } from './core/seo-data/metalist';
import { delay, of } from 'rxjs';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
  isHideHeader: boolean;
  isShowGeneralLoader: boolean = true;

  // NavigationHistoryService need for init navigations
  constructor(
    private navigation: NavigationHistoryService,
    private authService: AuthorizationService,
    private router: Router,
    private renderer: Renderer2,
    private dialog: MatDialog,
    public seoService: SeoService,
    public activatedRoute: ActivatedRoute,
    private platformDetectorService: PlatformDetectorService
  ) {}

  ngOnInit(): void {
    this.setUpScripts();
    this.setMetaTags();
    this.checkPage();

    of(null).pipe(delay(1200)).subscribe(() => this.isShowGeneralLoader = false);

    // In an emergency:
    // this.openInfoModal();
  }

  setUpScripts() {
    if (environment.production && this.platformDetectorService.isBrowser()) {
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          gtag('config', 'G-0TME2P28L5', {
            page_path: event.urlAfterRedirects,
          });
        }
      });

      // HubSpot Embed Code
      const script = this.renderer.createElement('script');

      script.type = 'text/javascript';
      script.id = 'hs-script-loader';
      script.src = '//js.hs-scripts.com/22501121.js';
      script.async = true;
      script.defer = true;
      this.renderer.appendChild(document.head, script);
    }
  }

  setMetaTags(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const { snapshot } = this.getCurrentPage(this.activatedRoute);
        const pageName = snapshot?.data['seo_type'] || 'main';
        const seoData = metaSeoData[pageName];

        this.seoService.updateTitle(seoData.title);
        this.seoService.updateMetaTags([
          ...seoData.metaTags,
          {
            property: 'og:url',
            content: environment.url + this.router.routerState.snapshot.url.replace(/^\/+/, ''),
          },
        ]);
      }
    });
  }

  getCurrentPage(route: ActivatedRoute): ActivatedRoute {
    return (route.firstChild && this.getCurrentPage(route.firstChild)) || route;
  }

  checkPage(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isHideHeader = event.url.includes('artwork-details');
      }
    });
  }

  openInfoModal(): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      disableClose: true,
      width: '100%',
      maxWidth: '746px',
      data: {
        title: 'PLEASE NOTE',
        message:
          "We would like to inform you that our sheeter is currently undergoing upgrades, and as a result, it is temporarily unavailable. During this time, all labels on sheet products will be provided on 330mm wide non-slit rolls. Additionally, for multi-artwork sheeted jobs, they will be supplied on one roll for your convenience. <br /><br /> Should you have any questions or need further assistance, please don't hesitate to reach out to us at <a href ='mailto:trade@mediapoint.com.au'>trade@mediapoint.com.au</a>. Our team is here to help and ensure a smooth experience for you. <br /><br /> Thank you for your understanding and continued support.",
        informationButtonText: 'Continue',
      },
    };

    this.dialog.open(DialogComponent, dialogConfig);
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }
}
