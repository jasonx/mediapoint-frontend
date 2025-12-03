import { Component, OnInit } from '@angular/core';
import { IHeroData } from '../components/hero-banner/hero-banner.component';
import { IContentTextAndImg } from '../components/text-and-img/text-and-img.component';
import { IAdvantagesData } from '../components/advantages/advantages.component';
import { IBigImgData } from '../components/big-image/big-image.component';

@Component({
  selector: 'app-environment',
  templateUrl: './environment.component.html',
  styleUrls: ['./environment.component.less'],
})
export class EnvironmentComponent implements OnInit {
  isLoaded: boolean;
  heroData: IHeroData = {
    title: 'Always thinking green for the Environment',
    subtitle:
      'We believe finding the most efficient way to do things is the best way. With that in mind, we are continually thinking about the environment and reducing our impact on the planet. <br /><br />We look holistically at all of our supply chain and internally at our stock, equipment, waste and power consumption to ensure we are doing the best for the next generation. You can pass these benefits on to your customers.',
    img: 'environment/hero.jpg',
  };

  advantages: IAdvantagesData[] = [
    {
      icon: 'advantages-icon-1.svg',
      title: 'VOC Free Inks',
    },
    {
      icon: 'advantages-icon-2.svg',
      title: 'Trust',
    },
    {
      icon: 'advantages-icon-3.svg',
      title: 'Paperless System',
    },
    {
      icon: 'advantages-icon-5.svg',
      title: 'Minimum Waste',
    },
  ];

  sunData: IBigImgData = {
    title: '99kw solar system',
    subtitle:
      'In 2021 we installed a 99kw Solar System to our premises. This ensures that during the day we are generating as much electricity as we are using. This in turn reduces the environmental impact of needing electricity generated for us.',
    img: '/assets/images/environment/sun-img.jpg',
    isCenter: true,
  };

  inksData: IBigImgData = {
    title: 'Greenguard inks',
    subtitle:
      'With our print partners, we choose to go with a supplier that we trust such as Durst. By meeting European standards and being more stringent than some other manufacturers, we are picking a supplier that meets our ethos of the greenest possible inks which does not compromise on outdoor durability.',
    img: '/assets/images/environment/printer.jpg',
  };

  recyclingContent: IContentTextAndImg = {
    isTextLeft: true,
    title: 'Recycling programs',
    text: 'We have been part of the Correx recycling program for many years. Every week we return many cubic meters of our polypropylene waste to be recycled and turned into new materials. This is on top of our cardboard recycling waste which also gets recycled.',
    img: './assets/images/environment/recycling-img.jpg',
    isWhiteBg: true,
  };

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoaded = true;
    }, 1000);
  }
}
