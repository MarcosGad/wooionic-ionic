import { Component, ViewChild, OnInit } from '@angular/core';
import { IonicPage, NavController, Slides, ToastController, ActionSheetController, LoadingController } from 'ionic-angular';
import { WoocommerceProvider } from '../../providers/woocommerce/woocommerce';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';

@IonicPage({})
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  WooCommerce: any;
  products: any[];
  moreProducts: any[];
  page: number;
  searchQuery: string = "";
  items: any;
  itemsTwo: any;
  data: any;
  recentlyViewed: any[] = [];
  cartItems: any[] = [];
  total: any;
  showEmptyCartMessage: boolean = false;
  qty: number = 1;
  qtyCounter: number = 0;
  isOnline: boolean = false;
  ids_fav: any = [];

  public static categories
  @ViewChild('navCtrl') childNavCtrl: NavController;

  public static productsCart
  @ViewChild('productSlides') productSlides: Slides;

  constructor(public navCtrl: NavController, public toastCtrl: ToastController,
    private WP: WoocommerceProvider, private http: Http,
    private actionSheetController: ActionSheetController,
    private loadingCtrl: LoadingController,
    private network: Network, public storage: Storage) {

    this.page = 2;
    this.WooCommerce = WP.init();
    this.loadMoreProducts(null);

    this.storage.ready().then(() => {

      this.storage.get("cart").then((data) => {
        this.cartItems = data;

        if (this.cartItems.length > 0) {

          this.cartItems.forEach((item, index) => {

            if (item.variation) {
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
          if (element.qty !== undefined) {
            this.qtyCounter = Number(element.qty) + this.qtyCounter;
            WoocommerceProvider.nb = this.qtyCounter;
            this.qty = 1;
          }

        })

      })

    })
}

ionViewDidEnter(){

  this.network.onConnect().subscribe(data =>{
    this.toastCtrl.create({
      message: 'انت الأن متصل بالأنترنت',
      duration: 3000
    }).present();
    this.isOnline = false; 
  },error => console.error(error));

  this.network.onDisconnect().subscribe(data =>{
    this.toastCtrl.create({
      message: 'حدث خطأ فى الأتصال بالأنترنت برجاء المحاولة مرة أخرى ',
      duration: 6000
    }).present();
    this.isOnline = true; 
    },error => console.error(error));
    

}


  get_product_list() {

    this.WooCommerce.getAsync("products?per_page=15").then((data: any) => {
      this.products = JSON.parse(data.body);
      this.products.forEach(element => {
        let x = this.ids_fav.indexOf(element.id);
        if (x != -1) element.is_favorite = true;
        else element.is_favorite = false;
      })


    }, (err: any) => {
            
      this.toastCtrl.create({
        message: 'حدث خطأ فى الأتصال بالأنترنت برجاء المحاولة مرة أخرى ',
        duration: 6000
      }).present();
      
    });

  }

  ionViewDidLoad() {

    setInterval(() => {
      if (this.productSlides.getActiveIndex() == this.productSlides.length() - 1)
        this.productSlides.slideTo(0);

      this.productSlides.slideNext();
    }, 3000)

    let d = new Date();
    this.data = d.getFullYear();

  }

  ionViewWillEnter() {
    this.storage.ready().then(() => {
      this.storage.get("recently").then((data) => {
        this.recentlyViewed = data;
        WoocommerceProvider.recently = data;
        this.get_recently();

      })

    })

    this.storage.ready().then(() => {
      this.storage.get("favorite").then((data) => {
        WoocommerceProvider.favorite = data;
      })

    })

    this.storage.get("id_fav").then((data: any) => {
      this.ids_fav = data || [];
      WoocommerceProvider.fav = this.ids_fav;
      this.get_product_list();
    })

  }

  loadMoreProducts(event) {

    if (event == null) {
      this.page = 2;
      this.moreProducts = [];
    }
    else

      this.page++;

    this.WooCommerce.getAsync("products?page=" + this.page).then((data) => {
      this.moreProducts = this.moreProducts.concat(JSON.parse(data.body));

      if (event != null) {
        event.complete();
      }

      if (JSON.parse(data.body).length < 10) {
        event.enable(false);

        this.toastCtrl.create({
          message: "No More Products!",
          duration: 5000
        }).present();
      }

    }, (err) => {
    })

  }

  openProductPage(product) {
    HomePage.productsCart = product;
    this.navCtrl.push('ProductDetailsPage', { "product": product, "qty": 1 });

    this.storage.get('recently').then((data) => {
      let recently = data || [];
      let itemExist = false;

      for (let i = 0; i < recently.length; i++) {
        if (product.id === recently[i].product.id) {
          itemExist = true;
        }

      }

      if (!itemExist) {
        recently.push({
          product: product
        });
      }

      this.storage.set('recently', recently);

      WoocommerceProvider.recently = recently;
    });

  }

  onSearch(event) {
    if (this.searchQuery.length > 0) { 
      this.navCtrl.push('SearchPage', { "searchQuery": this.searchQuery });
    } 
  }

  openCategory(category) {
    HomePage.categories = category;
    this.navCtrl.push('ProductsByCategoryPage', { "category": category });
  }

  openDiscountPage() {
    this.navCtrl.push('DiscountPage');
  }

  openProductsPage() {
    this.navCtrl.push('ProductsPage');
  }

  removeRecentlyViewed(i) {
    this.recentlyViewed.splice(i, 1);
    this.storage.set("recently", this.recentlyViewed);
    WoocommerceProvider.recently = this.recentlyViewed;
  }

  get recently_viewed() {
    return WoocommerceProvider.recently;
  }

  get_recently() {
    WoocommerceProvider.recently.forEach(element => {
      let x = this.ids_fav.indexOf(element.product.id);
      if (x != -1) element.product.is_favorite = true;
      else element.product.is_favorite = false;
    })
    this.storage.set("recently" ,WoocommerceProvider.recently ) ;
  }

  ngOnInit() {
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


  get nbstatic() {
    return WoocommerceProvider.nb;
  }

  openCart() {
    this.navCtrl.push("CartPage", { qty: WoocommerceProvider.nb });
  }

  addFav(product) {
    this.storage.get('favorite').then((data) => {
      let favorite = data || [];
      let itemExist = false;
      product.is_favorite = true;
      for (let i = 0; i < favorite.length; i++) {
        if (product.id === favorite[i].product.id) {
          itemExist = true;
        }
      }

      if (!itemExist) {
        favorite.push({
          product: product
        });
        this.ids_fav.push(product.id);
      }

      this.storage.set("id_fav", this.ids_fav);
      this.storage.set('favorite', favorite);
      WoocommerceProvider.favorite = favorite;
      WoocommerceProvider.fav = this.ids_fav;

      WoocommerceProvider.recently.forEach(element => {
        let x = WoocommerceProvider.fav.indexOf(element.product.id);
        if (x != -1) element.product.is_favorite = true;
        else element.product.is_favorite = false;
      })
      

    });

  }


  removeFav(product, id) {

    this.products[id].is_favorite = false;

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


      
      WoocommerceProvider.favorite = favorite;
      WoocommerceProvider.fav = this.ids_fav;

      WoocommerceProvider.recently.forEach(element => {
        let x = WoocommerceProvider.fav.indexOf(element.product.id);
        if (x != -1) element.product.is_favorite = true;
        else element.product.is_favorite = false;
      })

      this.storage.set("recently",  WoocommerceProvider.recently ) ; 
      this.storage.set("id_fav", this.ids_fav);
      this.storage.set('favorite', favorite);
    });

  }


  get product_favorite() {
    return WoocommerceProvider.favorite;
  }

  get product_fav() {
    return WoocommerceProvider.fav;
  }



}
