import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonType } from 'src/app/core/enums/button-type.enum';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { NavigationHistoryService } from '../../../core/services/navigation-history.service';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.less'],
})
export class ButtonComponent {
  BUTTON_TYPE = ButtonType;
  @Input() buttonConfig: IButtonConfig = {
    text: '',
    type: ButtonType.Button,
    viewType: ButtonViewType.Filled,
    padding: '20px',
    isDisabled: false,
  };
  @Input() isLoaded: boolean = true;

  @Output() clickEvent = new EventEmitter();

  constructor(private navigation: NavigationHistoryService) {}

  get buttonClass(): string {
    return `
    ${this.buttonConfig.viewType}
    ${this.buttonConfig.color || ''}
    ${this.buttonConfig.customClass || ''}
    `;
  }

  onClick(): void {
    this.clickEvent.emit(null);

    if (this.buttonConfig.viewType === ButtonViewType.Back) {
      this.navigation.back();
    }
  }
}
