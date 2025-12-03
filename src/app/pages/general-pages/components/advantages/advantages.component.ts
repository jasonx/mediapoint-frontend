import { Component, Input } from '@angular/core';

export interface IAdvantagesData {
  icon: string;
  title: string;
}

@Component({
  selector: 'app-advantages',
  templateUrl: './advantages.component.html',
  styleUrls: ['./advantages.component.less']
})
export class AdvantagesComponent {
  @Input() data: IAdvantagesData[] = [];

}
