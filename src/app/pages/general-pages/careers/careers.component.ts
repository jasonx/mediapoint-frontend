import { Component, OnInit } from '@angular/core';
import { IHeroData } from '../components/hero-banner/hero-banner.component';
import { FormType } from 'src/app/core/services/blog.service';

@Component({
  selector: 'app-careers',
  templateUrl: './careers.component.html',
  styleUrls: ['./careers.component.less'],
})
export class CareersComponent implements OnInit {
  formType: FormType = FormType.CAREER;
  linkToForm = 'https://share.hsforms.com/12vg0p123S_mWsJVqcAoj2wde9z5';
  isLoaded: boolean;

  heroData: IHeroData = {
    title: 'Join Mediapoint – Build a Career, Not Just a Job',
    subtitle:
      'At Mediapoint you’ll do more than “print manufacturing”. You’ll gain hands-on experience with state-of-the-art equipment, learn Lean methodology and become part of a continuous improvement culture. Choose a role where your growth and skills matter, step up with Mediapoint.',
    href: this.linkToForm,
    img: 'careers/hero.png',
    btnName: 'Submit an application',
  };

  rolesContent: { title: string; content: string }[] = [
    {
      title: 'Print production team member',
      content:
        'We are looking for someone to join our morning print production crew. Experience in print, signage, machine work or manufacturing is ideal. In this role you will be actively operating millions of dollars in high end print equipment. <br / ><br /><a href="' +
        this.linkToForm +
        '" class="btn filled-red" target="_blank">Apply for a vacancy</a>',
    },
    {
      title: 'Finishing team member',
      content:
        'We are actively looking for part-time or casual finishing team members. In this role, you will work on cool equipment like our Zund cutting table, Platgrommet All In One and other state-of-the-art equipment. You will be working on your feet and moving around a lot. <br / ><br /><a href="' +
        this.linkToForm +
        '" class="btn filled-red" target="_blank">Apply for a vacancy</a>',
    },
    {
      title: 'Customer service',
      content:
        'We are on the lookout for a customer service team member. Experience in print is not necessary. The job entails dealing with customer inquiries, doing quotes and getting jobs into production. <br / ><br /><a href="' +
        this.linkToForm +
        '" class="btn filled-red" target="_blank">Apply for a vacancy</a>',
    },
    {
      title: 'Video and marketing content producer',
      content:
        'We are constantly looking to put out videos, podcasts and social content. We are looking for a potential superstar to join the team to help film edit and post content for us to help expand our reach. With this role, you will get full reign to keep posting as much content as possible for our brands. <br / ><br /><a href="' +
        this.linkToForm +
        '" class="btn filled-red" target="_blank">Apply for a vacancy</a>',
    },
  ];

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoaded = true;
    }, 1000);
  }
}
