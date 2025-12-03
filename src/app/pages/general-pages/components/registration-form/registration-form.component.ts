import { AfterViewInit, Component, Input } from '@angular/core';
import { AccountUsageDataType } from 'src/app/core/enums/account-usage-type.enum';
import { ButtonType } from 'src/app/core/enums/button-type.enum';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { PersonalInformationComponent } from 'src/app/pages/authorization/registration/personal-information/personal-information.component';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.less'],
  providers: [AutoDestroyService],
})
export class RegistrationFormComponent extends PersonalInformationComponent implements AfterViewInit {
  @Input() data: {
    title: string;
    subtitle: string;
    isResellSelected: boolean;
    isInfoGoogle: boolean
  } = {
    title: 'We Print while you sell',
    subtitle: 'Join over 1000 Australian resellers <br /> Get exclusive Mediapoint pricing now',
    isResellSelected: false,
    isInfoGoogle: false
  }

  override buttonSubmitConfig: IButtonConfig = {
    text: 'Unlock Trade Pricing',
    type: ButtonType.Submit,
    viewType: ButtonViewType.FilledRed,
    padding: '0 50px',
    minWidth: '100%',
  };

  ngAfterViewInit(): void {
    if (this.data.isResellSelected) {
      this.selectType(AccountUsageDataType.Resell);
    }
  }
}
