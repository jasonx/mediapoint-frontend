import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { toCamel } from './camel';

export const updateFormErrors = (form: FormGroup, error: HttpErrorResponse) => {
  const { errors } = error.error;

  for (const prop in errors) {
    if (prop in errors) {
      const formControl = form.get(toCamel(prop));

      if (formControl) {
        formControl.setErrors({ errorText: errors[prop] });
        formControl.markAsTouched();
      }
    }
  }
};
