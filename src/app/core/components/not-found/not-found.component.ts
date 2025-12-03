import { Component } from '@angular/core';
import { IButtonConfig } from '../../models/button-config.model';
import { ButtonViewType } from '../../enums/button-view-type.enum';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.less'],
})
export class NotFoundComponent {
  buttonConfig: IButtonConfig = {
    text: 'Go home',
    viewType: ButtonViewType.Filled,
    minWidth: '233px',
  };
}
