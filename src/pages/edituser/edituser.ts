import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { WoocommerceProvider } from '../../providers/woocommerce/woocommerce';
import { FormControl, FormGroup, Validators,ValidatorFn,AbstractControl } from '@angular/forms';


@IonicPage({})
@Component({
  selector: 'page-edituser',
  templateUrl: 'edituser.html',
})
export class EdituserPage {

  WooCommerce: any;
  newEdituser: any;
  userInfo: any;
  id : number; 
  user: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private WP: WoocommerceProvider,public storage: Storage,private loadingCtrl: LoadingController,
    public toastCtrl:ToastController) {

    this.newEdituser = {};

    this.WooCommerce = WP.init();

    let loading = this.loadingCtrl.create({
    });
    loading.present();

    this.storage.get("userLoginInfo").then((userLoginInfo) => {
    let email = userLoginInfo.user.email;
    this.WooCommerce.getAsync('customers?email='+ email).then((data) => {
      let newEdituser = JSON.parse(data.body);
      this.id = newEdituser[0].id;
      this.newEdituser = newEdituser[0]
      loading.dismiss();
    })
    
  })

  }


  edit(){

    let loading = this.loadingCtrl.create({
    });
    loading.present();

    let customerData = {
      customer : {}
    }
    customerData.customer = {
      "first_name": this.newEdituser.first_name,
      "last_name": this.newEdituser.last_name,
      "email": this.newEdituser.email,
      "username": this.newEdituser.username,
      "password": this.newEdituser.password,
    }

    this.WooCommerce.putAsync('customers/'+this.id, customerData.customer).then( (data) => {
      this.toastCtrl.create({
        message: "تم التعديل",
        duration: 5000,
      }).present(); 
       loading.dismiss();
       return; 
    })

  }

  ngOnInit() {
    this.user = new FormGroup({
    reqone: new FormControl('', [Validators.required]),
    reqtwo: new FormControl('', [Validators.required]),
    reqthree: new FormControl('', [Validators.required]),
    reqfour: new FormControl('', [Validators.required]),
    password: new FormControl('', []),
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
