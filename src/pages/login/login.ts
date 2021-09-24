import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController,LoadingController } from 'ionic-angular';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage'; 
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import { WoocommerceProvider } from '../../providers/woocommerce/woocommerce';

@IonicPage({})
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  username: string; 
  password: string;
  private todo : FormGroup; 
  user = null; 
  newUser: any = {};
  WooCommerce :any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
     public http: Http, public toastCtrl:ToastController, 
     public storage: Storage, public alertCtrl: AlertController,
     private formBuilder: FormBuilder,private loadingCtrl: LoadingController,
     private WP: WoocommerceProvider) {

      this.todo = this.formBuilder.group({
        username: ['', Validators.compose([
          Validators.pattern('^[A-Za-z-0-?.@]+[A-Za-z-0-9?.@ ]+'),
          Validators.required
        ])],
        password: ['', Validators.required],
      });

    this.username = ""; 
    this.password = ""; 
    this.WooCommerce = WP.init();

  }

  login(){

    let loading = this.loadingCtrl.create({
    });
    loading.present();

    this.http.get("http://www.atswaq.com/api/auth/generate_auth_cookie/?insecure=cool&username="+ this.username +"&password="+ this.password)
    .subscribe( (res) => {
      
      let response = res.json(); 
      if(response.error){
        this.toastCtrl.create({
          message: "اسم المستخدم أو كلمة المرور غير صالحة.",
          duration: 5000,
        }).present(); 
         loading.dismiss();
         return; 
      }

        this.storage.set("userLoginInfo", response).then((data)=>{
          if(this.navParams.get("next")){
            this.navCtrl.push(this.navParams.get("next"));
          }else{
            this.navCtrl.pop(); 
          }
          loading.dismiss();
        })

    }); 
  }

  goforget(){
     this.navCtrl.push('ForgetPage'); 
  }

  gosin(){
    this.navCtrl.push('SignupPage'); 
  }

}
