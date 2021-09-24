import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { WoocommerceProvider } from '../../providers/woocommerce/woocommerce';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';


@IonicPage({})
@Component({
  selector: 'page-checkout',
  templateUrl: 'checkout.html',
})
export class CheckoutPage {

  WooCommerce: any;
  newOrder: any;
  shipping: any; 
  paymentMethods: any[];
  paymentMethod: any;
  shippingMethods: any[];
  shippingMethod: any;
  billing_shipping_same: boolean;
  userInfo: any;

  private todo : FormGroup; 
  private todoTwo : FormGroup; 
  id : number; 
  cartItems: any[] = [];
  codeDs : any;
  orderid: any; 

  constructor(public navCtrl: NavController, public navParams: NavParams,
     public storage: Storage, public alertCtrl: AlertController,
     private WP: WoocommerceProvider, private formBuilder: FormBuilder,
     private loadingCtrl: LoadingController) {

    this.newOrder = {};
    this.newOrder.billing = {};
    this.newOrder.shipping = {};
    this.billing_shipping_same = true;

    this.todo = this.formBuilder.group({
      reqone: ['', Validators.required],
      reqtwo: ['', Validators.required],
      reqthree: ['', Validators.required],
      reqfour: ['', Validators.required],
      reqfive: ['', Validators.required],
      reqsix: ['', Validators.required],
      reqeight: ['', ],
      reqnine: ['', Validators.required],
    });

    this.todoTwo = this.formBuilder.group({
      reqten: ['', Validators.required],
      reqeleven: ['', Validators.required],
      reqtwelve: ['', Validators.required],
      reqthirteen: ['', Validators.required],
      reqfourteen: ['', Validators.required],
      reqsixteen: ['', ],
    });

      this.paymentMethods = [
        { method_id: "bacs", method_title: "Direct Bank Transfer" },
        { method_id: "cheque", method_title: "Cheque Payment" },
        { method_id: "cod", method_title: "Cash on Delivery" },
        { method_id: "paypal", method_title: "PayPal" }];
     
   
      this.WooCommerce = WP.init();

      let loading = this.loadingCtrl.create({
      });
      loading.present();

      this.storage.get("userLoginInfo").then((userLoginInfo) => {

      let email = userLoginInfo.user.email;

      this.WooCommerce.getAsync('customers?email='+ email).then((data) => {
        let newOrder = JSON.parse(data.body);
        this.id = newOrder[0].id;
        this.newOrder = newOrder[0];
        loading.dismiss();

      })

    })
  }


  setBillingToShipping() {
    this.billing_shipping_same = !this.billing_shipping_same;
    if (this.billing_shipping_same) {
      this.newOrder.shipping = this.newOrder.billing;
    }

  }

  placeOrder() {

    let loading = this.loadingCtrl.create({
    });
    loading.present();

    let customerData = {
      customer : {}
    }

    customerData.customer = {
      "email": this.newOrder.email,
      "first_name": this.newOrder.first_name,
      "last_name": this.newOrder.last_name,
      "billing": {
        "first_name": this.newOrder.first_name,
        "last_name": this.newOrder.last_name,
        "company": "",
        "address_1": this.newOrder.billing.address_1,
        "address_2": "",
        "city": this.newOrder.billing.city,
        "state": this.newOrder.billing.state,
        "postcode": this.newOrder.billing.postcode,
        "country": this.newOrder.billing.country,
        "email": this.newOrder.email,
        "phone": this.newOrder.billing.phone
      },
      "shipping": {
        "first_name": this.newOrder.first_name,
        "last_name": this.newOrder.last_name,
        "company": "",
        "address_1": this.newOrder.shipping.address_1,
        "address_2": "",
        "city": this.newOrder.shipping.city,
        "state": this.newOrder.shipping.state,
        "postcode": this.newOrder.shipping.postcode,
        "country": this.newOrder.shipping.country
      }
    }

    this.WooCommerce.putAsync('customers/'+this.id, customerData.customer).then( (data) => {
    })


    let orderItems: any[] = [];
    let orderco: any[] = [];
    let data: any = {};
    let paymentData: any = {};
    this.codeDs = this.navParams.get("codeDs");

    this.paymentMethods.forEach((element, index) => {
      if (element.method_id == this.paymentMethod) {
        paymentData = element;
      }
    });
  
    
    data = {
      payment_method: paymentData.method_id,
      payment_method_title: paymentData.method_title,
      set_paid: true,

      billing: this.newOrder.billing,
      shipping: this.newOrder.shipping,
      customer_id: this.id || '',
      line_items: orderItems,
      coupon_lines : orderco,

    };

    if (paymentData.method_id == "paypal") {

    } else {


      this.storage.get("cart").then((cart) => {
        cart.forEach((element, index) => {
          if(element.variation){
            orderItems.push({ product_id: element.product.id, variation_id: element.variation.id , quantity: element.qty });
            } else {
            orderItems.push({ product_id: element.product.id, quantity: element.qty });
          }
        });


        if(this.codeDs != undefined){
          orderco.push({code: this.codeDs[0].code , amount : this.codeDs[0].amount , discount : this.codeDs[0].amount  })
        }


        let orderData: any = {};
        orderData.order = data;


        this.WooCommerce.postAsync("orders", orderData.order).then((data) => {

          let response = (JSON.parse(data.body));
          this.orderid = response; 
          
          this.navCtrl.push('OrderDetailsPage', {"orderid" :this.orderid});
          loading.dismiss();
          
          this.storage.remove("cart");
          this.storage.set("cart", this.cartItems); 
          WoocommerceProvider.nb = 0;
          
        })

      })

    }


  }

  get nbstatic() {
    return WoocommerceProvider.nb;
  }
  
}