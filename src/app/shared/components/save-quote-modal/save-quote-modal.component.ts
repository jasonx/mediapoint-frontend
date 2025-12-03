import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonType } from 'src/app/core/enums/button-type.enum';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { FieldTypes } from 'src/app/core/enums/field-type.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';

@Component({
  selector: 'app-save-quote-modal',
  templateUrl: './save-quote-modal.component.html',
  styleUrls: ['./save-quote-modal.component.less'],
})
export class SaveQuoteModalComponent implements OnInit {
  skipButtonConfig: IButtonConfig = {
    text: 'Cancel',
    viewType: ButtonViewType.LightBlue,
    minWidth: '174px',
  };
  saveButtonConfig: IButtonConfig = {
    text: 'Save',
    type: ButtonType.Submit,
    viewType: ButtonViewType.Filled,
    padding: '0px',
    minWidth: '174px',
  };
  FIELD_TYPES = FieldTypes;
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<SaveQuoteModalComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA)
    public data: { reference: string }
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      reference: this.data?.reference || '',
    });
  }

  onSkip(): void {
    this.dialogRef.close(null);
  }

  onSave(): void {
    const quoteReference = this.form.get('reference')?.value;

    this.dialogRef.close(quoteReference);
  }
}
