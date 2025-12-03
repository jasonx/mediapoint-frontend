import { Component, Input } from '@angular/core';

export interface IWhyBlockData {
  num: string;
  title: string;
  icon: string;
}
@Component({
  selector: 'app-why-block',
  templateUrl: './why-block.component.html',
  styleUrls: ['./why-block.component.less'],
})
export class WhyBlockComponent {
  @Input() title: string;

  whyData: IWhyBlockData[] = [
    {
      num: '2006',
      title: 'The year we started',
      icon: './assets/images/pricing/why-icon-4.svg',
    },
    {
      num: '1000+',
      title: 'Print resellers helped',
      icon: './assets/images/pricing/why-icon-2.svg',
    },
    {
      num: '100%',
      title: 'Automated ordering & production',
      icon: './assets/images/pricing/why-icon-3.svg',
    },
    {
      num: '150+',
      title: 'Orders shipped daily Australia-wide',
      icon: './assets/images/pricing/why-icon-1.svg',
    },
    {
      num: 'Fast',
      title: 'Reliable delivery dates',
      icon: './assets/images/pricing/why-icon-5.svg',
    },
  ];
}
