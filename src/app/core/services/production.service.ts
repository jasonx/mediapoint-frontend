import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { ITableRequest } from '../models/table.model';
import { IProductionItem } from '../models/production.model';
import { IFilterDefaultValues } from '../models/filter.model';
import { IProductionNewProof } from '../../shared/components/job-details-wrap/artworks/artwork-confirm-modal/artwork-confirm-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ProductionService {
  constructor(private readonly apiService: ApiService) {}

  getItems(queryParams: string): Observable<ITableRequest<IProductionItem[]>> {
    return this.apiService.get('/admin/production' + queryParams);
  }

  deleteJob(id: string): Observable<{ deleted: boolean }> {
    return this.apiService.delete(`/admin/production/${id}`);
  }

  duplicateJob(id: string): Observable<{ message: string }> {
    return this.apiService.post(`/admin/production/${id}/replicate`);
  }

  getJobsFilter(): Observable<IFilterDefaultValues> {
    return this.apiService.get(`/admin/production/filter`);
  }

  duplicateJobs(selected: string[]): Observable<{ message: string }> {
    return this.apiService.post('/admin/production/replicate', {
      selected,
    });
  }

  deleteJobs(selected: string[]): Observable<{ message: string }> {
    return this.apiService.delete('/admin/production', {
      selected,
    });
  }

  uploadNewProof(data: IProductionNewProof): Observable<{ message: string }> {
    return this.apiService.postFormData(
      `/admin/orders/jobs/${data.job}/proofs/${data.artwork}/upload`,
      data
    );
  }
}
