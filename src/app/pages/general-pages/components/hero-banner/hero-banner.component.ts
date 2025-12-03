import { Component, Input } from '@angular/core';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';

export interface IHeroData {
  info?: string,
  title: string,
  subtitle: string,
  btnLink?: string,
  href?: string,
  img?: string,
  video?: string,
  btnName?: string,
}

@Component({
  selector: 'app-hero-banner',
  templateUrl: './hero-banner.component.html',
  styleUrls: ['./hero-banner.component.less']
})
export class HeroBannerComponent {
  @Input() data: IHeroData;
  @Input() isButtonVisible: boolean = true;

  get buttonConfig(): IButtonConfig {
    return {
      text: this.data.btnName || '',
      viewType: ButtonViewType.FilledRed,
      padding: '0 30px',
    }
  };

  isBtnPlayVisible = true;

  playVideo(videoElement: HTMLVideoElement): void {
    videoElement.play();
    this.isBtnPlayVisible = false;
  }

}
