import { Component, EventEmitter, Input, Output } from '@angular/core';
import { capitalizeFirstLetter } from '../../utils/capitalize-first-letter';

export interface ITab {
  index: number;
  title: string;
  icon?: string;
}
@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.less'],
})
export class TabsComponent {
  capitalizeFirstLetter = capitalizeFirstLetter;
  @Input() tabs: ITab[] = [];
  @Input() selectedTab: ITab | undefined;
  @Output() selectEvent = new EventEmitter<ITab>();

  onSelectTab(tab: ITab): void {
    this.selectedTab = tab;
    this.selectEvent.emit(tab);
  }

  get width(): number {
    return +(100 / this.tabs.length).toFixed(2);
  }

  get position(): string {
    const position = this.width * (this.selectedTab?.index || 0);

    return position + '%';
  }
}
