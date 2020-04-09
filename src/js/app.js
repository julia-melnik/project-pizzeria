import { Product } from './components/Product.js';
import { Cart } from './components/Cart.js';
import { select, settings } from './settings.js';

const app = {

  initMenu: function () {
    const thisApp = this;
    //console.log('thisApp.data:', thisApp.data);
    for (let productData in thisApp.data.products) { // tworzymy nową instancję dla każdego produktu. 
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },


  initData: function () { // metoda. gdzie zapisalismy def.prod i chcemy z tego skorzystać
    const thisApp = this;

    thisApp.data = {}; // dataSource to obiekt,w którym zapisaliśmy definicje naszych produktów 
    console.log(thisApp.data);

    const url = settings.db.url + '/' + settings.db.product;

    fetch(url) //wysyłamy zapytanie pod podany adres endpointu
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {  //po otrzymaniu skonwertowanej odpowiedzi parsedResponse, wyświetlamy ją w konsoli.
        console.log('parsedResponse', parsedResponse);

        // save parsedResponse as thisApp.data.products

        thisApp.data.products = parsedResponse;

        // execute initMenu method 

        thisApp.initMenu();

      });
    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.thisProductList = document.querySelector(select.containerOf.menu);
    thisApp.thisProductList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });

  },


  init: function () {
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);

    thisApp.initData();
    thisApp.initCart();
  },
};

app.init();
