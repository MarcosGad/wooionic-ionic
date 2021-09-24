import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController,Slides, NavParams, ToastController, ModalController, LoadingController,AlertController, Events, Navbar} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { WoocommerceProvider } from '../../providers/woocommerce/woocommerce';
import { HomePage } from '../home/home';
import { SocialSharing } from '@ionic-native/social-sharing';
import { CallNumber } from '@ionic-native/call-number';

@IonicPage({})
@Component({
  selector: 'page-product-details',
  templateUrl: 'product-details.html',
})
export class ProductDetailsPage {
  @ViewChild(Navbar) navBar: Navbar;
  product: any;
  productsRelated: any; 
  WooCommerce: any;
  reviews: any[] = [];
  reviewsCot:any[] = [];
  selectedOptions: any = {};
  requireOptions: boolean = true;
  productVariations: any[] = [];
  productPrice: number = 0.0;
  selectedVariation: any;
  newRe: any = {};
  userInfo: any;
  q: any[]; 
  cartItems: any[] = [];
  total: any;
  showEmptyCartMessage: boolean = false;
  qty: number = 1;
  qtyCounter : number = 0;
  isFavorite = false;
  ids_fav : any = [] ;
  showReviewsCot: boolean = false;
  


  public static productsCart
  @ViewChild('productSlides') productSlides: Slides; 
  cart: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage, 
              public toastCtrl: ToastController, public modalCtrl: ModalController, 
              private WP: WoocommerceProvider, private loadingCtrl: LoadingController, 
              public alertCtrl: AlertController, public events: Events,
              private socialSharing: SocialSharing,private callNumber: CallNumber) {
           
    this.product = this.navParams.get("product");

    this.qty = this.navParams.get('qty');
   
    this.total = 0.0;
    this.WooCommerce = WP.init();

    this.WooCommerce.getAsync('products/' + this.product.id + '/reviews').then((data) => {
      this.reviewsCot = JSON.parse(data.body); 
      this.reviews = JSON.parse(data.body).length;
      this.showReviewsCot = true; 
    }, (err) => {
    })

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

 
  loadProductsRelated(event){
    this.WooCommerce.getAsync("products?include=" + this.product.related_ids).then((data) => {
      this.productsRelated = JSON.parse(data.body); 
      this.productsRelated.forEach(element => {
        let x = this.ids_fav.indexOf(element.id);
        if (x != -1) element.is_favorite = true;
        else element.is_favorite = false;
      })
      event.complete(); 
      if(this.productsRelated.length = this.productsRelated.length)
        event.enable(false);
    }, (err) => {
    }); 
  }


  changeQty(qty, i, change){

    if(change < 0 && qty == 1){
      return;
    }

    qty = qty + change;
    this.qty = qty;

  }


  addToCart(product) {

    //counting selected attribute options
    let count = 0;
    for (let k in this.selectedOptions) if (this.selectedOptions.hasOwnProperty(k)) count++;

    //counting variation attributes options
    let count_ = 0;
    for (var index = 0; index < this.product.attributes.length; index++) {
      
      if(this.product.attributes[index].variation)
        count_++;
      
    }

    //checking if user selected all the variation options or not

    if(count_ != count || this.requireOptions)
    {
      this.toastCtrl.create({
        message: "حدد خيارات المنتج",
        duration: 2000,
        closeButtonText: 'الغاء',
        showCloseButton: true
      }).present();
      return; 
    }



    this.storage.get("cart").then((data) => {

      if (data == undefined || data.length == 0) {
        data = [];

        data.push({
          "product": product,
          "qty": this.qty,
          "amount": parseFloat(product.price)
        });

        if(this.selectedVariation){
          data[0].variation = this.selectedVariation;
          data[0].amount = parseFloat(this.selectedVariation.price);
        }

      } else {

        let alreadyAdded = false;
        let alreadyAddedIndex = -1;

        for (let i = 0; i < data.length; i++){
          if(data[i].product.id == product.id){ //Product ID matched
            if(this.productVariations.length > 0){ //Now match variation ID also if it exists
              if(data[i].variation.id == this.selectedVariation.id){
                alreadyAdded = true;
                alreadyAddedIndex = i;
                break;
              }
            } else { //product is simple product so variation does not  matter
              alreadyAdded = true;
              alreadyAddedIndex = i;
              break;
            }
          }
        }

        if(alreadyAdded == true){
          if(this.selectedVariation){
            data[alreadyAddedIndex].qty = parseFloat(data[alreadyAddedIndex].qty) + this.qty;
            data[alreadyAddedIndex].amount = parseFloat(data[alreadyAddedIndex].amount) + parseFloat(this.selectedVariation.price);
            data[alreadyAddedIndex].variation = this.selectedVariation;
          } else {
            data[alreadyAddedIndex].qty = parseFloat(data[alreadyAddedIndex].qty) + this.qty;
            data[alreadyAddedIndex].amount = parseFloat(data[alreadyAddedIndex].amount) + parseFloat(data[alreadyAddedIndex].product.price);
          } 
        } else {
          if(this.selectedVariation){
            data.push({
              product: product,
              qty: this.qty,
              amount: parseFloat(this.selectedVariation.price),
              variation: this.selectedVariation
            })
          } else {
            data.push({
              product: product,
              qty: this.qty,
              amount: parseFloat(product.price)
            })
          }
        }

      }

      this.storage.set("cart", data).then(() => {
        let productName = product.name
        this.toastCtrl.create({
          message: 'لقد تم اضافة منتج  ' + productName + ' الى عربة التسوق',
          duration: 3000,
          cssClass: 'toast-css-class',
          position: 'top'
        }).present();

      })

    });
    this.qtyCounter = WoocommerceProvider.nb; 
    this.qtyCounter += +this.qty;
    WoocommerceProvider.nb =  this.qtyCounter;

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
      this.q = data; 
      let productName = product.name
      this.toastCtrl.create({
        message: 'لقد تم اضافة منتج  ' + productName + ' الى عربة التسوق',
        duration: 3000,
        cssClass: 'toast-css-class',
        position: 'top',
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


  async check(justSelectedAttribute) {

    let loading = this.loadingCtrl.create({
    });

    //counting selected attribute options
    let count = 0;
    for (let k in this.selectedOptions) 
      if (this.selectedOptions.hasOwnProperty(k)) 
        count++;

    let count_ = 0;
    for (var index = 0; index < this.product.attributes.length; index++) {
      
      if(this.product.attributes[index].variation)
        count_++;
      
    }

    //checking if user selected all the variation options or not

    if(count_ != count){
      this.requireOptions = true;
      return;
    } else {
      this.requireOptions = false;

      //Get product variations only once when all product variables are selected by the user
      loading.present();
      this.productVariations = JSON.parse((await this.WooCommerce.getAsync('products/' + this.product.id + '/variations/')).body);
    }

    let i = 0, matchFailed = false;

    if (this.productVariations.length > 0) {
      for (i = 0; i < this.productVariations.length; i++) {
        matchFailed = false;
        let key: string = "";

        for (let j = 0; j < this.productVariations[i].attributes.length; j++) {
          key = this.productVariations[i].attributes[j].name;

          if (this.selectedOptions[key].toLowerCase() == this.productVariations[i].attributes[j].option.toLowerCase()) {
            //Do nothing
          } else {
            matchFailed = true;
            break;
          }
        }

        if (matchFailed) {
          continue;
        } else {
          //found the matching variation
          this.productPrice = this.productVariations[i].price;
          this.selectedVariation = this.productVariations[i];
          break;

        }

      }

      if(matchFailed == true){
        this.toastCtrl.create({
          message: "لم يتم العثور على مثل هذا المنتج",
          duration: 3000,
          closeButtonText: 'الغاء',
        }).present().then(()=>{
          this.requireOptions = true;
        })
      }
    } else {
      this.productPrice = this.product.price;

    }

    loading.dismiss();

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


  newRee(product,reviewsCot){

    this.storage.get("userLoginInfo").then( (data) => {
      if(data != null){
        this.navCtrl.push('ReviewsPage', {"product" : product , "reviewsCot" : reviewsCot} ); 
      } else {
        this.navCtrl.push('LoginPage')
      }
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
      WoocommerceProvider.recently = recently; 
    });

  }

  Share(product){
    this.socialSharing.share(product.name,product.images[0].src,product.url).then(() => {
    }).catch(() => {
    });
  }

  async call():Promise<any>{
    await this.callNumber.callNumber("+201275527489", true)
  }


  getStars() {
    // Get the value
    var val = parseFloat(this.product.average_rating);
    // Turn value into number/100
    var size = val/5*100;
    return size + '%';
  }

  addFavproduct(product) {

    this.product.is_favorite = true ; 
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
    });

  }
  
  removeFavproduct(product) {
    
    this.product.is_favorite = false;

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
      
      this.product.is_favorite = false;
      this.storage.set("id_fav", this.ids_fav);
      this.storage.set('favorite', favorite);
      WoocommerceProvider.favorite = favorite;
      WoocommerceProvider.fav = this.ids_fav;
    });

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

    this.productsRelated.forEach(element => {
      let x = WoocommerceProvider.fav.indexOf(element.id);
      if (x != -1) element.is_favorite = true;
      else element.is_favorite = false;
    })

    this.storage.set("recently",  WoocommerceProvider.recently ) ; 
    this.storage.set("id_fav", this.ids_fav);
    this.storage.set('favorite', favorite);

        
    WoocommerceProvider.favorite = favorite;
    WoocommerceProvider.fav = this.ids_fav;
  
  });

}

get product_favorite() {
  return WoocommerceProvider.favorite;
}

get product_fav() {
  return WoocommerceProvider.fav;
}

}
