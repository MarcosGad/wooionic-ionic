import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EdituserPage } from './edituser';

@NgModule({
  declarations: [
    EdituserPage,
  ],
  imports: [
    IonicPageModule.forChild(EdituserPage),
  ],
  exports: [
    EdituserPage
  ]
})
export class EdituserPageModule {}
