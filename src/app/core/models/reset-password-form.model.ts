import { FormControl } from '@angular/forms';

export interface IResetPassword {
  email: FormControl<string>;
  token: FormControl<string>;
  password: FormControl<string>;
  passwordConfirmation: FormControl<string>;
}
