import { Component } from '@angular/core';

@Component({
  selector: 'app-resellers',
  templateUrl: './resellers.component.html',
  styleUrls: ['./resellers.component.less']
})
export class ResellersComponent {
  bannerData = {
    title: 'Labels on rolls - printing at the best price',
    subtitle: 'Join 1000s of Australian Printers & Fill Out the Form to Unlock Exclusive Trade Pricing Now',
    isResellSelected: true,
    isInfoGoogle: true,
  }

}
