import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { IArtworkItem } from 'src/app/core/models/artwork.model';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { OrderService } from 'src/app/core/services/order.service';
import { UploadService } from 'src/app/core/services/upload.service';
import { AuthorizationService } from '../../../../../core/services/authorization.service';
import { ArtworkRejectModalComponent } from '../artwork-reject-modal/artwork-reject-modal.component';
import { ArtworkUploadModalComponent } from '../artwork-upload-modal/artwork-upload-modal.component';
import { ArtworkStatus } from '../../../../../core/enums/status.enum';
import { EventService } from '../../../../../core/services/event.service';
import { saveAs } from 'file-saver';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-artwork-modal',
  templateUrl: './artwork-modal.component.html',
  styleUrls: ['./artwork-modal.component.less'],
  providers: [AutoDestroyService],
})
export class ArtworkModalComponent implements OnInit, OnDestroy {
  newFile: File;
  isLoadedBtn: boolean = true;
  rotate: number = 0;
  loadedBtn = {
    trimbox: true,
    scale: true,
    rotate: true,
  };
  uploadButtonConfig: IButtonConfig = {
    text: 'Upload proof',
    viewType: ButtonViewType.Filled,
    minWidth: '172px',
  };
  rejectButtonConfig: IButtonConfig = {
    text: this.isAdmin ? 'Reject artwork' : 'Reject proof',
    viewType: ButtonViewType.LightBlue,
    minWidth: '172px',
  };
  saveButtonConfig: IButtonConfig = {
    text: 'Save',
    viewType: ButtonViewType.Filled,
    minWidth: '100%',
  };

  constructor(
    public dialogRef: MatDialogRef<ArtworkModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      jobId: string;
      artwork: IArtworkItem;
    },
    public dialog: MatDialog,
    private orderService: OrderService,
    private uploadService: UploadService,
    private authorizationService: AuthorizationService,
    private destroy$: AutoDestroyService,
    private eventService: EventService,
    private toast: HotToastService
  ) {}

  ngOnInit(): void {
    this.uploadService.uploadProgress
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.uploadService.isLoaded) {
          this.uploadService.clearBuffer();
          this.orderService
            .reUploadArtwork(this.data.jobId, this.data.artwork.id, {})
            .pipe(takeUntil(this.destroy$))
            .subscribe((artworks) => {
              this.isLoadedBtn = true;
              this.close({ artworks });
              this.eventService.event$.next('');
            });
        }
      });
  }

  rejectProof(): void {
    if (this.isAdmin) {
      this.dialog.open(ArtworkRejectModalComponent, {
        width: '70%',
        maxWidth: '900px',
        data: this.data,
      });

      this.close();
    } else {
      this.orderService
        .rejectArtwork(this.data.jobId, this.data.artwork.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((artworks) => this.close({ artworks, isReupload: true }));
    }
  }

  onDownload(): void {
    const file = this.newFile || this.data.artwork.url;
    const name = this.newFile?.name || this.data.artwork.name;

    saveAs(file, name);

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

  onTrimbox(): void {
    this.loadedBtn.trimbox = false;

    this.orderService
      .trimboxArtwork(this.data.jobId, this.data.artwork.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateArtwork());
  }

  onScale(): void {
    this.loadedBtn.scale = false;

    this.orderService
      .autoScaleArtwork(this.data.jobId, this.data.artwork.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateArtwork());
  }

  onRotate(): void {
    this.loadedBtn.rotate = false;
    this.rotate = (this.rotate + 90) % 360;

    this.orderService
      .rotateArtwork(this.data.jobId, this.data.artwork.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateArtwork());
  }

  updateArtwork(): void {
    this.showSuccessToast();
    this.eventService.event$.next('');

    this.loadedBtn = {
      scale: true,
      trimbox: true,
      rotate: true,
    };
  }

  showSuccessToast(): void {
    this.toast.show('Success!', {
      position: 'top-center',
      duration: 3000,
      style: {
        boxShadow: '0 3px 12px #19623f36',
        border: '1px solid #168952',
        padding: '16px 50px',
        color: '#168952',
      },
    });
  }

  onReload(): void {
    this.uploadService.reloadEvent$.next(true);
  }

  uploadFile(file: any): void {
    this.newFile = file;
  }

  close(data?: {
    artworks: IArtworkItem[] | null;
    isReupload?: boolean;
  }): void {
    this.dialogRef.close(data);
  }

  uploadProof(): void {
    this.close();
    this.dialog.open(ArtworkUploadModalComponent, {
      width: '70%',
      maxWidth: '900px',
      data: this.data,
    });
  }

  saveArtwork(): void {
    if (!this.newFile) {
      this.close();

      return;
    }

    this.uploadService.upcomingArtworksSet.add(this.data.artwork.id);
    this.isLoadedBtn = false;

    this.uploadService.uploadFile(
      this.newFile,
      this.newFile.name,
      this.data.artwork.id
    );
  }

  get isAdmin(): boolean {
    return this.authorizationService.isAdmin;
  }

  get isError(): boolean {
    return (
      ArtworkStatus.adminRejected === this.data.artwork.status ||
      this.isRejectComment
    );
  }

  get isRejectComment(): boolean {
    return !!this.data.artwork.rejectComment;
  }

  get isAdminApproved(): boolean {
    return ArtworkStatus.adminApproved === this.data.artwork.status;
  }

  ngOnDestroy(): void {
    this.uploadService.clearBuffer();
  }
}
