import { select, settings, templates, classNames } from '../settings.js';
import { utils } from '../utils.js';
import { CartProduct } from './CartProduct.js';


export class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee; //cena bedzie stala

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
    //console.log('new Cart', thisCart);
  }

  getElements(element) {


    const thisCart = this;

    thisCart.dom = {}; //obiekt, przechowywuje wszystkie elementy DOM, wyszukane w komponencie koszyka. 
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee']; //do wyswietl. aktualnych sum 
    for (let key of thisCart.renderTotalsKeys) {
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      //Każda z nich będzie zawierać kolekcję elementów znalezionych za pomocą odpowiedniego selektora.
    }
    thisCart.dom.form = document.querySelector(select.cart.form);
    thisCart.dom.phone = document.querySelector(select.cart.phone);
    thisCart.dom.address = document.querySelector(select.cart.address);


  }

  initActions() {

    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function () {
      thisCart.remove(event.detail.cartProduct);  //handler eventu, wywolujący metody remove
    });

    thisCart.dom.form.addEventListener('submit', function () {
      event.preventDefault();
      thisCart.sendOrder();
    });


  }

  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.order; //adres endpointu. kontaktojemy sie z endpointem zamowenie(order)

    const payload = { //ladunek- czyli tak określa się dane, które będą wysłane do serwera
      address: thisCart.dom.address,
      phone: thisCart.dom.phone,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    console.log(thisCart.products);


    for (let singleProduct of thisCart.products) {
      const orderedProduct = singleProduct.getData;
      payload.products.push(orderedProduct);
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });

  }

  add(menuProduct) { //dodaje produkt do koszyka , menuProdukt - instancja produktu 
    const thisCart = this;
    //console.log('adding product', menuProduct);

    /* generate HTML based on template czyli generuje kod HTML pojedynczego produktu */
    const generatedHTML = templates.cartProduct(menuProduct);

    /* create element using utils.createElementFromHTML - tworzenie elementu DOM */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    //console.log('generatedDOM', generatedDOM);

    /* find cart container */ // znajdujemy kontener menu,którego selektor mamy zapisany w select.containerOf.menu.
    const cartContainer = thisCart.dom.productList;

    /* add element to cart  */ //dodajemy stworzony element do menu za pomocą metody appendChils
    cartContainer.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM)); /* ????????jednocześnie stworzymy nową instancję klasy new CartProduct 
      oraz dodamyją do tablicy thisCart.products */
    //push - Dodaje jeden lub więcej elementów na koniec tablicy i zwraca jej nową długość. Metoda ta zmienia długość tablicy.
    //console.log('thisCart.products', thisCart.products);

    thisCart.update();
  }




  update() {
    const thisCart = this;
    thisCart.totalNumber = 0; //wlasciwosc instancji koszyka 
    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products) { //uzyj pętli for...of, iterującej po thisCart.products
      thisCart.subtotalPrice += product.price; //suma cen pozycji w koszyku,
      thisCart.totalNumber += product.amount; // zwiekszyc o liczbe produktów
    }

    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;//cena ostateczna
    console.log('total numer', thisCart.totalNumber);
    console.log(thisCart.subtotalPrice);
    console.log(thisCart.totalPrice);


    for (let key of thisCart.renderTotalsKeys) { //wyswietlenie aktualnych cen 
      for (let elem of thisCart.dom[key]) { //pętlę iterującą po każdym elemencie z kolekcji,
        elem.innerHTML = thisCart[key];
      }
    }
  }


  remove(cartProduct) {
    const thisCart = this;
    const index = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(index, 1);
    cartProduct.dom.wrapper.remove();
    thisCart.update();

  }

}
