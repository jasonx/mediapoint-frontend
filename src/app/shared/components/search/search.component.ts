import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.less'],
  providers: [AutoDestroyService],
})
export class SearchComponent implements OnInit {
  @Input() placeholder: string = 'Search';
  @Output() searchEvent: EventEmitter<string> = new EventEmitter();

  searchTextSubject$ = new Subject<string>();
  searchText: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private destroy$: AutoDestroyService
  ) {}

  ngOnInit(): void {
    this.searchText = this.activatedRoute.snapshot.queryParams?.['search'];

    this.searchTextSubject$
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((text) => this.searchEvent.emit(text));
  }

  search(): void {
    this.searchTextSubject$.next(this.searchText.trimStart());
  }

  clear(): void {
    this.searchText = '';
    this.search();
  }
}
