import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { IReview } from 'src/app/core/models/google-reviews.model';

@Component({
  selector: 'app-testimonial',
  templateUrl: './testimonial.component.html',
  styleUrls: ['./testimonial.component.less'],
})
export class TestimonialComponent implements AfterViewInit {
  @Input() data: IReview;
  @ViewChild('content') contentRef!: ElementRef<HTMLDivElement>;

  isShowButton: boolean;
  isExpanded: boolean;

  NUM_OF_STARS = Array(5);

  ngAfterViewInit() {
    if (!this.contentRef) {
      return;
    }

    const el = this.contentRef.nativeElement;
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    const maxHeight = lineHeight * 4;

    setTimeout(() => {
      this.isShowButton = el.scrollHeight > maxHeight;
    });
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
    this.isShowButton = false;
  }

  getStarFill(index: number): number {
    if (index + 1 <= Math.floor(this.data.rating)) {
      return 100;
    } else if (index < this.data.rating) {
      return (this.data.rating - index) * 100;
    } else {
      return 0;
    }
  }
}
