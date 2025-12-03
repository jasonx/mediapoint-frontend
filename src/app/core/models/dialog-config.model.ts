import { IIcon } from './icon.model';

export interface IDialogConfig {
  icon?: IIcon;
  title: string;
  message?: string;
  acceptButtonText?: string;
  declineButtonText?: string;
  informationButtonText?: string;
  isSuccess?: boolean;
  checkboxText?: string;
  bgColor?: 'blue' | 'red'
  isBtnRed?: boolean;
}

export enum DialogButtonType {
  Accept = 'acceptButtonText',
  Decline = 'declineButtonText',
  Information = 'informationButtonText',
}
