import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReturnPolicyPage } from './return-policy';

@NgModule({
  declarations: [
    ReturnPolicyPage,
  ],
  imports: [
    IonicPageModule.forChild(ReturnPolicyPage),
  ],
  exports: [
    ReturnPolicyPage
  ]
})
export class ReturnPolicyPageModule {}