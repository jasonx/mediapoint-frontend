import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { ArtworkStatus, JobStatus } from 'src/app/core/enums/status.enum';
import { IArtworkItem } from 'src/app/core/models/artwork.model';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { AuthorizationService } from 'src/app/core/services/authorization.service';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { EventService } from 'src/app/core/services/event.service';
import { ArtworkModalComponent } from '../artwork-modal/artwork-modal.component';
import { ArtworkUploadModalComponent } from '../artwork-upload-modal/artwork-upload-modal.component';
import { ArtworkSaveModalComponent } from '../artwork-save-modal/artwork-save-modal.component';
import { OrderService } from '../../../../../core/services/order.service';
import { saveAs } from 'file-saver';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-artwork',
  templateUrl: './artwork.component.html',
  styleUrls: ['./artwork.component.less'],
  providers: [AutoDestroyService],
})
export class ArtworkComponent {
  @Input() jobId: string;
  @Input() jobStatus: JobStatus;

  @Input() set setArtworkData(artwork: IArtworkItem) {
    this.artworkData = artwork;
  }

  artworkData: IArtworkItem;

  constructor(
    public dialog: MatDialog,
    private authorizationService: AuthorizationService,
    private eventService: EventService,
    private orderService: OrderService,
    private toast: HotToastService,
    private destroy$: AutoDestroyService
  ) {}

  loadFile(): void {
    const config = {
      width: '70%',
      maxWidth: '900px',
      panelClass: 'overflow-visible-container',
      data: {
        jobId: this.jobId,
        artwork: this.artworkData,
      },
    };

    this.dialog.open(ArtworkSaveModalComponent, config);
  }

  showArtwork(): void {
    const config = {
      width: '70%',
      maxWidth: '900px',
      panelClass: 'overflow-visible-container',
      data: {
        jobId: this.jobId,
        artwork: this.artworkData,
      },
    };
    const dialog =
      this.isAdmin && !this.isError
        ? this.dialog.open(ArtworkUploadModalComponent, config)
        : this.isAdmin && this.isAdminRejected
        ? this.dialog.open(ArtworkUploadModalComponent, config)
        : this.dialog.open(ArtworkModalComponent, config);

    dialog
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: { artworks: IArtworkItem[] | null; isReupload: boolean }) => {
          if (data?.artworks) {
            this.eventService.event$.next('');
          }

          if (data?.isReupload) {
            this.loadFile();
          }
        }
      );
  }

  onDownload(): void {
    saveAs(this.artworkData.url, this.artworkData.name);

    this.toast.show('The artwork is loading...', {
      position: 'top-center',
      duration: 3000,
      style: {
        boxShadow: '0 3px 12px #19623f36',
        border: '1px solid #168952',
        padding: '16px',
        color: '#168952',
      },
    });
  }

  get buttonConfig(): IButtonConfig {
    return {
      viewType: ButtonViewType.LightBlue,
      minWidth: '100%',
      text: this.isAdmin ? this.adminButtonText : this.clientButtonText,
      icon: this.isAdmin ? 'eye-show.svg' : this.adminButtonIcon,
    };
  }

  get isError(): boolean {
    return (
      (this.isAdmin &&
        this.artworkData?.status === ArtworkStatus.clientRejected) ||
      this.isAdminRejected
    );
  }

  get isAdminRejected(): boolean {
    return this.artworkData?.status === ArtworkStatus.adminRejected;
  }

  get isAdminApproved(): boolean {
    return this.artworkData?.status === ArtworkStatus.adminApproved;
  }

  get isClientRejected(): boolean {
    return this.artworkData?.status === ArtworkStatus.clientRejected;
  }

  get isShowButton(): boolean {
    return this.isAdmin
      ? !this.orderService.isJobStatusCanceled(this.jobStatus) &&
          (!this.isProduction || this.isAdminApproved || this.isError)
      : !this.orderService.isJobStatusCanceled(this.jobStatus) &&
          (this.isAdminApproved || this.isError);
  }

  get isProduction(): boolean {
    const { jobStatus } = this;

    return !!(
      jobStatus === JobStatus.proofApproved ||
      JobStatus.prepressReady ||
      JobStatus.printReady ||
      JobStatus.finishingReady
    );
  }

  get isAdmin(): boolean {
    return this.authorizationService.isAdmin;
  }

  get clientButtonText(): string {
    return this.isError ? 'Fix error' : 'Show proof';
  }

  get adminButtonText(): string {
    return this.isError
      ? this.isAdminRejected
        ? 'Reupload PDF'
        : 'Fix error'
      : 'Reupload PDF';
  }

  get adminButtonIcon(): string {
    return this.isError
      ? this.isAdminRejected
        ? 'upload-blue.svg'
        : 'eye-show.svg'
      : 'upload-blue.svg';
  }
}
