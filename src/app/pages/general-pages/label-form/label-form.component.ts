import { Component, OnInit } from '@angular/core';
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
import { phoneMask } from 'src/app/shared/utils/masks';

@Component({
  selector: 'app-label-form',
  templateUrl: './label-form.component.html',
  styleUrls: ['./label-form.component.less'],
  providers: [AutoDestroyService],
})
export class LabelFormComponent implements OnInit {
  form: FormGroup;
  FIELD_TYPES = FieldTypes;
  isLoadedBtn: boolean = true;
  phoneMask = phoneMask;
  LABEL_JOBS: { id: string; label: string }[] = [
    { id: '1-10_jobs_per_month', label: '1-10 Jobs / Month' },
    { id: '11-20_jobs_per_month', label: '11-20 Jobs / Month' },
    { id: '21-30_jobs_per_month', label: '21 - 30 Jobs / Month' },
    { id: '30_jobs_per_month', label: '30 Jobs / Month' },

  ]

  buttonSubmitConfig: IButtonConfig = {
    text: 'Submit',
    type: ButtonType.Submit,
    viewType: ButtonViewType.Filled,
    padding: '0 50px',
    minWidth: '176px',
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
      name: ['', [Validators.required]],
      companyName: ['', [Validators.required]],
      email: ['', [Validators.required, strictEmailValidator()]],
      phoneNumber: ['', [Validators.required]],
      estimatedLabelJobs: ['', Validators.required],
      offeringLabelsAndStickers: ['', Validators.required],
      usesTradePrinter: ['', Validators.required]
    });
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const formValue = {
      ...this.form.value,
      estimatedLabelJobs: this.form.get('estimatedLabelJobs')?.value['id']
    }

    this.isLoadedBtn = false;
    this.blogService
      .saveInquiriesFields(FormType.LABEL, formValue)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.isLoadedBtn = true;

          throw err;
        })
      ).subscribe((d) => {
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
