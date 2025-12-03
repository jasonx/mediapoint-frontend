import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { takeUntil } from 'rxjs';
import { IGeneralArticle } from 'src/app/core/models/blog.model';
import { IBreadcrumbs } from 'src/app/core/models/breadcrumbs.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { BlogService } from 'src/app/core/services/blog.service';
import { SeoService } from 'src/app/core/services/seo.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-article-page',
  templateUrl: './article-page.component.html',
  styleUrls: ['./article-page.component.less'],
  providers: [AutoDestroyService],
})
export class ArticlePageComponent implements OnInit {
  breadcrumbs: IBreadcrumbs[] = [];
  title: string;
  articleData: IGeneralArticle | null = null;
  processedContent: SafeHtml;

  constructor(
    private blogService: BlogService,
    private destroy$: AutoDestroyService,
    private seoService: SeoService,
    private toast: HotToastService,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const slug = params.get('slug');
      
      if (slug) {
        this.getArticles(slug);
      }
    });
  }

  getArticles(slug: string): void {
    this.blogService
      .getArticle(slug)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.articleData = data;
        this.title = data.title;
        this.processedContent = this.sanitizeAndProcessContent(data.content);
        this.breadcrumbs = [
          {
            name: 'Blog',
            url: '/blog',
          },
          {
            name: this.title,
          },
        ];
        this.initMetaTags();
      });
  }

  initMetaTags(): void {
    this.seoService.updateTitle(`${this.title} | Mediapoint`);
    this.seoService.updateMetaTags([
      {
        property: 'og:title',
        content: this.title,
      },
      {
        name: 'twitter:title',
        content: this.title,
      },
    ]);
  }

  sanitizeAndProcessContent(content: string): SafeHtml {
    const processedContent = content
      .replace(
        /<figure[^>]*data-trix-attachment="([^"]*)"[^>]*>.*?<a href="([^"]*)">.*?<\/figure>/g,
        (match, attachmentData, mediaUrl) => {
          const parsedData = JSON.parse(attachmentData.replace(/&quot;/g, '"'));

          if (parsedData.contentType === 'video/mp4') {
            return `<video controls width="100%"><source src="${this.resolveUrl(mediaUrl)}" type="${parsedData.contentType}">Your browser does not support the video tag.</video>`;
          } else if (parsedData.contentType === 'image/png' || parsedData.contentType === 'image/jpeg' || parsedData.contentType === 'image') {
            return `<img src="${this.resolveUrl(mediaUrl)}" width="${parsedData.width || '100%'}" height="${parsedData.height || 'auto'}" alt="${parsedData.filename || 'Image'}">`;
          }

          return match;
        }
      )
      .replace(
        /https:\/\/vimeo\.com\/(\d+)(?:\/([\w\d]+))?/g,
        (match, videoId, privateToken) => {
            const videoUrl = `https://player.vimeo.com/video/${videoId}${privateToken ? `?h=${privateToken}` : ''}`;
            return `<iframe src="${videoUrl}" width="830" height="466" frameborder="0" allowfullscreen></iframe>`;
        }
      )
      .replace(
        /https:\/\/youtu\.be\/([\w-]+)/g,
        (match, videoId) => `<iframe src="https://www.youtube.com/embed/${videoId}" width="830" height="466" frameborder="0" allowfullscreen></iframe>`
      )
      .replace(
        /https:\/\/www\.loom\.com\/share\/([\w\d]+)/g,
        (match, videoId) => `<iframe src="https://www.loom.com/embed/${videoId}" width="830" height="466" frameborder="0" allowfullscreen></iframe>`
      );

    return this.sanitizer.bypassSecurityTrustHtml(processedContent);
  }

  private resolveUrl(url: string): string {
    return url.startsWith('http') ? url : `${environment.pusher_url}${url}`;
  }

  onCopy(event: MouseEvent) {
    event.preventDefault();

    const link = (event.target as HTMLLinkElement)?.href;

    navigator.clipboard.writeText(link).then(() => {
      this.showSuccessToast('Link added to the buffer');
    })
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

}
