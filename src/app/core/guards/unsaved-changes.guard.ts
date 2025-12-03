import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
  showUnsavedModal(): Observable<boolean>;
}

@Injectable({
  providedIn: 'root',
})
export class UnsavedChangesGuard implements CanDeactivate<HasUnsavedChanges> {
  canDeactivate(component: HasUnsavedChanges): Observable<boolean> | boolean {
    return component.hasUnsavedChanges() ? component.showUnsavedModal() : true;
  }
}
