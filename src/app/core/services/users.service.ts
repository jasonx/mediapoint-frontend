import { Injectable } from '@angular/core';
import { IUserItem } from '../models/user.model';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ITableRequest } from '../models/table.model';
import { API_URL } from './api-urls';
import { removeEmptyFromObj } from '../../shared/utils/remove-empty';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private apiService: ApiService) {}

  getUsers(queryParams: string): Observable<ITableRequest<IUserItem[]>> {
    return this.apiService.get(API_URL.SETTINGS_EMPLOYEES + queryParams);
  }

  getUser(id: number): Observable<IUserItem> {
    return this.apiService.get(`${API_URL.SETTINGS_EMPLOYEES}/${id}`);
  }

  saveUser(data: IUserItem, isEdit: boolean): Observable<IUserItem> {
    return isEdit ? this.editUser(data) : this.addUser(data);
  }

  deleteUser(id: string): Observable<string> {
    return this.apiService.delete(`${API_URL.SETTINGS_EMPLOYEES}/${id}`);
  }

  changeGlobalNotificationsReceiver(
    id: number,
    value: boolean
  ): Observable<string> {
    return this.apiService.post(
      `${API_URL.SETTINGS_EMPLOYEES}/${id}/notifications`,
      { isGlobalNotificationsReceiver: value }
    );
  }

  private addUser(data: IUserItem) {
    return this.apiService.post(
      API_URL.SETTINGS_EMPLOYEES,
      removeEmptyFromObj(data)
    );
  }

  private editUser(data: IUserItem) {
    return this.apiService.put(
      `${API_URL.SETTINGS_EMPLOYEES}/${data.id}`,
      data
    );
  }
}
