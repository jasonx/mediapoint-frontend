import { Component, Input } from '@angular/core';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-copy-btn',
  templateUrl: './copy-btn.component.html',
  styleUrls: ['./copy-btn.component.less'],
})
export class CopyBtnComponent {
  @Input() text: string;
  @Input() color: string = '#111729';

  constructor(private toast: HotToastService) {}

  copyText(): void {
    navigator.clipboard.writeText(this.text).then(() => {
      this.toast.show('Copied to clipboard', {
        position: 'top-center',
        duration: 3000,
        style: {
          boxShadow: '0 3px 12px #19623f36',
          border: '1px solid #168952',
          padding: '16px 50px',
          color: '#168952',
        },
      });
    });
  }
}
