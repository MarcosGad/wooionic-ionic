import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShippingPolicyPage } from './shipping-policy';

@NgModule({
  declarations: [
    ShippingPolicyPage,
  ],
  imports: [
    IonicPageModule.forChild(ShippingPolicyPage),
  ],
  exports: [
    ShippingPolicyPage
  ]
})
export class ShippingPolicyPageModule {}