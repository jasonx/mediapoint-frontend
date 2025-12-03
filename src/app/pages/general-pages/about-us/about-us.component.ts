import { Component, OnInit } from '@angular/core';
import { IHeroData } from '../components/hero-banner/hero-banner.component';
import { IContentTextAndImg } from '../components/text-and-img/text-and-img.component';
import { IAdvantagesData } from '../components/advantages/advantages.component';
import { IBigImgData } from '../components/big-image/big-image.component';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.less'],
})
export class AboutUsComponent implements OnInit {
  isLoaded: boolean;
  heroData: IHeroData = {
    title: 'Trusted Print Partner for Aussie Resellers Since 2006',
    subtitle:
      'Founded in 2006, Mediapoint has grown from humble beginnings into one of Australia’s most trusted production partners for resellers. We exist to make print simple, fast, and reliable so our customers can focus on their clients. <br /><br />Over the years, we’ve invested heavily in technology, automation, and process innovation to deliver consistent quality and turnaround at scale. From our solar-powered facility in Derrimut, Victoria, we produce everything in-house with lean systems designed for speed and precision. <br /><br />Our philosophy is simple: empower resellers with dependable service, transparent pricing, and effortless online ordering. We’re proud to support over a thousand Australian businesses that trust Mediapoint as the invisible backbone behind their brand.',
    img: 'about-us/hero.jpg',
  };

  advantages: IAdvantagesData[] = [
    {
      icon: 'advantages-icon-1.svg',
      title: 'Printing Since 2006',
    },
    {
      icon: 'advantages-icon-2.svg',
      title: '1000+ Aus Resellers',
    },
    {
      icon: 'advantages-icon-3.svg',
      title: 'Online Pricing & Ordering',
    },
    {
      icon: 'advantages-icon-4.svg',
      title: 'Reliable Production Times',
    },
    {
      icon: 'advantages-icon-5.svg',
      title: 'Reliable Delivery Dates',
    },
  ];

  resellersContent: IContentTextAndImg = {
    isTextLeft: true,
    title: 'We print while you sell',
    text: 'Our online system gives resellers everything they need to get jobs moving instant live pricing, real-time tracking, and 24/7 access to order history. Designed for speed and simplicity, it’s built to help you serve your customers faster. <br /><br />Most products are available with next-day turnaround when ordered before the daily cutoff, so your business keeps moving without delays.',
    btn: {
      url: '/catalog',
      name: 'See products',
    },
    img: './assets/images/about-us/resellers-img.png',
    isWhiteBg: true,
  };

  equipmentData: IBigImgData = {
    title: 'Cutting-Edge Print Technology at Mediapoint',
    subtitle:
      'Explore the machines behind Mediapoint’s high-speed, high-quality production. We use industry-leading Durst and Canon equipment, backed by automation and lean processes, to help resellers deliver exceptional results every time.',
    button: {
      url: '/equipment',
      name: 'View our equipment',
    },
    img: '/assets/images/about-us/printer.png',
  };

  vacanciesContent: IContentTextAndImg = {
    isTextLeft: true,
    title: 'Careers',
    text: 'Working at Mediapoint is about more than just print production. Our team learns lean thinking, automation, and continuous improvement from day one, skills that go beyond traditional manufacturing roles. Whether you’re cutting, packing, or running machines, you’ll be part of a culture built on teamwork, growth, and innovation. <br /><br />Get more out of your career in print with Mediapoint.',
    btn: {
      url: '/careers',
      name: 'View jobs',
    },
    img: './assets/images/about-us/vacancies-img.png',
    isWhiteBg: true,
  };

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoaded = true;
    }, 1000);
  }
}
