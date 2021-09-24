import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, Content} from 'ionic-angular';
import { WoocommerceProvider } from '../../providers/woocommerce/woocommerce';
import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';


@IonicPage({})
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})


export class SearchPage {

  searchQuery: string = "";
  WooCommerce :any;
  products: any[] = [];
  page: number = 2;
  isToggled: boolean = false;
  showEmptyCartMessage: boolean = false;
  showProductNotfound: boolean = false;
  total: any;
  cartItems: any[] = [];
  qty: number = 1;
  qtyCounter : number = 0; 
  ids_fav : any = [] ;
  isShown: boolean = false;

  @ViewChild(Content) content: Content;
  public pageScroller(){
    this.content.scrollToTop();
    this.isShown = false;
  }

  constructor(public navCtrl: NavController, public navParams: NavParams,
     public toastCtrl: ToastController, private WP: WoocommerceProvider,
     private loadingCtrl: LoadingController,public storage: Storage,
     ) {
      
    this.searchQuery = this.navParams.get("searchQuery");

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

    let loading = this.loadingCtrl.create({
    });
    loading.present();

     this.WooCommerce.getAsync("products?search=" + this.searchQuery).then((searchData) => {
      let rest = JSON.parse(searchData.body);
      if(rest.length != 0){
        this.products = JSON.parse(searchData.body);
        this.products.forEach(element=>{
          let x = this.ids_fav.indexOf(element.id) ; 
          if(x!=-1) element.is_favorite=true ; 
          else  element.is_favorite=false ; 
        });
        this.showProductNotfound = false; 
        loading.dismiss();
      }else{
        this.showProductNotfound = true;
        loading.dismiss();
      }
    });

  }

  scrollFunction = (event: any) => {
    let dimensions = this.content.getContentDimensions(); 
    let bottomPosition = dimensions.contentHeight + dimensions.scrollTop;
    let screenSize = dimensions.scrollHeight;
    this.isShown = screenSize - bottomPosition <= 10 ? true : false;
  }

  ngOnInit(){
    
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

  onSearch(event){

    if (this.searchQuery.length > 0) { 

          let loading = this.loadingCtrl.create({
          });
          loading.present();

          this.WooCommerce.getAsync("products?search=" + this.searchQuery).then((searchData) => {
            let rest = JSON.parse(searchData.body);
            if(rest.length != 0){
              this.products = JSON.parse(searchData.body);
              this.products.forEach(element=>{
                let x = this.ids_fav.indexOf(element.id) ; 
                if(x!=-1) element.is_favorite=true ; 
                else  element.is_favorite=false ; 
              });
              this.showProductNotfound = false; 
              loading.dismiss();
            }else{
              this.showProductNotfound = true;
              loading.dismiss();
            }
          });

    }
}

  loadMoreProducts(event){
    this.WooCommerce.getAsync("products?search=" + this.searchQuery + "&page=" + this.page).then((searchData) => {
      this.products = this.products.concat(JSON.parse(searchData.body));
      this.products.forEach(element=>{
        let x = this.ids_fav.indexOf(element.id) ; 
        if(x!=-1) element.is_favorite=true ; 
        else  element.is_favorite=false ; 
      })

      if(JSON.parse(searchData.body).length < 10){
        event.enable(false);
      }
      event.complete();
      this.page ++;
    });
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

  notifyList() {
    this.isToggled = false;
  }
   
  notifyGrid() {
    this.isToggled = true;
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

  addFav(product){
    this.storage.get('favorite').then((data) => {
       let favorite = data || [];
       let itemExist = false;
       product.is_favorite=true ; 
       for(let i = 0; i < favorite.length; i++) {
         if(product.id === favorite[i].product.id) {
           itemExist = true;
         }
       }
 
       if(!itemExist) {
         favorite.push({
           product:  product
         });
         this.ids_fav.push(product.id) ; 
       }
       
       this.storage.set("id_fav" , this.ids_fav) ; 
       this.storage.set('favorite', favorite);
       WoocommerceProvider.favorite = favorite; 
       WoocommerceProvider.fav = this.ids_fav; 

       this.products.forEach(element=>{
         let x = this.ids_fav.indexOf(element.id) ; 
         if(x!=-1) element.is_favorite=true ; 
         else  element.is_favorite=false ; 
       })

 
     });
 
   }

 
   removeFav(product , id ) {
    
     this.products[id].is_favorite=false ;
 
     this.storage.get('favorite').then((data) => {
       let favorite = data || [];
       let postion = 0;
       
       
       for(let i = 0; i < favorite.length; i++) {
         if(product.id === favorite[i].product.id) {
           postion = i;
         }
       }
 
       favorite.splice(postion,1); 
       let s = this.ids_fav.indexOf(product.id) ; 
       if(s!=-1) this.ids_fav.splice(s,1) ; 
     
       
       this.storage.set("id_fav" , this.ids_fav) ; 
       this.storage.set('favorite', favorite);
       WoocommerceProvider.favorite = favorite; 
       WoocommerceProvider.fav = this.ids_fav; 
        
       this.products.forEach(element=>{
         let x = WoocommerceProvider.fav.indexOf(element.id) ; 
         if(x!=-1) element.is_favorite=true ; 
         else  element.is_favorite=false ; 
       })

     }); 
    
   }


get product_favorite()
{ 
  return WoocommerceProvider.favorite; 
}

get product_fav()
{ 
  return WoocommerceProvider.fav; 
}
  
  
}
