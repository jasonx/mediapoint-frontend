import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { catchError, takeUntil } from 'rxjs';
import { ButtonType } from 'src/app/core/enums/button-type.enum';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { FieldTypes } from 'src/app/core/enums/field-type.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { IFile } from 'src/app/core/models/file.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { BlogService } from 'src/app/core/services/blog.service';
import { strictEmailValidator } from 'src/app/shared/utils/custom-validators';
import { phoneMask } from 'src/app/shared/utils/masks';

@Component({
  selector: 'app-job-application',
  templateUrl: './job-application.component.html',
  styleUrls: ['./job-application.component.less'],
  providers: [AutoDestroyService],
})
export class JobApplicationComponent implements OnInit {
  form: FormGroup;
  FIELD_TYPES = FieldTypes;
  isLoadedBtn: boolean = true;
  phoneMask = phoneMask;
  file: IFile | null = null;

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
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, strictEmailValidator()]],
        phoneNumber: [''],
        role: ['', [Validators.required]],
        time: ['', [Validators.required]],
        day: [''],
        rate: [''],
        employment: [''],
      });
    }
  
    submitForm(): void {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
  
        return;
      }

      const value = {
        ...this.form.value,
        file: this.file || ''
      }
  
      this.isLoadedBtn = false;
      this.blogService
        .submitJobApplication(value)
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

    loadFile(file: any): void {
      this.file = file;
    }
  
    deleteFile(): void {
      this.file = null;
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
