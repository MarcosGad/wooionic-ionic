import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import {Http, Request, RequestMethod, Headers} from "@angular/http";
import {Validators, FormBuilder, FormGroup } from '@angular/forms';


declare var google;
@IonicPage({})
@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html',
})
export class ContactPage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;



  mailgunUrl: string;
  mailgunApiKey: string;

  recipient: string;
  subject: any;
  message: string; 
  private todo : FormGroup; 

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private http: Http, private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController, public alertCtrl: AlertController) {

      this.todo = this.formBuilder.group({
        name: ['', Validators.required],
        email: ['', Validators.required],
        message: ['', Validators.required],
      });

      this.mailgunUrl = "sandbox8d1b820c3da748198458465aa1c777a0.mailgun.org";
      this.mailgunApiKey = window.btoa("api:4142420579ba696ca4e2db61a1bd1b9e-2b778fc3-40c72907");
  }

  ionViewDidLoad(){
    this.loadMap();
  }

  loadMap(){

    let latLng = new google.maps.LatLng(30.0850376, 31.2876961,13);
    let mapOptions = {
      center: latLng,
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }

  

  send() {

    let loading = this.loadingCtrl.create({
    });
    loading.present();

    var requestHeaders = new Headers();   
    requestHeaders.append("Authorization", "Basic " + this.mailgunApiKey);
    requestHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    this.http.request(new Request({
        method: RequestMethod.Post,
        url: "https://api.mailgun.net/v3/" + this.mailgunUrl + "/messages",
        body: "from=" + this.recipient + "&to=atswaq@gmail.com&subject=" + this.subject + "&text=" + this.message,
        headers :  requestHeaders
    }))
    .subscribe(success => {
        this.recipient = ""; 
        this.subject = "";
        this.message = ""; 
        this.alertCtrl.create({
          message: "تم ارسال رسالتك",
          buttons: [{
            text: "نعم",
          }]
        }).present();

        loading.dismiss();

    }, error => {
        this.alertCtrl.create({
          message: 'برجاء التأكد من البريد الألكترونى',
          buttons: [{
            text: "نعم",
          }]
        }).present();

        loading.dismiss();
    });
}




}
