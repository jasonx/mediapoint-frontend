import { Component, Input } from '@angular/core';

export interface ICardData {
  link: string,
  title: string,
  description?: string,
  image: string
}

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.less']
})
export class CardComponent {
  @Input() data: ICardData;

}
