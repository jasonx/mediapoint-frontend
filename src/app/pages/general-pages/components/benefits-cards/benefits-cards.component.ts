import { Component, Input } from '@angular/core';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { AuthorizationService } from 'src/app/core/services/authorization.service';

export interface IBenefitsCards {
  title: string;
  cards: IBenefitsCard[];
  btn: {
    title: string;
    link: string;
  }
}

export interface IBenefitsCard {
  icon: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-benefits-cards',
  templateUrl: './benefits-cards.component.html',
  styleUrls: ['./benefits-cards.component.less']
})
export class BenefitsCardsComponent {
  @Input() data: IBenefitsCards = {
    title: 'Benefits of choosing Mediapoint as your trade printer',
    cards: [
      {
        icon: 'assets/images/labels-and-sticker/b-1.svg',
        title: 'No Laminate Needed',
        text: 'Utilising outdoor durable UV inks that do not require lamination means we can offer you more margin, reduce waste and print more sustainably. Our printing process is state-of-the-art.'
      },
      {
        icon: 'assets/images/labels-and-sticker/b-2.svg',
        title: 'Free Blind Shipping',
        text: 'To provide even more value to our valued clients we are offering free blind sipping to your customers, Australia-wide, on all label rolls ordered.'
      },
      {
        icon: 'assets/images/labels-and-sticker/b-3.svg',
        title: 'Custom Shapes',
        text: 'Need a simple custom shape cut for your labels? No problem. Mediapoint can create the shape you need with no die setup fees.'
      },
      {
        icon: 'assets/images/labels-and-sticker/b-4.svg',
        title: 'Any Order Volume Requirement',
        text: 'Mediapoint can handle any volume without sacrificing turnaround time. Of course, the discounts apply as volume increases to provide you with resellers with even more margin.'
      },
      {
        icon: 'assets/images/labels-and-sticker/b-5.svg',
        title: 'Industry-leading Print Quality',
        text: 'Thanks to state-of-the-art printing alongside an incredible resolution of 1200x1200dpi, even ultra-small text is legible.'
      },
      {
        icon: 'assets/images/labels-and-sticker/b-6.svg',
        title: 'No White Edges',
        text: 'The included cutting technology guarantees no white edges offering you further peace-of-mind when it comes to quality.'
      },
      {
        icon: 'assets/images/labels-and-sticker/b-7.svg',
        title: '1m Length',
        text: 'Print labels up to a massive 1m length without any extra costs.'
      },
      {
        icon: 'assets/images/labels-and-sticker/b-8.svg',
        title: 'Instant Pricing',
        text: 'Don’t let quoting slow you down. Access live pricing on our online portal 24/7 and get jobs printed fast.'
      },
      {
        icon: 'assets/images/labels-and-sticker/b-9.svg',
        title: 'Fast  Turnaround Times',
        text: 'Get labels printed fast with an industry-leading 2 business day* turnaround even on large volume orders. Put us to the test!'
      },
      {
        icon: 'assets/images/labels-and-sticker/b-10.svg',
        title: 'Easy Peel',
        text: 'Your customers will never suffer from hard-to-pool stickers thanks to scoreless advanced liner cutting.'
      },
      {
        icon: 'assets/images/labels-and-sticker/b-11.svg',
        title: 'Custom Sizes',
        text: 'For custom sizes, Mediapoint has you covered. We can print to any sizes from 30mm x 20mm to 300mm to 1000mm. Simply let us know what you require and we’ll take it from there.'
      }
    ],
    btn: {
      title: 'Register Now',
      link: '/authorization/registration/personal-information'
    }
  };

  get buttonConfig(): IButtonConfig {
    return {
      text: this.data.btn.title,
      viewType: ButtonViewType.Filled,
      padding: '0 62px',
    }
  };

  constructor(
    public authorizationService: AuthorizationService
  ) {}

}
