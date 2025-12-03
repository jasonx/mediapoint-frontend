import { Component, Input } from '@angular/core';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';

export interface IBigImgData {
  title: string;
  subtitle: string;
  button?: {
    url: string;
    name: string;
  };
  img: string;
  isCenter?: boolean;
}
@Component({
  selector: 'app-big-image',
  templateUrl: './big-image.component.html',
  styleUrls: ['./big-image.component.less'],
})
export class BigImageComponent {
  @Input() data: IBigImgData;

  get buttonConfig(): IButtonConfig {
    return {
      text: this.data.button?.name || '',
      viewType: ButtonViewType.FilledRed,
      padding: '0 45px',
    };
  }
}
