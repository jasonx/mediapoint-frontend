import { Component, Input } from '@angular/core';
import { JobStatus } from 'src/app/core/enums/status.enum';
import { IArtworkItem } from 'src/app/core/models/artwork.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';

@Component({
  selector: 'app-artworks',
  templateUrl: './artworks.component.html',
  styleUrls: ['./artworks.component.less'],
  providers: [AutoDestroyService],
})
export class ArtworksComponent {
  @Input() jobId: string;
  @Input() jobStatus: JobStatus;
  @Input() artworks: IArtworkItem[] = [];
}
