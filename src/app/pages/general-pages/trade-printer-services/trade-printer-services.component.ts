import { Component, OnInit } from '@angular/core';
import { IHeroData } from '../components/hero-banner/hero-banner.component';
import { AuthorizationService } from 'src/app/core/services/authorization.service';

@Component({
  selector: 'app-trade-printer-services',
  templateUrl: './trade-printer-services.component.html',
  styleUrls: ['./trade-printer-services.component.less'],
})
export class TradePrinterServicesComponent implements OnInit {
  linkToForm = '/authorization/registration/personal-information';
  isLoaded: boolean;

  heroData: IHeroData = {
    title: 'The trade printer experience is better with Mediapoint.',
    subtitle:
      "As a trade printer, our focus on delivering quality printing at high-volume is unmatched in Australia. We've been in the print game for over 16 Years.<br /><br />We offer the best pricing and fastest turnaround time on trade printer services through our intuitive online ordering portal and best-in-class equipment. Make more margin whilst delivering exceptional products to customers.<br /><br />To view our range of trade print options and order, simply register for an account below. Our team will review the submission ASAP and once approved you'll have immediate access to the best priced trade printer services in Australia.",
    video: 'labels-and-sticker/hero.mp4',
    btnName: 'Set up an account',
    btnLink: this.linkToForm,
  };

  faqContent: { title: string; content: string }[] = [
    {
      title: 'What makes Mediapoint different to other trade printers?',
      content:
        'Mediapoint is the best-equipped trade printer for high volume resellers. We deal exclusively with trade customers - not retail print. Our range of equipment, lean processes, automated ordering system and team of experienced print professionals is unparalleled. We make it as streamlined as possible for our customers to order and focus solely on production, allowing us to pass the savings on to customers - which means greater margin for them.<br / ><br />' +
        (this.isNotLoggedIn
          ? '<a href="' +
            this.linkToForm +
            '" class="btn filled-red" target="_blank">Register for an account</a>'
          : ''),
    },
    {
      title: 'How do you achieve next-day turnaround on most products?',
      content:
        'Mediapoint relies on a highly automated ordering system that allows our customers to provide (and proof) artwork online. This enables us to cut down turnaround as well as pass on the savings that come from not having design services. It also provides resellers more lead-time for projects and increases the possibility of delivering on last-minute orders received from their clients.<br /><br />' +
        (this.isNotLoggedIn
          ? '<a href="' +
            this.linkToForm +
            '" class="btn filled-red" target="_blank">Register for an account</a>'
          : ''),
    },
    {
      title:
        'Why would we utilise a trade printer instead of in-house production?',
      content:
        "If you’re manufacturing predominantly in-house it’s likely that you have entry-level equipment that suit sa lower volume of production. This is fine for artisanal, bespoke or custom jobs, but not beneficial if you’re expecting to grow the volume of your print runs. In this scenario the cost per square metre will be much higher when factoring in ink, stock, labour, capital for equipment and the physical space you need for it all. Of course, you can charge more (out of necessity / perceived value) but should your quantity of orders or volume grow, you’ll be tying up production capacity on low margin orders. Never forget that time is a commodity; any time your machines are running for one job, they aren't producing for another. You want to be utilising your own equipment for the orders that make the most profit; outsourcing to a reliable partner enables you to do this without sacrificing quality or speed on key accounts. Using a trade printer you can produce faster, at a higher volume, without the profit-eating capital outlay.<br /><br />" +
        (this.isNotLoggedIn
          ? '<a href="' +
            this.linkToForm +
            '" class="btn filled-red" target="_blank">Register for an account</a>'
          : ''),
    },
    {
      title: 'What equipment does Mediapoint have?',
      content:
        'Mediapoint has a wide range of Durst and OCE machines. We match the right machine for each job and have specifically purchased equipment that can handle significant volume. That’s why we can provide quality printing at scale and at speed. Your clients will love the finished products and, thanks to our automated system, your lead times won’t blow out.<br /><br />' +
        (this.isNotLoggedIn
          ? '<a href="' +
            this.linkToForm +
            '" class="btn filled-red" target="_blank">Register for an account</a>'
          : ''),
    },
  ];

  constructor(public authorizationService: AuthorizationService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoaded = true;
    }, 1000);
  }

  get isNotLoggedIn(): boolean {
    return !this.authorizationService.isLoggedIn;
  }
}
