import { Component, OnInit } from '@angular/core';
import { IHeroData } from '../components/hero-banner/hero-banner.component';
import { AuthorizationService } from 'src/app/core/services/authorization.service';

@Component({
  selector: 'app-labels-and-sticker-printing',
  templateUrl: './labels-and-sticker-printing.component.html',
  styleUrls: ['./labels-and-sticker-printing.component.less'],
})
export class LabelsAndStickerPrintingComponent implements OnInit {
  linkToForm = '/authorization/registration/personal-information';
  isLoaded: boolean;

  heroData: IHeroData = {
    title: 'Labels and sticker printing is better with Mediapoint.',
    subtitle:
      "As a trade only printer, our focus on delivering quality labels and sticker printing at high-volume is unmatched in Australia. We've been printing for over 16 Years. <br /><br /> We offer the best pricing and 2-day turnaround time on labels and sticker printing through our intuitive online ordering portal and best-in-class equipment. Make more margin whilst delivering exceptional products to customers. <br /><br />To view our range of labels and sticker printing options simply register for a trade account below. Our team will review the submission ASAP and once approved you'll have immediate access to the best priced labels and sticker printing in Australia.",
    video: 'labels-and-sticker/hero.mp4',
    btnName: 'Set up an account',
    btnLink: this.linkToForm,
  };

  faqContent: { title: string; content: string }[] = [
    {
      title: 'What stocks do you offer?',
      content:
        'We currently offer a Stickler White Gloss BOPP stock. BOPP is priced as a more cost effective solution even though and is more durable than paper. We do not offer paper stock at this time - but registered users will be notified as we add more options. <br / ><br />' +
        (this.isNotLoggedIn
          ? '<a href="' +
            this.linkToForm +
            '" class="btn filled-red" target="_blank">Register for pricing</a>'
          : ''),
    },
    {
      title: 'What size labels are available?',
      content:
        'The minimum size label we offer is 30mm x 30mm. We are not able to go below this size. The max size is 308mm x 1000mm.<br /><br />' +
        (this.isNotLoggedIn
          ? '<a href="' +
            this.linkToForm +
            '" class="btn filled-red" target="_blank">Register for pricing</a>'
          : ''),
    },
    {
      title: 'What label shapes can you cut?',
      content:
        'We offer simple shape-cutting - labels with no more than 5 points. We do not offer intricate cutting, and your job may be rejected if it requires a complex custom cut.<br /><br />' +
        (this.isNotLoggedIn
          ? '<a href="' +
            this.linkToForm +
            '" class="btn filled-red" target="_blank">Register for pricing</a>'
          : ''),
    },
    {
      title: 'Do you cut square/rectangle labels perfectly square?',
      content:
        'No - with our cutting, all corners need a slightly rounded corner at a minimum of 1mm.<br /><br />' +
        (this.isNotLoggedIn
          ? '<a href="' +
            this.linkToForm +
            '" class="btn filled-red" target="_blank">Register for pricing</a>'
          : ''),
    },
    {
      title: 'Do you offer kinds on labels?',
      content:
        'We offer kinds based on the number of lanes we are running off our 312 mm-wide stock. So for example, if a label size is on 5 lanes/rolls, we would only be able to offer kinds in multiples of 5.<br /><br />' +
        (this.isNotLoggedIn
          ? '<a href="' +
            this.linkToForm +
            '" class="btn filled-red" target="_blank">Register for pricing</a>'
          : ''),
    },
    {
      title: 'How much extra is shipping?',
      content:
        'Shipping for labels on rolls is free of charge for a limited time. This includes blind shipping Australia-wide.<br /><br />' +
        (this.isNotLoggedIn
          ? '<a href="' +
            this.linkToForm +
            '" class="btn filled-red" target="_blank">Register for pricing</a>'
          : ''),
    },
    {
      title: 'What is the core size?',
      content:
        'We only offer a 76mm core size with an outward-facing label.<br /><br />' +
        (this.isNotLoggedIn
          ? '<a href="' +
            this.linkToForm +
            '" class="btn filled-red" target="_blank">Register for pricing</a>'
          : ''),
    },
    {
      title: 'What are the core width options for hand-applied labels?',
      content:
        'We have a workable width of 312mm so we will setup your job for the best yield - up to 6 cores per 312mm width:<br /><br />1 core across - 312mm (max label width 308mm)<br />2 cores across - 156mm (max label width 152mm)<br />3 cores across - 104mm (max label width 100mm)<br />4 cores across - 78mm (max label width 74mm)<br />5 cores across - 62mm (max label width 58mm)<br />6 cores across - 52mm (max label width 48mm)<br /><br />' +
        (this.isNotLoggedIn
          ? '<a href="' +
            this.linkToForm +
            '" class="btn filled-red" target="_blank">Register for pricing</a>'
          : ''),
    },
    {
      title:
        'I need the rolls split with a set quantity per roll, do you do this?',
      content:
        'We do not offer set quantities per roll. The only way to split rolls is to order a different number of kinds on our system.<br /><br />' +
        (this.isNotLoggedIn
          ? '<a href="' +
            this.linkToForm +
            '" class="btn filled-red" target="_blank">Register for pricing</a>'
          : ''),
    },
    {
      title: 'What are the label gap options for machine-applied labels?',
      content:
        'We offer gaps between labels in 1mm increments - from 3mm to 10mm.<br /><br />' +
        (this.isNotLoggedIn
          ? '<a href="' +
            this.linkToForm +
            '" class="btn filled-red" target="_blank">Register for pricing</a>'
          : ''),
    },
    {
      title: 'What are the gap-to-edge options for machine-applied labels?',
      content:
        'We offer the gaps between labels in .5mm increments - from 2mm to 5mm.<br /><br />' +
        (this.isNotLoggedIn
          ? '<a href="' +
            this.linkToForm +
            '" class="btn filled-red" target="_blank">Register for pricing</a>'
          : ''),
    },
    {
      title: 'What leading-edge options are available for hand-applied labels?',
      content:
        'We do not provide an option for specifying the leading edge for hand-applied labels. The orientation will be determined based on the best yield. If your labels need a specific orientation and specifications, please select the machine-applied label options. Note that these have a higher pricing starting point.<br /><br />' +
        (this.isNotLoggedIn
          ? '<a href="' +
            this.linkToForm +
            '" class="btn filled-red" target="_blank">Register for pricing</a>'
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
