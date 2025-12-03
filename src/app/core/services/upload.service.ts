import { BehaviorSubject, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Upload } from 'tus-js-client';
import { environment } from '../../../environments/environment';
import { AuthorizationService } from './authorization.service';

export interface FileStatus {
  filename: string;
  progress: number;
  hash: string;
  uuid: string;
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  public reloadEvent$ = new BehaviorSubject(false);
  private uploadStatus = new Subject<FileStatus[]>();
  uploadProgress = this.uploadStatus.asObservable();
  fileStatusArr: FileStatus[] = [];

  upcomingArtworksSet = new Set<string>();
  loadedArtworksSet = new Set<string>();

  constructor(private authorizationService: AuthorizationService) {}

  uploadFile(file: File, filename: string, id: string) {
    const fileStatus: FileStatus = {
      filename,
      progress: 0,
      hash: '',
      uuid: '',
    };
    const MAX_CHUNK = 100000000;
    const chunkSize =
      file.size / 4 < MAX_CHUNK ? Math.floor(file.size / 4) : MAX_CHUNK;

    this.fileStatusArr.push(fileStatus);

    this.uploadStatus.next(this.fileStatusArr);

    const upload = new Upload(file, {
      endpoint: this.authorizationService.isAdmin
        ? `${environment.api_url}/admin/tus/proofs/${id}`
        : `${environment.api_url}/tus/artworks/${id}`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      chunkSize,
      headers: {
        Authorization: 'Bearer ' + this.authorizationService.token,
      },
      metadata: {
        filename,
        filetype: file.type,
      },
      removeFingerprintOnSuccess: true,
      onError: async (error) => {
        console.log(error);
        this.clearBuffer();

        return false;
      },
      onChunkComplete: (_chunkSize, bytesAccepted, bytesTotal) => {
        this.fileStatusArr.forEach((value) => {
          if (value.filename === filename) {
            value.progress = Math.floor((bytesAccepted / bytesTotal) * 100);

            if (upload.url) {
              value.uuid = upload.url.split('/').slice(-1)[0];
            }
          }
        });
        this.uploadStatus.next(this.fileStatusArr);
      },
      onSuccess: async () => {
        this.fileStatusArr.forEach((value) => {
          if (value.filename === filename) {
            value.progress = 100;
            this.loadedArtworksSet.add(id);
          }
        });
        this.uploadStatus.next(this.fileStatusArr);

        return true;
      },
    });

    upload.start();
  }

  get isLoaded(): boolean {
    return (
      JSON.stringify(Array.from(this.loadedArtworksSet).sort()) ===
      JSON.stringify(Array.from(this.upcomingArtworksSet).sort())
    );
  }

  clearBuffer(): void {
    this.upcomingArtworksSet.clear();
    this.loadedArtworksSet.clear();
  }
}
