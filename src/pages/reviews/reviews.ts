import { Component, Input } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController,LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { WoocommerceProvider } from '../../providers/woocommerce/woocommerce';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Events } from 'ionic-angular'

const CSS_STYLE = `
    .ionic3-star-rating{
      margin-left: 16px;
    }
    .ionic3-star-rating .button {
        height: 28px;
        background: none;
        box-shadow: none;
        -webkit-box-shadow: none;
        width: 28px;
    }
    .ionic3-star-rating .button ion-icon {
        font-size: 30px;
        color: #efce4a !important; 
    }
`

@IonicPage({})
@Component({
  selector: 'page-reviews',
  templateUrl: 'reviews.html',
  styles: [CSS_STYLE]
})
export class ReviewsPage {

  @Input()
  rating: number = 0;
  @Input()
  readonly: string = "false";
  @Input()
  activeColor : string = '#488aff';
  @Input()
  defaultColor : string = '#f4f4f4';
  @Input()
  activeIcon : string = 'ios-star';
  @Input()
  defaultIcon : string = 'ios-star-outline';
  Math: any;
  parseFloat : any;

  product: any;
  WooCommerce: any;
  newRe: any = {};
  userInfo: any;
  private todo : FormGroup;
  reviews: any[] = [];
  reviewser: any;
  avatar_url: any; 


  constructor(private events : Events, public navCtrl: NavController,
    public alertCtrl: AlertController, public navParams: NavParams,
    public storage: Storage, private WP: WoocommerceProvider,private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController) {
    
      this.todo = this.formBuilder.group({
        reviewtxt: ['', Validators.compose([
          Validators.pattern('^[A-Za-zء-ي0-9?]+[A-Za-zء-ي0-9? ]+'),
          Validators.required
        ])],
      });

    this.Math = Math;
    this.parseFloat = parseFloat;

    this.product = this.navParams.get("product");
    this.reviews = this.navParams.get("reviewsCot");
    this.reviewser = this.reviews.length; 

    this.WooCommerce = WP.init();

    this.storage.get("userLoginInfo").then((userLoginInfo) => {

      let email = userLoginInfo.user.email;

      this.WooCommerce.getAsync('customers?email='+ email).then((data) => {

        let newRe = JSON.parse(data.body)
        this.newRe = newRe[0]
        this.avatar_url = (this.newRe.avatar_url); 

      });

    })

  }

  newRee(){
    let ReData = {
      review : {}
    }

    ReData.review = {
      "name": this.newRe.username,
      "email": this.newRe.email,
      "review": this.newRe.review,
      "rating" : this.rating,
      }
   
    if(this.rating !== 0){

      let loading = this.loadingCtrl.create({
      });
      loading.present();

    this.WooCommerce.postAsync('products/' + this.product.id + '/reviews', ReData.review).then( (data) => {
      let response = (JSON.parse(data.body));
      if(response.id){
        this.alertCtrl.create({
          title: "تقييمك",
          message: "لقد تم ارسال تعليقك",
          buttons: [{
            text: "نعم",
            handler: ()=> {
              this.navCtrl.push("HomePage");
            }
          }]
        }).present();
        loading.dismiss();
        this.newRe.review = "";
        this.rating = 0; 
      } 
      else{
        this.alertCtrl.create({
          title: "Error",
          message: "Error",
        }).present();
        loading.dismiss();
      }
    })

  }else{
    this.alertCtrl.create({
      title: "تقييمك",
      message: "من فضلك أختار عدد النجوم",
      buttons: [{
        text: "نعم",
      }]
    }).present();
  }

  }

  changeRating(event){

    if(this.readonly && this.readonly === "true") return;
    // event is different for firefox and chrome
    this.rating = event.target.id ? parseInt(event.target.id) + 1 : parseInt(event.target.parentElement.id) + 1;
    // subscribe this event to get the changed value in ypour parent compoanent 
    this.events.publish('star-rating:changed', this.rating);
  }

  

}
