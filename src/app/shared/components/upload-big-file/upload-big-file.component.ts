import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { delay, of, takeUntil } from 'rxjs';
import { AuthorizationService } from 'src/app/core/services/authorization.service';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { UploadSBigFileService } from 'src/app/core/services/upload-big-file.service';
import { environment } from 'src/environments/environment';
import { Upload } from 'tus-js-client';

@Component({
  selector: 'app-upload-big-file',
  templateUrl: './upload-big-file.component.html',
  styleUrls: ['./upload-big-file.component.less'],
  providers: [AutoDestroyService],
})
export class UploadBigFileComponent implements OnInit {
  @Input() text: string = 'Upload artwork';
  @Input() isShowRequirement: boolean = true;
  @Input() id: string;
  @Input() accept: string;
  @Input() isMarkAsRequired: boolean;
  @Input() rotate: number = 0;
  @Input() maxSize: number = 1000;

  @Output() startLoadedFileEvent = new EventEmitter<boolean>();
  @Output() loadedFileEvent = new EventEmitter<string>();

  @ViewChild('fileDropRef') fileDropEl: ElementRef;

  file: any;
  url: string;
  error: string;
  isPreviewReady: boolean;
  isLoading: boolean;
  progress = 0;

  constructor(
    private authorizationService: AuthorizationService,
    private uploadSBigFileService: UploadSBigFileService,
    private destroy$: AutoDestroyService,
  ) {}

  ngOnInit(): void {
    this.subscribeToReload();
  }

  subscribeToReload(): void {
      this.uploadSBigFileService.reloadEvent$
        .pipe(takeUntil(this.destroy$))
        .subscribe((isReload) => {
          if (isReload) {
            this.reloadFile();
          }
        });
    }

  onFileDropped($event: Event): void {
    this.prepareFilesList($event);
  }

  fileBrowseHandler(event: any): void {
    const { files } = event.target as HTMLInputElement;

    this.prepareFilesList(files);
  }

  prepareFilesList(files: any): void {
    if (!files) {
      return;
    }

    this.checkFile(files[0]);

    if (this.error) {
      this.file = null;

      return;
    }

    this.file = files[0];
    this.file = new File([this.file], this.replaceForbidden(this.file.name), {
      type: this.file.type,
    });

    this.fileDropEl.nativeElement.value = '';
    this.readFile();

    this.uploadFile();
  }

  readFile(): void {
    let reader = new FileReader();

    reader.onload = (e: any) => {
      this.url = e.target.result;
    };

    reader.readAsArrayBuffer(this.file);
  }

  checkFile(file: any): void {
    this.error =
      file.size >= this.maxSize * 1000000
        ? `Maximum size ${this.maxSize}mb`
        : !this.accept.includes(file.type)
        ? 'Incorrect format'
        : '';
  }

  replaceForbidden(name: string): string {
    const forbiddenStrings = /..\/|"|'|&|\/|\\|\?|#|\[|\]|%|:/g;

    return name.replace(forbiddenStrings, '-');
  }

  uploadFile(): void {
    this.startLoadedFileEvent.emit(true);

    this.isLoading = true;
    this.progress = 0;
    const MAX_CHUNK = 100000000;
    const chunkSize =
      this.file.size / 4 < MAX_CHUNK ? Math.floor(this.file.size / 4) : MAX_CHUNK;

    const upload = new Upload(this.file, {
      endpoint: this.authorizationService.isAdmin
        ? `${environment.api_url}/admin/tus/proofs/${this.id}`
        : `${environment.api_url}/tus/artworks/${this.id}`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      chunkSize,
      headers: {
        Authorization: 'Bearer ' + this.authorizationService.token,
      },
      metadata: {
        filename: this.file.name,
        filetype: this.file.type,
      },
      removeFingerprintOnSuccess: true,
      onError: async (error) => {
        this.isLoading = false;
        this.error = error.message;
        console.log(error);

        return false;
      },
      onChunkComplete: (_chunkSize, bytesAccepted, bytesTotal) => {
        this.progress = Math.floor((bytesAccepted / bytesTotal) * 100);
      },
      onSuccess: async () => {
        this.progress = 100;
        of(null).pipe(delay(1500)).subscribe(() => this.loadedFileEvent.emit(this.id));

        return true;
      },
    });

    upload.start();
  }

  reloadFile(): void {
    if (!this.fileDropEl) {
      return;
    }

    this.fileDropEl.nativeElement.dispatchEvent(
      new MouseEvent('click', { bubbles: true })
    );
  }
}
