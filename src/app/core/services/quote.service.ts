import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { IFile } from '../models/file.model';
import { IFilterDefaultValues } from '../models/filter.model';
import { IOrderRedirectData } from '../models/orders.model';
import { IQuoteItem, IQuoteJob } from '../models/quotes.model';
import { ITableRequest } from '../models/table.model';
import { API_URL, forAdmin, UrlGenerator } from './api-urls';
import { ApiService } from './api.service';
import { AuthorizationService } from './authorization.service';

@Injectable({
  providedIn: 'root',
})
export class QuoteService {
  constructor(
    private readonly apiService: ApiService,
    private authorizationService: AuthorizationService,
    private router: Router
  ) {}

  getQuotes(queryParams: string): Observable<ITableRequest<IQuoteItem[]>> {
    return this.apiService.get(
      forAdmin(this.isAdmin, API_URL.QUOTES) + queryParams
    );
  }

  getQuote(quoteId: number): Observable<IQuoteJob> {
    return this.apiService.get(
      UrlGenerator.generate(forAdmin(this.isAdmin, API_URL.QUOTES_BY_ID), {
        quoteId,
      })
    );
  }

  getQuotesFilter(): Observable<IFilterDefaultValues> {
    return this.apiService.get(forAdmin(this.isAdmin, API_URL.QUOTES_FILTER));
  }

  createOrderByQuotes(quoteIds: string[]): Observable<IOrderRedirectData> {
    return this.apiService
      .post(forAdmin(this.isAdmin, API_URL.QUOTES_CREATE_ORDER), {
        selected: quoteIds,
      })
      .pipe(tap(() => this.redirectToCartPage()));
  }

  createOrderByQuotesId(
    quoteId: string,
    quoteReference: string = ''
  ): Observable<IOrderRedirectData> {
    return this.apiService
      .post(
        UrlGenerator.generate(
          forAdmin(this.isAdmin, API_URL.QUOTES_CREATE_ORDER_BY_ID),
          { quoteId }
        ),
        { quoteReference }
      )
      .pipe(tap(() => this.redirectToCartPage()));
  }

  copyQuotes(quoteIds: string[]): Observable<{ message: string }> {
    return this.apiService.post(forAdmin(this.isAdmin, API_URL.QUOTES_COPY), {
      selected: quoteIds,
    });
  }

  copyQuoteById(quoteId: string): Observable<{ message: string }> {
    return this.apiService.post(
      UrlGenerator.generate(forAdmin(this.isAdmin, API_URL.QUOTE_COPY_BY_ID), {
        quoteId,
      })
    );
  }

  copyQuoteJob(jobId: string): Observable<{ message: string }> {
    return this.apiService.post(
      UrlGenerator.generate(forAdmin(this.isAdmin, API_URL.QUOTE_JOB_COPY), {
        jobId,
      })
    );
  }

  deleteQuotes(quoteIds: string[]): Observable<{ message: string }> {
    return this.apiService.delete(forAdmin(this.isAdmin, API_URL.QUOTES), {
      selected: quoteIds,
    });
  }

  deleteQuoteById(quoteId: string): Observable<{ message: string }> {
    return this.apiService.delete(
      UrlGenerator.generate(forAdmin(this.isAdmin, API_URL.QUOTES_BY_ID), {
        quoteId,
      })
    );
  }

  deleteQuoteJob(jobId: string): Observable<{ message: string }> {
    return this.apiService.delete(
      UrlGenerator.generate(forAdmin(this.isAdmin, API_URL.QUOTE_JOB), {
        jobId,
      })
    );
  }

  getQuotePdf(quoteId: string): Observable<IFile> {
    return this.apiService.getBlob(
      UrlGenerator.generate(forAdmin(this.isAdmin, API_URL.QUOTE_PDF), {
        quoteId,
      })
    );
  }

  saveQuoteReference(
    quoteReference: string,
    quoteId: string
  ): Observable<{ message: string }> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.QUOTE_REFERENCE, {
        cartId: quoteId,
      }),
      {
        quoteReference,
      }
    );
  }

  redirectToCartPage(): void {
    this.router.navigate([`/cart`], {
      queryParams: {
        redirect: true,
      }
    });
  }

  get isAdmin(): boolean {
    return this.authorizationService.isAdmin;
  }
}
