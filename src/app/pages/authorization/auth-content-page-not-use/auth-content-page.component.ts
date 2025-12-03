import { Component, ViewChild } from '@angular/core';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';

@Component({
  selector: 'app-auth-content-page',
  templateUrl: './auth-content-page.component.html',
  styleUrls: ['./auth-content-page.component.less'],
})
export class AuthContentPageComponent {
  @ViewChild('swiperClients') swiperClients: any;

  faqs: { title: string; content: string }[] = [
    {
      title: 'What Size Labels / Stickers Are Available?',
      content:
        'The minimum size label we offer is 30mm x 30mm. We are not able to go below this size. The max size is 308mm x 1000mm.',
    },
    {
      title: 'What Label Shapes Can You Cut?',
      content:
        ' We offer simple shape-cutting - labels with no more than 5 points. We do not offer intricate cutting, and your job may be rejected if it requires a complex custom cut.',
    },
    {
      title: 'How Much Is Shipping?',
      content:
        'Shipping for labels on rolls is free of charge for a limited time. This includes blind shipping Australia-wide.',
    },
    {
      title: 'Do You Offer Kinds On Labels?',
      content:
        'We offer kinds based on the number of lanes we are running off our 312 mm-wide stock. So for example, if a label size is on 5 lanes/rolls, we would only be able to offer kinds in multiples of 5.',
    },
  ];

  constructor(private platformDetectorService: PlatformDetectorService) {}

  ngAfterViewInit(): void {
    const swiperClientParams = {
      slidesPerView: 4,
      spaceBetween: 12,
      autoplay: {
        delay: 2000,
        disableOnInteraction: false,
      },
      loop: true,
    };

    if (this.platformDetectorService.isBrowser()) {
      Object.assign(this.swiperClients.nativeElement, swiperClientParams);

      this.swiperClients.nativeElement.swiper.autoplay.start();
    }
  }
}
