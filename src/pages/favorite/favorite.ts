import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { WoocommerceProvider } from '../../providers/woocommerce/woocommerce';
import { HomePage } from '../home/home';


@IonicPage({})
@Component({
  selector: 'page-favorite',
  templateUrl: 'favorite.html',
})
export class FavoritePage {
  
  WooCommerce: any;
  cartItems: any[] = [];
  total: any;
  showEmptyCartMessage: boolean = false;
  qty: number = 1;
  qtyCounter : number = 0; 
  ids_fav : any = []; 
 

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public storage: Storage,public toastCtrl: ToastController,
    private WP: WoocommerceProvider) {

    this.WooCommerce = WP.init();

    this.storage.ready().then(()=>{

      this.storage.get("cart").then( (data)=>{
        this.cartItems = data;

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
            WoocommerceProvider.nb = this.qtyCounter;
            this.qty = 1; 
          }

        })

      })

    })

  }

ionViewDidLoad() {

    this.storage.ready().then(()=>{
      this.storage.get("favorite").then((data)=>{
      WoocommerceProvider.favorite = data ; 
      })

    })

    this.storage.get("id_fav").then((data:any)=>{
      this.ids_fav = data || [] ; 
      WoocommerceProvider.fav = this.ids_fav
    })

  
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

 
  removeFav(product, id) {

    this.storage.get('favorite').then((data) => {
      let favorite = data || [];
      let postion = 0;


      for (let i = 0; i < favorite.length; i++) {
        if (product.id === favorite[i].product.id) {
          postion = i;
        }
      }

      favorite.splice(postion, 1);
      let s = this.ids_fav.indexOf(product.id);
      if (s != -1) this.ids_fav.splice(s, 1);
  
      this.storage.set("recently",  WoocommerceProvider.recently ) ; 
      this.storage.set("id_fav", this.ids_fav);
      this.storage.set('favorite', favorite);

      WoocommerceProvider.favorite = favorite;
      WoocommerceProvider.fav = this.ids_fav;

    });

  }

  addToCartTwo(product, qty) {
    this.storage.get('cart').then((data) => {
      let cart = data || [];
      let itemExist = false;

      for(let i = 0; i < cart.length; i++) {
        if(product.id === cart[i].product.id) {
          cart[i].qty += +qty;
          cart[i].amount += +cart[i].product.price;
          itemExist = true;
        }
      }

      if(!itemExist) {
        cart.push({
          product:  product,
          qty:      qty,
          amount:   +product.price
        });
      }

      this.storage.set('cart', cart);
      let productName = product.name
      this.toastCtrl.create({
        message: 'لقد تم اضافة منتج  ' + productName + ' الى عربة التسوق',
        duration: 3000,
        cssClass: 'toast-css-class',
        position: 'top'
      }).present();
    });
    this.qtyCounter = WoocommerceProvider.nb; 
    this.qtyCounter += +qty;
    WoocommerceProvider.nb =  this.qtyCounter;
  }

  
  openHomePage(){
    this.navCtrl.push('HomePage'); 
  }

  openCart(){
    this.navCtrl.push("CartPage", {qty: WoocommerceProvider.nb}); 
  }


  get product_favorite()
  { 
    return WoocommerceProvider.favorite; 
  }

  get product_fav()
  { 
    return WoocommerceProvider.fav; 
  }

  get nbstatic()
  {
    return WoocommerceProvider.nb ; 
  }


}
