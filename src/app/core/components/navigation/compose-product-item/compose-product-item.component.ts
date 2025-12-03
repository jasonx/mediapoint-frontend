import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs';
import { AutoDestroyService } from 'src/app/core/services/auto-destroy.service';
import { ActivatedRoute } from '@angular/router';
import { CreateOrderService } from 'src/app/core/services/create-order.service';

@Component({
  selector: 'app-compose-a-product-item',
  templateUrl: './compose-product-item.component.html',
  styleUrls: ['./compose-product-item.component.less'],
  providers: [AutoDestroyService],
})
export class ComposeProductItemComponent implements OnInit {
  jobs: number[] = [];

  constructor(
    private orderService: CreateOrderService,
    private destroy$: AutoDestroyService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.orderService.jobs.pipe(takeUntil(this.destroy$)).subscribe((jobs) => {
      this.jobs = jobs;
    });
  }

  isJobActive(jobId: number): boolean {
    const currentId = this.activatedRoute.snapshot.paramMap.get('jobId');

    if (!currentId) {
      return false;
    }

    return jobId === +currentId;
  }
}
