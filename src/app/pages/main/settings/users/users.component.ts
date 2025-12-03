import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { IButtonConfig } from '../../../../core/models/button-config.model';
import { ButtonViewType } from '../../../../core/enums/button-view-type.enum';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { takeUntil } from 'rxjs';
import { DialogActionEnum } from '../../../../core/enums/dialog-action.enum';
import { AutoDestroyService } from '../../../../core/services/auto-destroy.service';
import { UsersService } from '../../../../core/services/users.service';
import { BaseMainComponent } from '../../base-main/base-main.component';
import { ActivatedRoute, Router } from '@angular/router';
import { paramsStringify } from '../../../../shared/utils/params-stringify';
import { IUserItem } from '../../../../core/models/user.model';
import { AuthorizationService } from '../../../../core/services/authorization.service';
import { FieldTypes } from 'src/app/core/enums/field-type.enum';
import { PlatformDetectorService } from 'src/app/core/services/platform-detector.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.less'],
})
export class UsersComponent extends BaseMainComponent<IUserItem> {
  FIELD_TYPES = FieldTypes;
  isEmployee: boolean;
  addUserButtonConfig: IButtonConfig = {
    text: 'Add new users',
    viewType: ButtonViewType.TransparentBlue,
    padding: '21px 26px 21px 23px',
    icon: 'plus-2.svg',
  };
  displayedColumns: string[] = [];

  constructor(
    router: Router,
    activatedRoute: ActivatedRoute,
    destroy$: AutoDestroyService,
    cdr: ChangeDetectorRef,
    ngZone: NgZone,
    platformDetectorService: PlatformDetectorService,
    private usersService: UsersService,
    public dialog: MatDialog,
    private readonly authorizationService: AuthorizationService
  ) {
    super(router, activatedRoute, destroy$, cdr, ngZone, platformDetectorService);

    this.isEmployee = this.authorizationService.isEmployee;
    this.displayedColumns = this.isEmployee
      ? ['contact', 'typeUser', 'createdOn']
      : ['receiver', 'contact', 'typeUser', 'createdOn', 'actions'];
  }

  updateUser(id?: number): void {
    if (!id) {
      this.openDialog();
    } else {
      this.usersService
        .getUser(Number(id))
        .pipe(takeUntil(this.destroy$))
        .subscribe((data) => {
          this.openDialog(data);
        });
    }
  }

  delete(id: string): void {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      disableClose: true,
      width: '100%',
      maxWidth: '558px',
      data: {
        title: 'Are you sure?',
        message: 'Are you sure you want to delete this user?',
        declineButtonText: 'Cancel',
        acceptButtonText: 'Delete user',
      },
    };

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (action === DialogActionEnum.Accept) {
          this.usersService
            .deleteUser(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.getData());
        }
      });
  }

  override getData(): void {
    this.usersService
      .getUsers(paramsStringify(this.params))
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.setData(data);
        this.isLoaded = true;
      });
  }

  private openDialog(data?: IUserItem) {
    let dialogConfig = new MatDialogConfig();

    dialogConfig = {
      ...dialogConfig,
      width: '100%',
      maxWidth: '700px',
      maxHeight: '90vh',
      data: {
        userData: data,
      },
    };

    this.dialog
      .open(UserDialogComponent, dialogConfig)
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (action && action !== DialogActionEnum.Close) {
          this.getData();
        }
      });
  }

  changeGlobalNotificationsReceiver(id: number, value: boolean) {
    this.isLoaded = false;
    this.usersService
      .changeGlobalNotificationsReceiver(id, !value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.getData());
  }

  getFirstLetter(contact: string): string {
    return contact.slice(0, 1).toUpperCase();
  }
}
