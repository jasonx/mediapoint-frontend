import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { onlyNumberMask } from './masks';

export function maxValueValidator(
  max: number,
  errorText?: string,
  isFractional: boolean = true
): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = +onlyNumberMask(control.value, isFractional);

    if (value > max) {
      return { maxValueValidator: { max }, errorText };
    }

    return null;
  };
}

export function minValueValidator(
  min: number,
  errorText?: string,
  isFractional: boolean = true
): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = +onlyNumberMask(control.value, isFractional);

    if (value < min) {
      return { minValueValidator: { min }, errorText };
    }

    return null;
  };
}

export function urlValidator(
  control: AbstractControl
): { [key: string]: any } | null {
  const regex =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
  const { value } = control;
  const result = regex.test(value);

  if (result || !value || !value.length) {
    return null;
  }

  return { errorText: 'Incorrect url' };
}

export function matchValidator(value: boolean, errorText: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control.value !== value) {
      return { errorText };
    }

    return null;
  };
}

export function strictEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return regex.test(control.value) ? null : { email: true };
  };
}
