import { NgModule } from '@angular/core';
import { AddOrderComponent } from './add-order.component';
import { CommonModule } from '@angular/common';
import { SingleOrderComponent } from './single-order/single-order.component';
import { BulkOrderComponent } from './bulk-order/bulk-order.component';
import { AddOrdersRoutingModule } from './add-order.routing.module';

@NgModule({
  declarations: [AddOrderComponent, SingleOrderComponent, BulkOrderComponent],
  imports: [CommonModule, AddOrdersRoutingModule],
})
export class AddOrderModule {}
