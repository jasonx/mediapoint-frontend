import { Component, OnInit, ViewChild } from '@angular/core';
import { IHeroData } from '../components/hero-banner/hero-banner.component';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';
import { AuthorizationService } from 'src/app/core/services/authorization.service';
import { IProductMenu } from 'src/app/core/models/general.model';
import { takeUntil } from 'rxjs';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { IContentTextAndImg } from '../components/text-and-img/text-and-img.component';
import Swiper from 'swiper';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.less'],
  providers: [AutoDestroyService],
})
export class PricingComponent implements OnInit {
  @ViewChild('swiperEl') swiperEl: any;
  isBeginning: boolean = true;
  isEnd: boolean;
  isLoaded: boolean;
  products: IProductMenu[] = [];

  heroData: IHeroData = {
    title: 'Print resellers grow faster with Mediapoint',
    subtitle:
      'As Australia’s most automated trade printer, we focus entirely on resellers not end users. Our streamlined system gives you the best possible trade pricing and fast turnarounds by removing unnecessary frontend and prepress steps. Every resource goes into production so you can deliver more for your clients, faster.',
    btnLink: '/authorization/registration/personal-information',
    img: 'pricing/hero.jpg',
    btnName: 'Set up an account',
  };

  exclusiveData = {
    title: 'Built for Resellers <br /> Exclusive Trade Pricing',
    text: 'Create your Mediapoint account and start quoting within hours. <br />We work exclusively with trade resellers giving you direct access to our automated print system and the best reseller pricing in the market. <br /><br />By cutting out manual quoting, prepress adjustments, and other frontend overheads, we’ve channeled every resource into production. The result is faster turnaround, sharper pricing, and reliable quality on every order.<br /><br />If your business regularly outsources or manages print jobs, our automated trade platform is the perfect way to scale efficiently.',
    title2: 'Mediapoint’s automated system delivers:',
    blocks: [
      {
        icon: './assets/images/pricing/exclusive-icon-1.svg',
        text: '24/7 live pricing and instant online ordering',
      },
      {
        icon: './assets/images/pricing/exclusive-icon-2.svg',
        text: 'Quick artwork upload and approval',
      },
      {
        icon: './assets/images/pricing/exclusive-icon-3.svg',
        text: 'Real-time production and dispatch tracking',
      },
      {
        icon: './assets/images/pricing/exclusive-icon-4.svg',
        text: 'Consistent quality with accurate production dates',
      },
      {
        icon: './assets/images/pricing/exclusive-icon-5.svg',
        text: 'Reliable delivery estimates',
      },
    ],
  };

  textAndImgContent: IContentTextAndImg = {
    isTextLeft: true,
    title: 'Production-Driven by Design',
    text: 'At Mediapoint, every investment goes into production not sales or prepress. From high-speed Durst flatbeds to precision label presses and automated cutting, our equipment is purpose-built for trade printing at scale. <br /><br />Our focus is simple: consistent, efficient output so you as a reseller can deliver confidently on every job.',
    btn: {
      url: '/equipment',
      name: 'View our equipment',
    },
    img: './assets/images/pricing/equipment-img.jpg',
  };

  buttonCatalogConfig: IButtonConfig = {
    text: 'See Our Range',
    viewType: ButtonViewType.FilledRed,
    padding: '0 45px',
  };

  constructor(
    public authorizationService: AuthorizationService,
    private platformDetectorService: PlatformDetectorService,
    public destroy$: AutoDestroyService
  ) {}

  ngOnInit(): void {
    this.getProductList();
  }

  getProductList(): void {
    this.authorizationService.generalInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (!data.categories) {
          return;
        }

        const order = [
          'corrugated-plastic-print-only',
          'fixed-height-mesh-all-edge-finish',
          'labels-on-roll',
          'pull-up-banners',
        ];

        const allProducts = data.categories.flatMap((c) =>
          c.subcategories.flatMap((s) => s.products)
        );

        const orderedProducts: IProductMenu[] = [];
        order.forEach((slug) => {
          const product = allProducts.find((p) => p.slug === slug);
          if (product) {
            orderedProducts.push(product);
          }
        });

        const remainingProducts = allProducts.filter(
          (p) => !order.includes(p.slug)
        );

        this.products = [...orderedProducts, ...remainingProducts];

        setTimeout(() => {
          this.setSwiperOptions();
        });

        setTimeout(() => {
          this.isLoaded = true;
        }, 1000);
      });
  }

  setSwiperOptions(): void {
    const swiperParams = {
      slidesPerView: 4,
      slidesPerGroup: 4,
      spaceBetween: 12,
      loop: false,
    };

    if (this.platformDetectorService.isBrowser() && this.swiperEl) {
      Object.assign(this.swiperEl.nativeElement, swiperParams);

      const swiper = this.swiperEl.nativeElement.swiper;

      if (swiper) {
        swiper.on('slideChange', () => {
          this.updateArrows(swiper);
        });
      }
    }
  }

  updateArrows(swiper: Swiper): void {
    this.isBeginning = swiper.isBeginning;
    this.isEnd = swiper.isEnd;
  }

  navigate(direction: 'next' | 'prev'): void {
    const swiper = this.swiperEl.nativeElement.swiper;

    if (swiper) {
      direction === 'next' ? swiper.slideNext() : swiper.slidePrev();
    }
  }
}
