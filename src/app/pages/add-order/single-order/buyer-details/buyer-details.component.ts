import { Component, ViewEncapsulation, inject } from '@angular/core';
import { SingleOrderService } from '../single-order.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-buyer-details',
  templateUrl: './buyer-details.component.html',
  styleUrls: ['./buyer-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BuyerDetailsComponent {
  soService = inject(SingleOrderService);

  constructor(private fb: FormBuilder) {}

  onClickNext() {
    this.soService.onTabChange('next');
  }
}
