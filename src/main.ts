import "./scss/styles.scss"; 
import { EventEmitter } from "./components/base/Events"; 
import { ProductCatalog } from "./components/models/ProductCatalog"; 
import { Api } from "./components/base/Api"; 
import { API_URL } from "./utils/constants"; 
import { ServerApi } from "./components/communication/ServerApi"; 
import { IOrderResultApi, IProduct, TPayment } from "./types"; 
import { Gallery } from "./components/views/Gallery"; 
import { CardCatalog } from "./components/views/Card/CardCatalog"; 
import { cloneTemplate, ensureElement } from "./utils/utils"; 
import { CardPreview } from "./components/views/Card/CardPreview"; 
import { Modal } from "./components/views/Modal"; 
import { ShoppingCart } from "./components/models/ShoppingCart"; 
import { Header } from "./components/views/Header"; 
import { CardBasket } from "./components/views/Card/CardBasket"; 
import { Basket } from "./components/views/Basket"; 
import { Buyer } from "./components/models/Buyer"; 
import { OrderForm } from "./components/views/Form/OrderForm"; 
import { ContactsForm } from "./components/views/Form/ContactsForm"; 
import { Success } from "./components/views/Success"; 


const events = new EventEmitter(); 
const productsModel = new ProductCatalog(events); 
const shoppingCartModel = new ShoppingCart(events); 
const buyerModel = new Buyer(events); 
const apiModel = new Api(API_URL); 
const serverApiModel = new ServerApi(apiModel); 

const modal = new Modal(ensureElement("#modal-container"), events); 
const gallery = new Gallery(ensureElement(".gallery")); 
const header = new Header(ensureElement(".header"), events); 
const basket = new Basket(cloneTemplate("#basket"), events); 
const currentOrderForm = new OrderForm(cloneTemplate("#order"), events); 
const currentContactsForm = new ContactsForm(cloneTemplate("#contacts"), events); 
const success = new Success(cloneTemplate("#success"), events);
const cardPreview = new CardPreview(cloneTemplate("#card-preview"), events); // Создаем один раз


serverApiModel 
  .getProducts() 
  .then((result: IOrderResultApi) => { 
    console.log("Товары получены с сервера"); 
    productsModel.saveProducts(result.items); 
  }) 
  .catch((error) => { 
    console.error("Ошибка", error); 
  }); 


events.on("card-catalog:changed", () => { 
  const items = productsModel.getProducts().map((item) => { 
    const cardCatalog = new CardCatalog(cloneTemplate("#card-catalog"), { 
      onClick: () => events.emit("card:selected", item), 
    }); 
    return cardCatalog.render(item); 
  }); 
  gallery.render({ catalog: items }); 
}); 


events.on("card:selected", (item: IProduct) => { 
  productsModel.saveProduct(item);  
  events.emit("product:selected", item);
}); 


events.on("product:selected", (item: IProduct) => { 
  const isInShoppingCart = shoppingCartModel.checkSelectedProduct(item.id); 
  
  // Обновляем контент через сеттеры
  cardPreview.updateContent({
    title: item.title,
    price: item.price,
    image: item.image,
    category: item.category,
    description: item.description,
  });
  cardPreview.setCurrentProduct(item);
  cardPreview.setPurchaseOpportunity(isInShoppingCart, item.price); 
  
  modal.content = cardPreview.render(); 
  modal.open(); 
}); 


events.on("preview:toggle", (data: { productId: string }) => {
  const product = productsModel.getProductByID(data.productId);
  if (!product) return;
  
  const isInShoppingCart = shoppingCartModel.checkSelectedProduct(product.id);
  
  if (isInShoppingCart) { 
    shoppingCartModel.deleteSelectedProduct(product.id); 
  } else if (product.price !== null) { 
    shoppingCartModel.addSelectedProduct(product); 
  } 
});


events.on("shopping-cart:changed", () => { 
  // Обновляем счетчик в хедере
  header.counter = shoppingCartModel.getSelectedProductsAmount(); 
  
  // Создаем элементы корзины
  const shoppingCartItems = shoppingCartModel.getSelectedProducts()
    .map((item, index) => { 
      const cardBasket = new CardBasket(
        cloneTemplate("#card-basket"), 
        events,
        (id: string) => events.emit("shopping-cart:remove", { id })
      );
      cardBasket.id = item.id;
      cardBasket.index = index + 1;
      cardBasket.title = item.title;
      cardBasket.price = item.price;
      return cardBasket.render(); 
    }); 
  
  basket.items = shoppingCartItems; 
  basket.price = shoppingCartModel.getTotal(); 
}); 


events.on("shopping-cart:open", () => { 
  modal.content = basket.render(); 
  modal.open(); 
}); 

// Удаление товара из корзины
events.on("shopping-cart:remove", (data: { id: string }) => { 
  shoppingCartModel.deleteSelectedProduct(data.id);
  
}); 

// Открытие формы заказа
events.on("order:open", () => { 
  modal.content = currentOrderForm.render(); 
}); 


events.on("order:changed", (data: { field: string; value: string }) => { 
  if (data.field === "payment") { 
    buyerModel.savePaymentType(data.value as TPayment); 
  } else if (data.field === "address") { 
    buyerModel.saveAddress(data.value); 
  } 
}); 

events.on("contacts:changed", (data: { field: string; value: string }) => { 
  if (data.field === "email") { 
    buyerModel.saveEmail(data.value); 
  } else if (data.field === "phone") { 
    buyerModel.savePhone(data.value); 
  } 
}); 

events.on("buyer-data:changed", (data: { field: string }) => { 
  const validation = buyerModel.validate(); 
  const buyerData = buyerModel.getData(); 

  if (data.field === "payment" || data.field === "address") { 
    currentOrderForm.payment = buyerData.payment; 
    currentOrderForm.address = buyerData.address; 
    const paymentValid = !validation.payment && !validation.address; 
    currentOrderForm.valid = paymentValid; 
    const orderErrors = [validation.payment, validation.address].filter(Boolean); 
    currentOrderForm.errors = orderErrors; 
  } 

  if (data.field === "email" || data.field === "phone") { 
    currentContactsForm.email = buyerData.email; 
    currentContactsForm.phone = buyerData.phone; 
    const contactsValid = !validation.email && !validation.phone; 
    currentContactsForm.valid = contactsValid; 
    const contactsErrors = [validation.email, validation.phone].filter(Boolean); 
    currentContactsForm.errors = contactsErrors; 
  } 
}); 

events.on("order:submit", () => { 
  modal.content = currentContactsForm.render(); 
}); 

// Оформление заказа
events.on("contacts:submit", () => { 
  const orderData = { 
    ...buyerModel.getData(), 
    items: shoppingCartModel.getSelectedProducts().map((item) => item.id), 
    total: shoppingCartModel.getTotal(), 
  }; 

  serverApiModel.postOrder(orderData) 
    .then(() => { 
      success.total = shoppingCartModel.getTotal(); 
      modal.content = success.render(); 
      
      buyerModel.clearBuyerData(); 
      shoppingCartModel.clearShoppingCart(); 
    }) 
    .catch((error) => { 
      console.error("Ошибка при оформлении заказа:", error); 
    }); 
}); 

// Закрытие окна успеха
events.on("success:close", () => { 
  modal.close(); 
});