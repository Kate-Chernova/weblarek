import { categoryMap, CDN_URL } from "../../../utils/constants";
import { IProduct } from "../../../types";
import { Card } from "./Card";
import { ensureElement } from "../../../utils/utils";

type CategoryKey = keyof typeof categoryMap;
export type TCardPreview = Pick<IProduct, 'image' | 'category' | 'description'>;

export interface ICardActions {
  onClick?: (event: MouseEvent) => void;
  onButtonClick?: (event: MouseEvent) => void;
}

export class CardPreview extends Card<TCardPreview> {
  protected categoryElement: HTMLElement;
  protected imageElement: HTMLImageElement;
  protected descriptionElement: HTMLElement;
  protected cardButton: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);
    
    this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);
    this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);
    this.descriptionElement = ensureElement<HTMLElement>('.card__text', this.container);
    this.cardButton = ensureElement<HTMLButtonElement>('.card__button', this.container);

    if (actions?.onButtonClick) {
      this.cardButton.addEventListener('click', actions.onButtonClick);
    }
  }

  set category(value: string) {
    this.categoryElement.textContent = value;
    for (const key in categoryMap) {
      this.categoryElement.classList.toggle(
        categoryMap[key as CategoryKey],
        key == value
      );
    }
  }

  set image(value: string) {
    this.setImage(this.imageElement, CDN_URL + value.slice(0, -3) + 'png', this.titleElement.textContent);
  }

  set description(value: string) {
    this.descriptionElement.textContent = value;
  }

  set disabled(value: boolean) {
    this.cardButton.disabled = value;
    this.cardButton.classList.toggle('button_disabled', value);
  }

  set cardButtonText(value: string) {
    this.cardButton.textContent = value;
  }

  setPurchaseOpportunity(isInShoppingCart: boolean,price: number | null) {
    if (price === null) {
      this.cardButtonText = 'Недоступно';
      this.disabled = true;
    } else if (isInShoppingCart) {
      this.cardButtonText = 'Удалить из корзины';
      this.disabled = false;
    }
  }
}