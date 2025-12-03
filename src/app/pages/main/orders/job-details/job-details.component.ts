import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, takeUntil } from 'rxjs';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { DialogActionEnum } from 'src/app/core/enums/dialog-action.enum';
import { JobStatus } from 'src/app/core/enums/status.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { IDialogConfig } from 'src/app/core/models/dialog-config.model';
import { IJob } from 'src/app/core/models/job.model';
import { IPriceDetails } from 'src/app/core/models/price-details.model';
import { AuthorizationService } from 'src/app/core/services/authorization.service';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { OrderService } from 'src/app/core/services/order.service';
import { ConfirmChangesComponent } from '../confirm-changes/confirm-changes.component';
import { ProductionService } from '../../../../core/services/production.service';
import { HotToastService } from '@ngneat/hot-toast';
import { NavigationHistoryService } from '../../../../core/services/navigation-history.service';
import { EventService } from '../../../../core/services/event.service';

// TODO: Not needed component (also ProductionService)

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.less'],
  providers: [AutoDestroyService],
})
export class JobDetailsComponent implements OnInit, OnDestroy {
  jobId: string;
  jobsData: IJob;
  priceDetails: IPriceDetails;
  backButtonConfig: IButtonConfig = {
    text: 'Back',
    viewType: ButtonViewType.Back,
    padding: '0 22px',
  };
  get confirmButtonConfig(): IButtonConfig {
    return {
      text: 'Confirm changes',
      viewType: ButtonViewType.Filled,
      minWidth: '100%',
      isDisabled: !this.orderService.isConfirmBtnActive,
    };
  }
  dialogCancelConfig: IDialogConfig = {
    title: 'Cancel job?',
    message: 'Are you sure you want to cancel this job?',
    declineButtonText: 'Close',
    informationButtonText: 'Cancel',
  };

  constructor(
    private orderService: OrderService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authorizationService: AuthorizationService,
    private productionService: ProductionService,
    private dialog: MatDialog,
    private destroy$: AutoDestroyService,
    private toast: HotToastService,
    private cdr: ChangeDetectorRef,
    private navigationService: NavigationHistoryService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.jobId = this.activatedRoute.snapshot.params?.['jobId'];
    this.eventService.event$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.getJobData(true));

    this.getJobData();
  }

  getJobData(isUpdate?: boolean): void {
    this.orderService
      .getJob(this.jobId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (isUpdate && data.status === JobStatus.proofApproved) {
          this.router
            .navigate(['../../'], { relativeTo: this.activatedRoute })
            .then();
        }

        this.jobsData = data as IJob;
        this.priceDetails = data.priceDetails;
        this.cdr.detectChanges();
      });
  }

  duplicateJob(jobId: string): void {
    this.productionService
      .duplicateJob(jobId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  deleteJob(jobId: string): void {
    this.productionService
      .deleteJob(jobId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.navigationService.back();
      });
  }

  confirmChanges(): void {
    const dialogRef = this.dialog.open(ConfirmChangesComponent);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((action) => {
        if (action === DialogActionEnum.Accept) {
          this.orderService
            .changeStatus()
            .pipe(
              takeUntil(this.destroy$),
              catchError((err) => {
                if (err.status === 422) {
                  this.toast.show('This status cannot be changed!', {
                    position: 'top-center',
                    duration: 5000,
                    style: {
                      boxShadow: '0 3px 12px #ffecec',
                      border: '1px solid #A83B3B',
                      padding: '16px',
                      color: '#A83B3B',
                    },
                  });
                }

                this.getJobData();
                throw err;
              })
            )
            .subscribe(() => this.eventService.event$.next(''));
        }
      });
  }

  get isAdmin(): boolean {
    return this.authorizationService.isAdmin;
  }

  ngOnDestroy(): void {
    this.orderService.statusChangesData = {};
  }
}
