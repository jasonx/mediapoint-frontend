import { ButtonType } from '../enums/button-type.enum';
import { ButtonViewType } from '../enums/button-view-type.enum';

export interface IButtonConfig {
  text: string;
  viewType: ButtonViewType;
  type?: ButtonType;
  padding?: string;
  color?: string;
  fontWeight?: string;
  minWidth?: string;
  icon?: string;
  isDisabled?: boolean;
  customClass?: string;
  tooltip?: string;
}
