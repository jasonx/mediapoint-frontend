import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.less'],
})
export class GalleryComponent {
  @Input() set setImages(imgs: string[]) {
    this.images = imgs;
    this.activeImage = this.images[0];
  }
  @Input() isShowBtn = true;
  @Input() customClass = '';

  images: string[] = [];
  activeImage: string;

  onPrevImg(): void {
    const currentIndex = this.images.indexOf(this.activeImage);
    const prevIndex =
      currentIndex !== 0 ? currentIndex - 1 : this.images.length - 1;

    this.activeImage = this.images[prevIndex];
  }

  onNextImg(): void {
    const currentIndex = this.images.indexOf(this.activeImage);
    const nextIndex =
      currentIndex !== this.images.length - 1 ? currentIndex + 1 : 0;

    this.activeImage = this.images[nextIndex];
  }

  onSelectImg(src: string): void {
    this.activeImage = src;
  }
}
