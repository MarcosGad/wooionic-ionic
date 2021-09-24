import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { WoocommerceProvider } from '../../providers/woocommerce/woocommerce';
import { FormControl, FormGroup, Validators,ValidatorFn,AbstractControl } from '@angular/forms';


@IonicPage({})
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  
  newUser: any = {};
  billing_shipping_same: boolean; 
  WooCommerce :any; 
  user: FormGroup;

  

  constructor(public navCtrl: NavController, public navParams: NavParams,
     public toastCtrl: ToastController,public alertCtrl: AlertController,
      private WP: WoocommerceProvider,private loadingCtrl: LoadingController) {
        
      this.newUser.billing = {}; 
      this.newUser.shipping = {};
      this.billing_shipping_same = false; 
      
      this.WooCommerce = WP.init();

  }

  setBillingToShipping(){
    this.billing_shipping_same = !this.billing_shipping_same; 
  }


     
  checkEmail()
  {
      let validEmail = false;
  
      let reg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  
      if(reg.test(this.newUser.email))
      {
          this.WooCommerce.getAsync('customers?email='+this.newUser.email)
          .then((data) => {
  
              let res = (JSON.parse(data.body).length);
  
              if(res == 0)
              {
                  validEmail = true;
  
                  this.toastCtrl.create({
                      message: ". البريد الإلكتروني صالح للأستخدام!",
                      duration: 2000
                  }).present();
              }
              else
              {
                  validEmail = false;
  
                  this.toastCtrl.create({
                      message: "البريد الإلكتروني مسجل بالفعل ، يرجى التحقق.",
                      closeButtonText: 'الغاء',
                      showCloseButton: true
                  }).present();
              }
          })
      }
      else
      {
          validEmail = false;
  
          this.toastCtrl.create({
              message: "بريد إلكتروني خاطئ. يرجى المراجعة.",
              closeButtonText: 'الغاء',
              showCloseButton: true
          }).present();
      }
  }

  signup(){

    let loading = this.loadingCtrl.create({
    });
    loading.present();

    let customerData = {
      customer : {}
    }

    customerData.customer = {
      "email": this.newUser.email,
      "first_name": this.newUser.first_name,
      "last_name": this.newUser.last_name,
      "username": this.newUser.username,
      "password": this.newUser.password,
      "confirm_password": this.newUser.confirm_password,
      "billing": {
        "first_name": this.newUser.first_name,
        "last_name": this.newUser.last_name,
        "company": "",
        "address_1": this.newUser.billing.address_1,
        "address_2": this.newUser.billing.address_2,
        "city": this.newUser.billing.city,
        "state": this.newUser.billing.state,
        "postcode": this.newUser.billing.postcode,
        "country": this.newUser.billing.country,
        "email": this.newUser.email,
        "phone": this.newUser.billing.phone
      },
      "shipping": {
        "first_name": this.newUser.first_name,
        "last_name": this.newUser.last_name,
        "company": "",
        "address_1": this.newUser.shipping.address_1,
        "address_2": this.newUser.shipping.address_2,
        "city": this.newUser.shipping.city,
        "state": this.newUser.shipping.state,
        "postcode": this.newUser.shipping.postcode,
        "country": this.newUser.shipping.country
      }
    }

    if(this.billing_shipping_same){
      this.newUser.shipping = this.newUser.shipping;
    }

    this.WooCommerce.postAsync('customers', customerData.customer).then( (data) => {

      let response = (JSON.parse(data.body).role);
            
      if(response == "customer"){
        this.alertCtrl.create({
          title: "تم إنشاء الحساب",
          message: "تم إنشاء حسابك بنجاح! يرجى تسجيل الدخول للمتابعة.",
          buttons: [{
            text: "تسجيل الدخول",
            handler: ()=> {
              this.navCtrl.push("HomePage");
            }
          }]
        }).present();
        loading.dismiss();

        this.newUser.email = "";
        this.newUser.password = "";
        this.newUser.confirm_password = "";

      } else if(response !== ""){
        this.alertCtrl.create({
          title: "لم تم إنشاء الحساب",
          message: "هذا المستخدم موجود .",
          buttons: [{
            text: "نعم",
          }]
        }).present();
        loading.dismiss();
      }

    })

  }


  ngOnInit() {
    this.user = new FormGroup({
    req: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    re_password: new FormControl('', [Validators.required,this.equalto('password')])
    }); 
    }
    
    equalto(field_name): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {
    
    let input = control.value;
    
    let isValid=control.root.value[field_name]==input
    if(!isValid) 
    return { 'equalTo': {isValid} }
    else 
    return null;
    };
    }



}


  



