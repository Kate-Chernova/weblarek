import { ensureElement } from "../../utils/utils"; 
import { Component } from "../base/Component"; 
import { IEvents } from "../base/Events"; 

interface IBasket { 
  items: HTMLElement[]; 
  price: number; 
} 

export class Basket extends Component<IBasket> { 
  protected basketListElement: HTMLElement; 
  protected placeButton: HTMLButtonElement; 
  protected priceElement: HTMLElement; 
  private isEmptyState: boolean = true;

  constructor(container: HTMLElement, protected events: IEvents) { 
    super(container); 

    this.basketListElement = ensureElement<HTMLElement>('.basket__list', this.container); 
    this.placeButton = ensureElement<HTMLButtonElement>('.basket__button', this.container); 
    this.priceElement = ensureElement<HTMLElement>('.basket__price', this.container); 
    
    this.setPurchaseOpportunity(true);
    
    this.placeButton.addEventListener('click', () => { 
      if (!this.isEmptyState) {
        this.events.emit('order:open'); 
      }
    }); 
  } 

  set items(value: HTMLElement[]) { 
    this.basketListElement.innerHTML = ''; 
    
    this.isEmptyState = value.length === 0;
    
    if (this.isEmptyState) { 
      this.setPurchaseOpportunity(true);
    } else { 
      this.basketListElement.append(...value);
      this.setPurchaseOpportunity(false);
    } 
  } 

  set price(value: number) { 
    this.priceElement.textContent = `${value} синапсов`; 
  } 

  setPurchaseOpportunity(isEmpty: boolean) { 
    this.placeButton.disabled = isEmpty; 
    this.placeButton.classList.toggle('button_disabled', isEmpty); 
  } 
}