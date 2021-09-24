import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController, LoadingController} from 'ionic-angular';
import { Http } from '@angular/http';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';

@IonicPage({})
@Component({
  selector: 'page-forget',
  templateUrl: 'forget.html',
})
export class ForgetPage {

  passforget: string; 
  private todo : FormGroup; 

  constructor(public navCtrl: NavController, public navParams: NavParams,
     public http: Http, public toastCtrl:ToastController, 
     public alertCtrl: AlertController, private loadingCtrl: LoadingController,
     private formBuilder: FormBuilder) {
    this.passforget= ""; 

    this.todo = this.formBuilder.group({
      req: ['', Validators.compose([Validators.maxLength(70), Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$'), Validators.required])],
    });

  }

  

  forget(){

    let loading = this.loadingCtrl.create({
    });
    loading.present();

    this.http.post("http://www.atswaq.com/api/user/retrieve_password/?insecure=cool&user_login="+ this.passforget,[])
    .subscribe( data => {

      this.toastCtrl.create({
        message: "تم ارسال الرابط الى بريدك الألكترونى",
        duration: 5000,
      }).present(); 
      this.passforget = ""; 
      loading.dismiss();
      

    },error =>{

        this.toastCtrl.create({
          message: "البريد الالكترونى عير موجود",
          duration: 5000,
        }).present(); 
        loading.dismiss();

    })
    

  }
  

}

