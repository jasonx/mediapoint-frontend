import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { catchError, takeUntil } from 'rxjs';
import { ButtonType } from 'src/app/core/enums/button-type.enum';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { FieldTypes } from 'src/app/core/enums/field-type.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { BlogService, FormType } from 'src/app/core/services/blog.service';
import { strictEmailValidator } from 'src/app/shared/utils/custom-validators';

@Component({
  selector: 'app-contact-us-form',
  templateUrl: './contact-us-form.component.html',
  styleUrls: ['./contact-us-form.component.less'],
  providers: [AutoDestroyService],
})
export class ContactUsFormComponent implements OnInit {
  @Input() title = 'Contact us';
  @Input() formType: FormType = FormType.CONTACT;

  form: FormGroup;
  FIELD_TYPES = FieldTypes;
  isLoadedBtn: boolean = true;

  buttonSubmitConfig: IButtonConfig = {
    text: 'Submit Message',
    type: ButtonType.Submit,
    viewType: ButtonViewType.FilledRed,
    padding: '0 50px',
    minWidth: '100%',
  };

  constructor(
    private blogService: BlogService,
    private toast: HotToastService,
    private destroy$: AutoDestroyService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.form = this.formBuilder.nonNullable.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, strictEmailValidator()]],
      message: [''],
    });
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.isLoadedBtn = false;
    this.blogService
      .saveInquiriesFields(this.formType, this.form.value)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.isLoadedBtn = true;

          throw err;
        })
      )
      .subscribe((d) => {
        this.isLoadedBtn = true;
        this.form.reset('');
        this.showSuccessToast(d.message);
      });
  }

  showSuccessToast(message: string): void {
    this.toast.show(message, {
      position: 'top-center',
      duration: 5000,
      style: {
        boxShadow: '0 3px 12px #19623f36',
        border: '1px solid #168952',
        padding: '16px 50px',
        textAlign: 'center',
        color: '#168952',
      },
    });
  }
}
