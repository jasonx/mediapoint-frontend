import { Component, OnInit, ViewChild } from '@angular/core';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';
import { IHeroData } from '../components/hero-banner/hero-banner.component';
import { AuthorizationService } from 'src/app/core/services/authorization.service';
import { GoogleReviewsService } from 'src/app/core/services/google-reviews.service';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { takeUntil } from 'rxjs';
import { IReview } from 'src/app/core/models/google-reviews.model';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.less'],
  providers: [AutoDestroyService],
})
export class HomePageComponent implements OnInit {
  @ViewChild('swiperEl') swiperEl: any;
  rating: number;
  reviewCount: number;
  reviews: IReview[];
  isLoaded: boolean;

  NUM_OF_STARS = Array(5);

  buttonRequestConfig2: IButtonConfig = {
    text: 'Unlock Exclusive Pricing',
    viewType: ButtonViewType.FilledRed,
    padding: '0 30px',
  };

  heroData: IHeroData = {
    info: 'The Trusted Print Partner for Resellers',
    title: 'We print, you sell',
    subtitle:
      'Join over 1,000 Australian print resellers. <br /> 24/7 online ordering with reliable lead times and delivery dates. <br /> Every order is blind shipped or white-labelled under your brand. <br /><br /> Your customers only see you.',
    btnLink: '/authorization/registration/personal-information',
    img: 'home-page/hero.png',
    btnName: 'Register for Trade Pricing',
  };

  constructor(
    public authorizationService: AuthorizationService,
    private googleReviewsService: GoogleReviewsService,
    private platformDetectorService: PlatformDetectorService,
    private destroy$: AutoDestroyService
  ) {}

  ngOnInit(): void {
    this.getGoogleReviews();
  }

  getGoogleReviews(): void {
    this.googleReviewsService
      .getReviews()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.rating = data.rating;
        this.reviewCount = data.reviewCount;
        this.reviews = data.reviews;
        this.isLoaded = true;

        setTimeout(() => {
          this.setSwiperOptions();
        }, 0);
      });
  }

  setSwiperOptions(): void {
    if (!this.platformDetectorService.isBrowser()) return;

    const swiperParams = {
      slidesPerView: 6,
      slidesPerGroup: 1,
      spaceBetween: 12,
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      loop: true,
      breakpoints: {
        0: {
          slidesPerView: 3,
        },
        1150: {
          slidesPerView: 4,
        },
        1440: {
          slidesPerView: 5,
        },
        1600: {
          slidesPerView: 6,
        },
      },
    };

    const swiperEl = this.swiperEl.nativeElement;
    Object.assign(swiperEl, swiperParams);

    const swiper = swiperEl.swiper;

    swiper.autoplay.start();

    swiperEl.addEventListener('mouseenter', () => swiper.autoplay.stop());
    swiperEl.addEventListener('mouseleave', () => swiper.autoplay.start());
  }

  navigate(direction: 'next' | 'prev'): void {
    const swiper = this.swiperEl.nativeElement.swiper;

    if (swiper) {
      direction === 'next' ? swiper.slideNext() : swiper.slidePrev();
    }
  }

  getStarFill(index: number): number {
    if (index + 1 <= Math.floor(this.rating)) {
      return 100;
    } else if (index < this.rating) {
      return (this.rating - index) * 100;
    } else {
      return 0;
    }
  }
}
