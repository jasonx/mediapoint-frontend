import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { takeUntil } from 'rxjs';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { UploadService } from 'src/app/core/services/upload.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.less'],
  providers: [AutoDestroyService],
})
export class UploadComponent implements OnInit {
  @Input() text: string = 'Upload artwork';
  @Input() isShowRequirement: boolean = true;
  @Input() file: any;
  @Input() accept: string;
  @Input() isAsImage: boolean;
  @Input() isOneStep: boolean;
  @Input() isMarkAsRequired: boolean;
  @Input() rotate: number = 0;
  @Input() maxSize: number = 1000;

  @Output() loadedFileEvent = new EventEmitter();
  @Output() deleteFileEvent = new EventEmitter();

  @ViewChild('fileDropRef') fileDropEl: ElementRef;

  url: string;
  error: string;
  isSmallContainer: boolean;
  isPreviewReady: boolean;

  constructor(
    private uploadService: UploadService,
    private destroy$: AutoDestroyService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    if (this.elementRef.nativeElement.offsetWidth < 400) {
      this.isSmallContainer = true;
    }

    if (this.file && !this.file.id) {
      this.readFile();
    }

    this.subscribeToReload();
  }

  subscribeToReload(): void {
    this.uploadService.reloadEvent$
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
      this.loadedFileEvent.emit(this.file);

      return;
    }

    this.file = files[0];
    this.file = new File([this.file], this.replaceForbidden(this.file.name), {
      type: this.file.type,
    });

    this.fileDropEl.nativeElement.value = '';

    if (this.isAsImage) {
      this.readFile();
    }

    this.loadedFileEvent.emit(this.file);
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

  reloadFile(): void {
    if (!this.fileDropEl) {
      return;
    }

    this.fileDropEl.nativeElement.dispatchEvent(
      new MouseEvent('click', { bubbles: true })
    );
  }

  onDeleteFile(): void {
    this.file = null;
    this.url = '';
    this.isPreviewReady = false;
    this.deleteFileEvent.emit();
  }

  get isShowResult(): boolean {
    return this.isOneStep
      ? false
      : this.isAsImage
      ? this.url || this.file?.url
      : this.file;
  }

  isReady($event: boolean) {
    this.isPreviewReady = $event;
  }
}
