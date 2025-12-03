import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class UploadSBigFileService {
  public reloadEvent$ = new BehaviorSubject(false);
}