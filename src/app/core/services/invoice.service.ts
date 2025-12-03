import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IFile } from '../models/file.model';
import { IFilterDefaultValues } from '../models/filter.model';
import { IInvoiceDetails, IInvoiceItem } from '../models/invoices.model';
import { ITableRequest } from '../models/table.model';
import { API_URL, forAdmin, UrlGenerator } from './api-urls';
import { ApiService } from './api.service';
import { AuthorizationService } from './authorization.service';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  constructor(
    private readonly apiService: ApiService,
    private authorizationService: AuthorizationService
  ) {}

  getInvoices(queryParams: string): Observable<ITableRequest<IInvoiceItem[]>> {
    return this.apiService.get(
      forAdmin(this.isAdmin, API_URL.INVOICES) + queryParams
    );
  }

  getInvoice(invoiceId: string): Observable<IInvoiceDetails> {
    return this.apiService.get(
      UrlGenerator.generate(forAdmin(this.isAdmin, API_URL.INVOICES_BY_ID), {
        invoiceId,
      })
    );
  }

  getInvoicesFilter(): Observable<IFilterDefaultValues> {
    return this.apiService.get(forAdmin(this.isAdmin, API_URL.INVOICES_FILTER));
  }

  getOrderPdf(invoiceId: string): Observable<IFile> {
    return this.apiService.getBlob(
      UrlGenerator.generate(forAdmin(this.isAdmin, API_URL.INVOICES_PDF), {
        invoiceId,
      })
    );
  }

  get isAdmin(): boolean {
    return this.authorizationService.isAdmin;
  }
}
