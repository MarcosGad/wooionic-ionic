import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, Content} from 'ionic-angular';
import { WoocommerceProvider } from '../../providers/woocommerce/woocommerce';
import { HomePage } from '../home/home';
import { Storage } from '@ionic/storage';
import { trigger, style, animate, transition } from '@angular/animations';

@IonicPage({})
@Component({
  selector: 'page-products-by-category',
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('300ms', style({transform: 'translateY(0)', opacity: 1}))
        ]),
        transition(':leave', [
          style({transform: 'translateY(0)', opacity: 1}),
          animate('300ms', style({transform: 'translateY(-100%)', opacity: 0}))
        ])
      ]
    )
  ],
  templateUrl: 'products-by-category.html',
})

export class ProductsByCategoryPage {

  min : number = 0 ;
  max : number = 0 ; 
  
  distance:{ upper:number,lower:number}={
    upper: 0,
    lower:0
  }

  WooCommerce: any; 
  cartItems: any[] = [];
  total: any;
  showEmptyCartMessage: boolean = false;
  qty: number = 1;
  qtyCounter : number = 0; 
  products: any[]; 
  productswith: any[]; 
  page: number;
  load: boolean = false; 
  category: any; 
  sort:string = '0'; 
  isToggled: boolean = false;
  catName: any; 
  ids_fav : any = [] ;
  elementPrice: any = []; 
  Valuelower: number = 0; 
  Valueupper: number = 0; 
  showRange: boolean = false;
  showProductNotfound: boolean = false;
  show:boolean = false;
  isShown: boolean = false;

  @ViewChild(Content) content: Content;
  public pageScroller(){
    this.content.scrollToTop();
    this.isShown = false;
  }


  constructor(public navCtrl: NavController,
     public navParams: NavParams, private WP: WoocommerceProvider,
     private loadingCtrl: LoadingController,public storage: Storage,
     public toastCtrl: ToastController) {

    this.page = 1; 
    this.category = this.navParams.get("category"); 
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
    

    this.WooCommerce.getAsync("products/categories/" + this.category).then((data) => {
      let catName = JSON.parse(data.body);
      this.catName = catName.name
    }, (err) => {
    });

    this.isToggled = false;
    this.getPro(0,0); 

    this.WooCommerce.getAsync("products/?category=" + this.category + '&per_page=96').then((data) => {
      this.productswith = JSON.parse(data.body);
      let min = this.productswith[0] ? this.productswith[0].price : 0 ; 
      let max = this.productswith[0] ? this.productswith[0].price : 0 ;
      this.productswith.forEach(element => {
      this.elementPrice = element.price ; 
      element.price = Number(element.price) ; 
      this.min = min =  min>element.price ? element.price : min ; 
      this.max = max = max<element.price ? element.price : max ; 
      this.distance.upper = max; 
      this.distance.lower =  min;
    });
    
    this.showRange = true; 
    }, (err) => {
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

  

  loadMoreProducts(event,mi , ma){
    this.page++; 
    mi = this.Valuelower; 
    ma = this.Valueupper; 
    let url:string = "products/?category=" + this.category + "&page=" + this.page; 
    if( ma > 0 )
      {
        url =   "products/?category=" + this.category + "&page=" + this.page + "&min_price=" +mi +"&max_price="+ma ; 
      }
    url += this.sort=='1' ? '&order=asc' :this.sort=='2' ? '&order=desc' : ''; 
    this.WooCommerce.getAsync(url).then((data) => {
      let temp = (JSON.parse(data.body)); 
      this.products = this.products.concat(JSON.parse(data.body));
      this.products.forEach(element=>{
        let x = this.ids_fav.indexOf(element.id) ; 
        if(x!=-1) element.is_favorite=true ; 
        else  element.is_favorite=false ; 
      })
      event.complete();

        if(temp.length < 10)
        event.enable(false); 
        if(this.products.length === 96){
          this.load = false; 
        }else{
          this.load = true;
        }

    })  
  }

  getPro(mi , ma){

    let loading = this.loadingCtrl.create({
    });
    loading.present();

    let url:string = "products/?category=" + this.category; 
    mi = this.Valuelower; 
    ma = this.Valueupper;  

    if( ma > 0 )
    {
      url =   "products/?category=" + this.category + "&min_price=" +mi +"&max_price="+ma ; 
    }
    url += this.sort=='1' ? '&order=asc' :this.sort=='2' ? '&order=desc' : ''; 
    this.WooCommerce.getAsync(url).then((data) => {

      let rest = JSON.parse(data.body);
        if(rest.length != 0){

                  this.products = JSON.parse(data.body);
                  this.products.forEach(element=>{
                    let x = this.ids_fav.indexOf(element.id) ; 
                    if(x!=-1) element.is_favorite=true ; 
                    else  element.is_favorite=false ; 
                  })

                  this.showProductNotfound = false; 
                  loading.dismiss();
                  if(this.products.length === 10){
                    this.load = true; 
                  }else{
                    this.load = false;
                  }

            }else{

                this.showProductNotfound = true;
                loading.dismiss();
          }
          }, (err) => {
          });   
 }


  changeSort(){
    this.products = []; 
    this.page = 1; 
    this.getPro(0,0); 
    this.load = false; 
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

  openHomePage(){
    this.navCtrl.push('HomePage'); 
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
  
  get nbstatic()
  {
    return WoocommerceProvider.nb ; 
  }
  
  openCart(){
    this.navCtrl.push("CartPage", {qty: WoocommerceProvider.nb}); 
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

changeDistance(range) {
  this.Valuelower =  range.value.lower; 
  this.Valueupper =  range.value.upper; 
  this.products = []; 
  this.page = 1; 
  this.getPro(range.value.lower , range.value.upper) ; 
  this.load = false; 
}

}
