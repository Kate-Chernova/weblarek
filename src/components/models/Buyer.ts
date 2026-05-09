import { IBuyer, TPayment } from "../../types/index";  
import { IEvents } from "../base/Events";  

type TBuyerErrors = Partial<Record<keyof IBuyer, string>>;  

export class Buyer {  
  protected data: IBuyer;  
  protected events: IEvents;  

  constructor(events: IEvents) {  
    this.events = events;  
    this.data = {  
      payment: "",  
      address: "",  
      email: "",  
      phone: "",  
    };  
  }  

  savePaymentType(payment: TPayment) {  
    this.data.payment = payment;   
    this.events.emit('buyer-data:changed');  
  }  

  saveAddress(address: string) {  
    this.data.address = address;  
    this.events.emit('buyer-data:changed');  
  }  

  saveEmail(email: string) {  
    this.data.email = email;  
    this.events.emit('buyer-data:changed');  
  }  

  savePhone(phone: string) {  
    this.data.phone = phone;  
    this.events.emit('buyer-data:changed');  
  }  

  getData(): IBuyer {  
    return this.data;  
  }  

  clearBuyerData() {  
    this.data = {  
      payment: "",  
      address: "",  
      email: "",  
      phone: "",  
    };  
    
    this.events.emit('buyer-data:changed');  
  }  

  validate(): TBuyerErrors {  
    const errors: TBuyerErrors = {};  

    if (!this.data.payment.trim()) {  
      errors.payment = "Не выбран вид оплаты";  
    }  
    if (!this.data.address.trim()) {  
      errors.address = "Укажите адрес";  
    }  
    if (!this.data.email.trim()) {  
      errors.email = "Укажите email";  
    }  
    if (!this.data.phone.trim()) {  
      errors.phone = "Укажите телефон";  
    }  

    return errors;  
  }  
}