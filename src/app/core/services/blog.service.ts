import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { delay, Observable, of } from "rxjs";
import { IBlogData, IGeneralArticle } from "../models/blog.model";
import { API_URL, UrlGenerator } from "./api-urls";

export enum FormType {
  CONTACT = 'contact',
  LABEL = 'label',
  CAREER = 'career'
}
@Injectable({
  providedIn: 'root',
})
export class BlogService {
  constructor(
    private apiService: ApiService,
  ) {
    // this.getInquiriesFields().subscribe((data) => {
    //   console.log(data)
    // })
  }

  getAllArticles(params: { [key: string]: string }): Observable<IBlogData> {
    return this.apiService.get(API_URL.BLOG, params);
  }

  getArticle(slug: string): Observable<IGeneralArticle> {
    return this.apiService.get(
      UrlGenerator.generate(API_URL.BLOG_POSTS, { slug })
    );
  }

  // getInquiriesFields() {
  //   return this.apiService.get(API_URL.INQUIRIES_FIELDS);
  // }

  saveInquiriesFields(inquiryFormType: FormType, formValue: any): Observable<{message: string}> {
    return this.apiService.post(
      UrlGenerator.generate(API_URL.INQUIRIES_FIELDS_BY_TYPE, {inquiryFormType}),
      formValue
    );
  }

  submitJobApplication(formvalue: any): Observable<{ message: string }> {
    return this.apiService.postFormData(API_URL.JOB_APPLICATION, formvalue);
  }
}
