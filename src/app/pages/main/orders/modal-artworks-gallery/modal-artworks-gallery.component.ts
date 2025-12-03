import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-artworks-gallery',
  templateUrl: './modal-artworks-gallery.component.html',
  styleUrls: ['./modal-artworks-gallery.component.less'],
})
export class ModalArtworksGalleryComponent {
  artworksImgs: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { imgs: string[] }
  ) {
    if (data) {
      this.artworksImgs = data.imgs;
    }
  }
}
