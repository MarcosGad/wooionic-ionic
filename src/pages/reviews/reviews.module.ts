import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReviewsPage } from './reviews';

@NgModule({
  declarations: [
    ReviewsPage,
  ],
  imports: [
    IonicPageModule.forChild(ReviewsPage),
  ],
  exports: [
    ReviewsPage
  ]
})
export class ReviewsPageModule {}
