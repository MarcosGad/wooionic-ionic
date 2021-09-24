import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { WoocommerceProvider } from '../../providers/woocommerce/woocommerce';


@IonicPage({})
@Component({
  selector: 'page-order-details',
  templateUrl: 'order-details.html',
})
export class OrderDetailsPage {
  
  WooCommerce: any;
  orderid: any; 
  myorder: any;
  myproducts:any; 
  discount:any;  

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private WP: WoocommerceProvider) {

    this.WooCommerce = WP.init();
   
    this.myorder = this.navParams.get("orderid");
    
    this.myproducts = this.myorder.line_items;

    let discount = this.myorder.coupon_lines.length;

    if(discount != 0 ){
    this.discount = this.myorder.coupon_lines[0].discount;
    }else{
      this.discount = 0
    }
  }

  goHome(){
    this.navCtrl.push("HomePage");
  }

}
