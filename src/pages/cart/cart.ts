import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, IonicPage, ViewController, ToastController,ModalController,Events, Platform, Navbar,LoadingController,AlertController} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { WoocommerceProvider } from '../../providers/woocommerce/woocommerce';
import { HomePage } from '../home/home';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';

@IonicPage({})
@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html',
})
export class CartPage {
  @ViewChild(Navbar) navBar: Navbar;
  cartItems: any[] = [];
  total: any;
  WooCommerce: any;
  showEmptyCartMessage: boolean = false;
  showtotalwithcoupon: boolean = false;
  product: any;
  qty: number = 0;
  newCo: any = {};
  coupon:any;
  codeDs:any;
  discount:number = 0; 
  private todo : FormGroup;
  qtyCounter : number = 0;
 


  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage, 
              public viewCtrl: ViewController, public toastController: ToastController, 
              private WP: WoocommerceProvider, public events: Events, public platform: Platform,
              private formBuilder: FormBuilder,private loadingCtrl: LoadingController,
              public alertCtrl: AlertController, public modalCtrl: ModalController ) {

  this.todo = this.formBuilder.group({
      title: ['', Validators.required],
  });

    
    this.product = this.navParams.get("product");
    
    this.total = 0.0;

    this.WooCommerce = WP.init();

    this.storage.ready().then(()=>{

      this.storage.get("cart").then( (data)=>{
        this.cartItems = data;

        if(this.cartItems == null){
          this.showEmptyCartMessage = true; 
        }

        if(this.cartItems.length > 0){
          this.cartItems.forEach( (item, index)=> {
            if(item.variation){
              this.total = this.total + (parseFloat(item.variation.price) * item.qty);
            } else {
              this.total = this.total + (item.product.price * item.qty)
            }

          })

        } else {

          this.showEmptyCartMessage = true;
          this.qty = 1;

        }

        
        this.cartItems.forEach(element => { 
          if(element.qty !== undefined)
          { 
            this.qtyCounter = Number(element.qty) + this.qtyCounter;             
            this.qty = 1; 
          }

        })
        WoocommerceProvider.nb = this.qtyCounter; 
      })

    })

  }

  
  ionViewWillEnter() {

    this.storage.ready().then(() => {

      let loading = this.loadingCtrl.create({
      });
      loading.present();
      this.storage.get("cart").then( (data)=>{
        this.cartItems = data;
      })
      
      loading.dismiss();
    })
    
  }

  removeFromCart(item, i){

    let price;
    
    if(item.variation){
      price = item.variation.price
    } else {
      price = item.product.price;
    }
    let qty = item.qty;
    this.qty = item.qty;

    this.cartItems.splice(i, 1);
    this.storage.set("cart", this.cartItems).then( ()=> {

      this.total = this.total - (price * qty);


    });
    WoocommerceProvider.nb =0 ; 
    this.cartItems.forEach(element => { 
      if(element.qty !== undefined)
      { 
        WoocommerceProvider.nb += Number(element.qty) ;
      }

    })
   
    if(this.cartItems.length == 0){
      this.showEmptyCartMessage = true;
    }
    
  }


  get nbstatic()
  {
    return WoocommerceProvider.nb ; 
  }


  changeQty(item, i, change){

    let price;
    
    if(!item.variation)
      price = item.product.price;
    else
      price = parseFloat(item.variation.price);
    
    let  qty = item.qty;

    if(change < 0 && item.qty == 1){
      return;
    }

    qty = qty + change;
    WoocommerceProvider.nb += change ;  
    this.qty = qty;
    item.qty = qty;
    item.amount = qty * price;

    this.cartItems[i] = item;

    this.storage.set("cart", this.cartItems).then( ()=> {

      this.toastController.create({
        message: "تم تحديث السلة",
        closeButtonText: 'الغاء',
        duration: 2000,
        showCloseButton: true
      }).present();

    });
    this.total = (parseFloat(this.total.toString()) + (parseFloat(price.toString())  * change));
  }


  newCoo(){

    let reg = new RegExp('^[A-Za-z0-9?]+$');
    let COdata = {
      coupon : {}
    }
    COdata.coupon = {
      "code": this.newCo.code
    }

       
    if(reg.test(this.newCo.code))
    { 
      let loading = this.loadingCtrl.create({
      });
      loading.present();

          this.WooCommerce.getAsync('coupons/?code=' + this.newCo.code).then((data) => { 
            this.codeDs = (JSON.parse(data.body));
            if(this.codeDs.length != 0){
              this.discount = this.codeDs[0].amount;
            }
            if(this.codeDs.length != 0 ){
            let response = this.codeDs[0].amount;
            this.alertCtrl.create({
              title: "تم العرض",
              message: "لقد تم عرضك بنجاح. العرض الخاص بك هو " + response,
              buttons: [{
                text: "نعم",
              }]
            }).present();
            loading.dismiss();
            this.showtotalwithcoupon = true;
          }else{
            this.alertCtrl.create({
              message: "آسف ، القسيمة غير موجودة",
              buttons: [{
                text: "نعم",
              }]
            }).present();
            loading.dismiss();
            this.showtotalwithcoupon = false;
          }
         })
        }
    }

    openProductPage(product){
      HomePage.productsCart = product;
      this.navCtrl.push('ProductDetailsPage', {"product" : product , "qty": 1}); 
  
      this.storage.get('recently').then((data) => {
        let recently = data || [];
        let itemExist = false;
  
        for(let i = 0; i < recently.length; i++) {
          if(product.id === recently[i].product.id) {
            itemExist = true;
          }
        }
  
        if(!itemExist) {
          recently.push({
            product:  product
          });
        }
  
        this.storage.set('recently', recently);
        WoocommerceProvider.recently = recently ; 
      });
  
    }

    

    checkout(codeDs){
      this.storage.get("userLoginInfo").then( (data) => {
        if(data != null){
          this.navCtrl.push('CheckoutPage', {"codeDs" :codeDs});
        } else {
          this.navCtrl.push('LoginPage')
        }
      })
  
    }

    backtoshoping(){
      if(this.navParams.get("next")){
        this.navParams.get("next");
      }else{
        this.navCtrl.pop(); 
      } 
    }

}
