import { WidgetsKey } from '../enums/widget-key.enum';
import { WidgetsType } from '../enums/widget-type.enum';
import { IPriceDetails } from './price-details.model';

export interface IComposeProduct {
  completedSteps: IComposeProductStep[];
  currentStep: IComposeProductStep;
  summary: ISummary;
  nextCutOff: string;
}

export interface IComposeProductResponse extends IComposeProduct {
  jobId: number;
  cartJobIds: number[];
  quoteReference: string;
}

export interface IComposeProductStep {
  key: WidgetsKey;
  title: string;
  contentTitle: string;
  valueLabel: string;
  properties: IWidgetsProperty[];
  cheaperConfiguration: ICheaperConfig;
  errorText: string;
}

export interface IWidgetsProperty {
  title: string;
  key: WidgetsKey;
  type: WidgetsType;
  options: IWidgetsOption[];
  selectedOptionId: number;
  measure: string;
  selectedValue: number | string;
  min: number;
  max: number;
  chargeableMinWidth: number;
  chargeableMinHeight: number;
  from: number;
  to: number;
  label: string;
  values: (number | string)[];
  isActive?: boolean;
  selectedUnlimitedValue?: boolean;
  isUnlimited?: boolean;
}

export interface IWidgetsOption {
  id: number | string;
  key: WidgetsKey;
  title: string;
  description: string;
  imageUrl: string;
  disabled?: boolean;
}
export interface ICheaperConfig {
  label: string;
  description: string;
  stepConfiguration: IWidgetPostData;
}

export interface ISummary {
  completedSteps: {
    title: string;
    valueLabel: string;
  }[];
  priceDetails: IPriceDetails;
}

export interface IWidgetPostData {
  stepKey: WidgetsKey;
  properties: IWidgetPostProperties[];
  cartId?: string;
}

export interface IWidgetPostProperties {
  propertyKey: WidgetsKey;
  optionId?: number | string;
  value?: string;
}

export interface IQuantityPricePostData {
  quantity: number;
  numberOfKinds: number;
  unlimitedKinds: boolean;
}

export interface IQuantityPrice {
  summary: ISummary;
  cheaperConfiguration: ICheaperConfig;
}

export interface IGlobalError {
  key: WidgetsKey;
  errorMessage: string;
}
