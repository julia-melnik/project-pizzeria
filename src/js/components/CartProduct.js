import { select } from '../settings.js';
import { AmountWidget } from './AmountWidget.js';

export class CartProduct {

  constructor(menuProduct, element) {

    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params)); /*deep copy, kopiuje obiekty na wszystkich poziomach 
      – również obiekty zapisane we właściwościach klonowanego obiektu.*/

    thisCartProduct.getElements(element);

    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();

    //console.log('new CartProduct', thisCartProduct);
    //console.log('productData', menuProduct);
  }

  getElements(element) {

    const thisCartProduct = this;

    thisCartProduct.dom = {}; 

    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
  }

  initAmountWidget() { //tworzy instancję klasy AmountWidget i zapisuje ją we właściwości produktu.

    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget); 

    thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price; 
    });


  }

  remove() { //usuwanie produktu z koszyka
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: { //przekazujemy odwołanie do tej instancji, dla której kliknięto guzik usuwania.
        cartProduct: thisCartProduct, 
      }
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event); 
  }

  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function () {
      event.preventDefault();
    });

    thisCartProduct.dom.remove.addEventListener('click', function () {
      event.preventDefault();
      thisCartProduct.remove();

    });
  }

  getData() { //wszystko zebrane w jednym obiekcie
    const thisCartProduct = this;

    return thisCartProduct.id, thisCartProduct.name, thisCartProduct.price, thisCartProduct.priceSingle, thisCartProduct.amount, thisCartProduct.params;
  }
}
