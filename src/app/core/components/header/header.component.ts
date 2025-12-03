import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HeaderService } from '../../services/header.service';
import { AuthorizationService } from '../../services/authorization.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { IDialogConfig } from '../../models/dialog-config.model';
import {
  debounceTime,
  delay,
  distinctUntilChanged,
  of,
  Subject,
  takeUntil,
} from 'rxjs';
import { DialogActionEnum } from '../../enums/dialog-action.enum';
import { AutoDestroyService } from '../../services/auto-destroy.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { ISettingsPersonalInformation } from '../../models/personal-information.model';
import {
  IGeneralInfo,
  IGlobalSearch,
  IProductMenu,
} from '../../models/general.model';
import { IButtonConfig } from '../../models/button-config.model';
import { ButtonViewType } from '../../enums/button-view-type.enum';
import { PlatformDetectorService } from '../../services/platform-detector.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less'],
  providers: [AutoDestroyService],
})
export class HeaderComponent implements OnInit {
  DISPLAYED_PRODUCTS_NUM = 3;
  isShowUserMenu: boolean;
  userData: ISettingsPersonalInformation | null;
  searchTextSubject$ = new Subject<string>();
  searchResult: IGlobalSearch | null;
  wholeProductsResult: IProductMenu[] = [];
  isInpunOnFocus: boolean;
  isShowAllProducts: boolean;

  dialogConfig: IDialogConfig = {
    title: 'Sign out of profile?',
    message: 'Are you sure you want to exit?',
    acceptButtonText: 'Log out',
    declineButtonText: 'Cancel',
  };

  get buttonShowAllProducts(): IButtonConfig {
    return {
      text: `View all products (${
        this.wholeProductsResult.length - this.DISPLAYED_PRODUCTS_NUM
      })`,
      viewType: ButtonViewType.TransparentBlue,
      minWidth: '364px',
    };
  }

  @ViewChild('header') header: ElementRef;
  @ViewChild('input') input: ElementRef;

  constructor(
    public headerService: HeaderService,
    private authService: AuthorizationService,
    public dialog: MatDialog,
    private destroy$: AutoDestroyService,
    private platformDetectorService: PlatformDetectorService
  ) {}

  ngOnInit(): void {
    this.getGeneralInfo();
    this.getUserData();
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.headerService.connectPusher();
      }
    });

    this.subscribeToSearch();
  }

  getUserData(): void {
    this.authService.userData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.userData = data));
  }

  getGeneralInfo(): void {
    this.authService.generalInfo$.subscribe((data) => {
      if (data.nextCutOff) {
        this.headerService.setTimer(data.nextCutOff);

        of(null)
          .pipe(delay(300))
          .subscribe(() => {
            this.calcHeaderHeight();
          });
      }

      this.headerService.cartCounter = data?.total || 0;
    });
  }

  subscribeToSearch(): void {
    this.searchTextSubject$
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((text) => this.globalSearch(text));
  }

  calcHeaderHeight(): void {
    if (!this.header) {
      return;
    }

    const topBar = this.header.nativeElement.children[0];

    if (topBar && topBar.offsetHeight !== 0) {
      this.setHeaderHeight();
    } else {
      of(null)
        .pipe(delay(300))
        .subscribe(() => {
          this.calcHeaderHeight();
        });
    }
  }

  setHeaderHeight(): void {
    if (this.platformDetectorService.isBrowser()) {
      const headerHeight = this.header.nativeElement.clientHeight;

      document.documentElement.style.setProperty(
        '--header-height',
        headerHeight + 'px'
      );
      this.headerService.headerHeight$.next(headerHeight);
    }
  }

  logout(): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      width: '100%',
      maxWidth: '558px',
      data: this.dialogConfig,
    };

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: DialogActionEnum) => {
        if (event === DialogActionEnum.Accept) {
          this.authService.logout();
        }
      });
  }

  // TODO: delete
  // get isAdmin(): boolean {
  //   return this.authService.isAdmin;
  // }

  onClickUserMenu(): void {
    if (this.userData) {
      this.isShowUserMenu = !this.isShowUserMenu;
    } else {
      this.authService.goToLogout();
    }
  }

  onSearch(text: string): void {
    this.isInpunOnFocus = true;
    this.searchTextSubject$.next(text.trimStart());
  }

  globalSearch(text: string): void {
    if (!text) {
      this.searchResult = null;

      return;
    }

    this.headerService
      .globalSearch(text)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.isShowAllProducts = false;
        this.wholeProductsResult = result?.products || [];
        this.searchResult = result.message
          ? result
          : {
              ...result,
              products: result.products.slice(0, this.DISPLAYED_PRODUCTS_NUM),
            };
      });
  }

  clearGlobalSearch(): void {
    this.input.nativeElement.value = '';
    this.searchResult = null;
    this.isInpunOnFocus = false;
  }

  showAllProducts(): void {
    this.isShowAllProducts = true;

    if (this.searchResult?.products) {
      this.searchResult.products = this.wholeProductsResult;
    }
  }

  get generalInfo(): IGeneralInfo {
    return this.authService.generalInfo$.value;
  }

  get getFirstLetter(): string {
    return this.userData
      ? this.userData.firstName.slice(0, 1).toUpperCase()
      : '';
  }

  @HostListener('window:resize') onResize() {
    this.setHeaderHeight();
  }
}
