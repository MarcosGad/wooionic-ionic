import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import {Http} from '@angular/http';

@IonicPage({})
@Component({
  selector: 'page-refund-policy',
  templateUrl: 'refund-policy.html',
})
export class RefundPolicyPage {

  url: string = 'http://www.atswaq.com/wp-json/wp/v2/pages/?slug=سياسة-الاسترداد';
  page: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private http: Http, private loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {

    let loading = this.loadingCtrl.create({
    });
    loading.present();

    this.http.get( this.url )
    .map(res => res.json())
    .subscribe(data => {
      let page = data;
      this.page = page[0].content.rendered
      loading.dismiss();
    });

  }


}
