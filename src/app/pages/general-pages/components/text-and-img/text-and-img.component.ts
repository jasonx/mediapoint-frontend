import { Component, Input } from '@angular/core';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';

export interface IContentTextAndImg {
  isTextLeft: boolean;
  title: string;
  text: string;
  btn?: {
    url: string;
    name: string;
  };
  img: string;
  isWhiteBg?: boolean;
}

@Component({
  selector: 'app-text-and-img',
  templateUrl: './text-and-img.component.html',
  styleUrls: ['./text-and-img.component.less'],
})
export class TextAndImgComponent {
  @Input() content: IContentTextAndImg;

  get buttonContentConfig(): IButtonConfig {
    return {
      text: this.content.btn?.name || '',
      viewType: ButtonViewType.FilledRed,
      padding: '0 32px',
    };
  }
}
