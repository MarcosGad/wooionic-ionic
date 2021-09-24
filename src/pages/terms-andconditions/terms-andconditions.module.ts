import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TermsAndconditionsPage } from './terms-andconditions';

@NgModule({
  declarations: [
    TermsAndconditionsPage,
  ],
  imports: [
    IonicPageModule.forChild(TermsAndconditionsPage),
  ],
  exports: [
    TermsAndconditionsPage
  ]
})
export class TermsAndconditionsPageModule {}