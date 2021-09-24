import { Injectable } from '@angular/core';
import * as WC from 'woocommerce-api'; 


@Injectable()
export class WoocommerceProvider {
  public static nb : number = 0  ; 
  public static recently : any =null ;  
  public static favorite : any =null ;  
  public static fav :  any =null   ; 
  WooCommerce: any;

  constructor() {
    
    this.WooCommerce = WC({
      url: "http://www.atswaq.com",
      consumerKey: "ck_a8095ae678d6f9b3c369121f95cec61a585e0955",
      consumerSecret: "cs_872c6929fb6865843d8612dac99d9b407379707d",
      wpAPI: true, 
      queryStringAuth: true,
      verifySsl: true,
      version: 'wc/v2' 
    });
  }

  init(){
    return this.WooCommerce;
  }

}
