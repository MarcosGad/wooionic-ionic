import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';



@IonicPage({})
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {

    
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  openShippingPolicyPage(){
    this.navCtrl.push('ShippingPolicyPage'); 
  }

  openPrivacyPolicyPage(){
    this.navCtrl.push('PrivacyPolicyPage'); 
  }

  openRefundPolicyPage(){
    this.navCtrl.push('RefundPolicyPage'); 
  }

  openPaymentPolicyPage(){
    this.navCtrl.push('PaymentPolicyPage'); 
  }

  openReturnPolicyPage(){
    this.navCtrl.push('ReturnPolicyPage'); 
  }

  openTermsAndconditionsPage(){
    this.navCtrl.push('TermsAndconditionsPage'); 
  }

 


}
