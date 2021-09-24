import { Component, ViewChild, OnInit, Renderer } from '@angular/core';
import {IonicPage, NavController, NavParams, ModalController,AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { WoocommerceProvider } from '../../providers/woocommerce/woocommerce';


@IonicPage({})
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage implements OnInit {

  homePage;
  WooCommerce: any;
  @ViewChild('content') childNavCtrl: NavController;   
  loggedIn : boolean;
  user : any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
     public storage: Storage, public modalCtrl: ModalController,
      private WP: WoocommerceProvider,public alertCtrl: AlertController,
      public readonly: Renderer) {
        
    this.homePage = 'HomePage'
    this.user = {};
    
    this.WooCommerce = WP.init();
  }

  ionViewDidEnter() {
    
    this.storage.ready().then( () => {
      this.storage.get("userLoginInfo").then( (userLoginInfo) => {
        if(userLoginInfo != null){
          this.user = userLoginInfo.user;
          this.loggedIn = true;
        }
        else{
          this.user = {};
          this.loggedIn = false;
        }
      })
    })
    
  }

  openCategory(category) {
    this.childNavCtrl.setRoot('ProductsByCategoryPage', { "category": category }); 
  }

  openPage(pageName: string){

    if(pageName == "signup"){
      this.navCtrl.push('SignupPage'); 
    }

    if(pageName == "login"){
      this.navCtrl.push('LoginPage'); 
    }

    if(pageName == 'logout'){
      this.alertCtrl.create({
        title: "أتسوق",
        message: "هل ترغب بالخروج؟",
        buttons: [
          {
            text: 'الغاء',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
            }
          }, {
            text: 'نعم',
            handler: () => {
                this.storage.remove("userLoginInfo").then( () => {
                this.user = {};
                this.loggedIn = false;
              })
            }
          }
        ]
      }).present();
      
     
    }
    if(pageName == 'cart'){
      this.navCtrl.push("CartPage"); 
    }
  }

  edituser(){
    this.storage.get("userLoginInfo").then( (data) => {
      if(data != null){
        this.navCtrl.push('EdituserPage'); 
      } else {
        this.navCtrl.push('LoginPage', {next: 'ReviewsPage'})
      }
    })
  }

  openContactPage(){
    this.navCtrl.push('ContactPage'); 
  }

  openAboutPage(){
    this.navCtrl.push('AboutPage'); 
  }

  openFavoritePage(){
    this.childNavCtrl.setRoot('FavoritePage'); 
  }

  
  ngOnInit(){  }
   
}
