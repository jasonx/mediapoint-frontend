import { Component, HostListener, Input, OnInit } from '@angular/core';
import { HeaderService } from 'src/app/core/services/header.service';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';

@Component({
  selector: 'app-scroll-btn',
  templateUrl: './scroll-btn.component.html',
  styleUrls: ['./scroll-btn.component.less'],
})
export class ScrollBtnComponent implements OnInit {
  @Input() isToDown: boolean;
  isShowBtn: boolean;

  headerHeight$ = this.headerService.headerHeight$;

  constructor(
    private headerService: HeaderService,
    private platformDetectorService: PlatformDetectorService
  ) {}

  ngOnInit(): void {
    this.checkShowBtn();
  }

  toNegativeNumber(number: number | null): number {
    return number ? -number : 0;
  }

  onScroll(): void {
    if (this.isToDown) {
      return;
    }

    if (this.platformDetectorService.isBrowser()) {
      window.scrollTo({
        left: 0,
        top: 0,
        behavior: 'smooth',
      });
    }
  }

  checkShowBtn(): void {
    if (this.platformDetectorService.isBrowser()) {
      const trigger = window.scrollY + this.headerHeight$.value;

      this.isShowBtn = this.isToDown
        ? trigger <= window.innerHeight
        : trigger >= window.innerHeight;
    }
  }

  @HostListener('window:scroll', ['$event']) scroll() {
    this.checkShowBtn();
  }
}
