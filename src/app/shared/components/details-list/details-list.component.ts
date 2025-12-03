import { Component, Input } from '@angular/core';
import { IListData } from 'src/app/core/models/base.model';
import { numberMask } from '../../utils/masks';

@Component({
  selector: 'app-details-list',
  templateUrl: './details-list.component.html',
  styleUrls: ['./details-list.component.less'],
})
export class DetailsListComponent {
  numberMask = numberMask;
  @Input() title: string;
  @Input() listData: IListData[];
  @Input() isShowCopyBtn: boolean;

  formattingValue(value: string): string | number {
    return Number.isInteger(value) ? this.numberMask(value) : value;
  }
}
