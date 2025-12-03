import {
  Directive,
  Input,
  ElementRef,
  HostListener,
  Renderer2,
  OnDestroy,
} from '@angular/core';
import { delay, of } from 'rxjs';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';

@Directive({
  selector: '[tooltip]',
})
export class TooltipDirective implements OnDestroy {
  @Input() tooltip: string;
  @Input() maxWidth: number;
  @Input() customClass: string;
  tooltipEl: HTMLElement | null;
  isHoverTooltipEl: boolean;
  offset = 10;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private platformDetectorService: PlatformDetectorService
  ) {}

  ngOnDestroy(): void {
    this.hide();
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.show();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.hide();
  }

  show() {
    if (this.tooltipEl || !this.tooltip) {
      return;
    }

    this.createTooltip();
    this.setPosition();
    this.renderer.addClass(this.tooltipEl, 'show');
  }

  hide() {
    of(null)
      .pipe(delay(500))
      .subscribe(() => {
        if (!this.tooltipEl || this.isHoverTooltipEl) {
          return;
        }

        if (this.platformDetectorService.isBrowser()) {
          this.renderer.removeClass(this.tooltipEl, 'show');
          this.renderer.removeChild(document.body, this.tooltipEl);
          this.tooltipEl = null;
        }
      });
  }

  setPosition() {
    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltipEl?.getBoundingClientRect() || {
      width: 0,
      height: 0,
    };
    let top;
    let left;
    const tooltipHalfWidth = tooltipPos.width / 2;
    const hostHalfWidth = hostPos.width / 2;

    top = hostPos.top - tooltipPos.height - this.offset;
    left = hostPos.left - tooltipHalfWidth + hostHalfWidth;

    this.renderer.setStyle(this.tooltipEl, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipEl, 'left', `${left}px`);
  }

  createTooltip() {
    if (this.platformDetectorService.isBrowser()) {
      this.tooltipEl = this.renderer.createElement('div');
      const tooltipText = this.renderer.createElement('div');

      this.renderer.setProperty(tooltipText, 'innerHTML', this.tooltip);
      this.renderer.appendChild(this.tooltipEl, tooltipText);
      this.renderer.appendChild(document.body, this.tooltipEl);

      this.renderer.addClass(this.tooltipEl, 'tooltip');

      if (this.customClass) {
        this.renderer.addClass(this.tooltipEl, this.customClass);
      }

      this.renderer.setStyle(this.tooltipEl, 'max-width', `${this.maxWidth}px`);

      this.addListener();
    }
  }

  addListener(): void {
    this.tooltipEl?.addEventListener('mouseenter', () => {
      this.isHoverTooltipEl = true;
    });

    this.tooltipEl?.addEventListener('mouseleave', () => {
      this.isHoverTooltipEl = false;
      this.hide();
    });
  }
}
