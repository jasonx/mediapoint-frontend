import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IArtworkItem } from '../../../../../core/models/artwork.model';
import { IButtonConfig } from '../../../../../core/models/button-config.model';
import { ButtonViewType } from '../../../../../core/enums/button-view-type.enum';
import { UploadService } from '../../../../../core/services/upload.service';
import { takeUntil } from 'rxjs';
import { AutoDestroyService } from '../../../../../core/services/auto-destroy.service';
import { OrderService } from '../../../../../core/services/order.service';
import { EventService } from '../../../../../core/services/event.service';

@Component({
  selector: 'app-artwork-save-modal',
  templateUrl: './artwork-save-modal.component.html',
  styleUrls: ['../artwork-modal/artwork-modal.component.less'],
  providers: [AutoDestroyService],
})
export class ArtworkSaveModalComponent implements OnInit, OnDestroy {
  newFile: File;
  saveButtonConfig: IButtonConfig = {
    text: 'Save',
    viewType: ButtonViewType.Filled,
    minWidth: '174px',
  };
  isLoadedBtn: boolean = true;
  constructor(
    public dialogRef: MatDialogRef<ArtworkSaveModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      jobId: string;
      artwork: IArtworkItem;
    },
    private uploadService: UploadService,
    private destroy$: AutoDestroyService,
    private orderService: OrderService,
    private eventService: EventService
  ) {}

  loadFile($event: any): void {
    this.newFile = $event;
  }

  close(artworks: IArtworkItem[] | null): void {
    this.dialogRef.close(artworks);
  }

  saveArtwork(): void {
    this.uploadService.upcomingArtworksSet.add(this.data.artwork.id);
    this.isLoadedBtn = false;

    this.uploadService.uploadFile(
      this.newFile,
      this.newFile.name,
      this.data.artwork.id
    );
  }

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
              this.close(artworks);
              this.eventService.event$.next('');
            });
        }
      });
  }

  ngOnDestroy(): void {
    this.uploadService.clearBuffer();
  }
}
