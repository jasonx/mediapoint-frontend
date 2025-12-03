import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
// import { PDFProgressData } from 'ng2-pdf-viewer';
import { takeUntil } from 'rxjs';
import { UploadService } from '../../../core/services/upload.service';
import { AutoDestroyService } from '../../../core/services/auto-destroy.service';

@Component({
  selector: 'app-artwork-img',
  templateUrl: './artwork-img.component.html',
  styleUrls: ['./artwork-img.component.less'],
})
export class ArtworkImgComponent implements OnInit {
  isLoading: boolean = true;
  progress: number = 0;
  @Input() id: string;
  @Input() src: string = '';
  @Input() rotate: number = 0;
  @Input() previewUrl: string = '';
  @Output() isReady = new EventEmitter<boolean>();

  constructor(
    private uploadService: UploadService,
    public destroy$: AutoDestroyService
  ) {}

  ngOnInit(): void {
    this.uploadService.uploadProgress
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.isLoading = true;

        value
          .sort((a, b) => (a.progress < b.progress ? 1 : -1))

          .forEach((item) => {
            this.progress = item.progress;
          });

        if (value.every((item) => item.progress === 100)) {
          this.isLoading = false;
        }
      });
  }

  // onProgress(event: PDFProgressData): void {
  //   this.progress = Math.round((100 * event.loaded) / event.total);
  // }
  onProgress(event: any): void {
    this.progress = Math.round((100 * event.loaded) / event.total);
  }

  isLoaded(): void {
    this.isLoading = false;
    this.isReady.emit(true);
  }
}
