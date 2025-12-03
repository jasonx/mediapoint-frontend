import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { delay, of, takeUntil } from 'rxjs';
import { ButtonViewType } from 'src/app/core/enums/button-view-type.enum';
import { ArtworkStatus } from 'src/app/core/enums/status.enum';
import { IButtonConfig } from 'src/app/core/models/button-config.model';
import { IUploadedArtwork } from 'src/app/core/models/cart.mode';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { CartService } from 'src/app/core/services/cart.service';
import { toKebabCase } from 'src/app/shared/utils/kebab-case';
import { saveAs } from 'file-saver';
import { HotToastService } from '@ngneat/hot-toast';
import { UploadSBigFileService } from 'src/app/core/services/upload-big-file.service';

@Component({
  selector: 'app-artwork-edit',
  templateUrl: './artwork-edit.component.html',
  styleUrls: ['./artwork-edit.component.less'],
  providers: [AutoDestroyService],
})
export class ArtworkEditComponent implements OnInit {
  accept = 'application/pdf,application/vnd.ms-excel';

  artworkId: string;
  jobId: string;
  artwork: IUploadedArtwork;
  isLoading = false;

  toKebabCase = toKebabCase;

  get buttonCloseConfig(): IButtonConfig {
    return {
      text: 'Close',
      viewType: ButtonViewType.TransparentBlue,
      minWidth: '100%',
    };
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private toast: HotToastService,
    private uploadSBigFileService: UploadSBigFileService,
    private destroy$: AutoDestroyService
  ) {}

  ngOnInit(): void {
    this.artworkId = this.activatedRoute.snapshot.params?.['artworkId'];
    this.jobId = this.activatedRoute.snapshot.params?.['jobId'];

    this.getArtworkById();
    this.subscribeToUpdates();
  }

  getArtworkById(): void {
    this.cartService
      .getArtworkById(this.jobId, this.artworkId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data) {
          this.artwork = data;
        }
      });
  }

  subscribeToUpdates(): void {
    this.cartService.updatedArtwork$
      .pipe(takeUntil(this.destroy$))
      .subscribe((updatedArtwork) => {
        if (updatedArtwork && this.artwork && updatedArtwork.id === this.artwork.id) {
          this.artwork = updatedArtwork;
          this.isLoading = false;
        }
      })
  }

  onTrimbox(): void {
    this.isLoading = true;
    this.cartService.trimbox([+this.artworkId])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.showSuccessToast());  
  }

  onScale(): void {
    this.isLoading = true;
    this.cartService.scale([+this.artworkId])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.showSuccessToast()); 
  }

  onRotate(): void {
    this.isLoading = true;
    this.cartService.rotate([+this.artworkId])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.showSuccessToast());
  }

  onDownload(): void {
    if (!this.artwork.url || !this.artwork.fileName) {
      return;
    }

    saveAs(this.artwork.url, this.artwork.fileName);
    this.showSuccessToast('The artwork is loading...');
  }

  fileDownloaded(artworkId: string): void {
    this.cartService
      .getArtworkById(this.jobId, this.artworkId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data) {
          this.artwork = data;

          if (this.artwork.previewUrl?.includes('pdf-file.svg')) {
            of(null).pipe(delay(3000)).subscribe(() => this.fileDownloaded(artworkId));
          }
        }
      });
  }

  onUploadNewFile(): void {
    this.uploadSBigFileService.reloadEvent$.next(true);
  }

  startLoadedFile(): void {
    this.artwork.previewUrl = '';
  }

  showSuccessToast(message: string = 'Success!'): void {
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

  close(): void {
    this.router.navigate([`/cart/artwork-details/${this.jobId}`]);
  }

  get isError(): boolean {
    return this.artwork && this.artwork.status === ArtworkStatus.artworkError;
  }
}
