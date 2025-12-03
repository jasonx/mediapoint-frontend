import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { IBlogData, IGeneralArticle } from 'src/app/core/models/blog.model';
import { IBreadcrumbs } from 'src/app/core/models/breadcrumbs.model';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { BlogService } from 'src/app/core/services/blog.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.less'],
  providers: [AutoDestroyService],
})
export class BlogComponent implements OnInit {
  breadcrumbs: IBreadcrumbs[] = [];
  title: string = 'Blog';
  articles: IGeneralArticle[] | null = null;
  blogData: IBlogData;

  constructor(
    private blogService: BlogService,
    private destroy$: AutoDestroyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.initParams();
  }

  initParams(): void {
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.getArticles(params);
      });
  }

  getArticles(params: { [key: string]: string }): void {
    this.blogService
      .getAllArticles(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.blogData = data;
        this.articles = data.data;
        this.breadcrumbs = [
          {
            name: this.title,
          },
        ];
      });
  }

  onChangePage(page: PageEvent): void {
    this.router
      .navigate(['./'], {
        queryParams: { current_page: page.pageIndex + 1 },
        relativeTo: this.activatedRoute,
      }).then();
  }
}
