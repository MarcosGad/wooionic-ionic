import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PaymentPolicyPage } from './payment-policy';

@NgModule({
  declarations: [
    PaymentPolicyPage,
  ],
  imports: [
    IonicPageModule.forChild(PaymentPolicyPage),
  ],
  exports: [
    PaymentPolicyPage
  ]
})
export class PaymentPolicyPageModule {}