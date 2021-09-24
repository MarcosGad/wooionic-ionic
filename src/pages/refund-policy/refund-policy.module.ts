import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RefundPolicyPage } from './refund-policy';

@NgModule({
  declarations: [
    RefundPolicyPage,
  ],
  imports: [
    IonicPageModule.forChild(RefundPolicyPage),
  ],
  exports: [
    RefundPolicyPage
  ]
})
export class RefundPolicyPageModule {}