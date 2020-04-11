import { Product } from './components/Product.js';
import { Booking } from './components/Booking.js';
import { Cart } from './components/Cart.js';
import { select, settings, classNames } from './settings.js';

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

  
  initPages: function () {
    const thisApp = this;

    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children); 

    console.log(thisApp.pages);
    /*wyszuk. kont. którego selektor jest zapisany w select.containerOf.pages,Następnie znajdziemy wszystkie 
    dzieci tego kontenera za pomocą .children. W ten sposób uzyskamy kolekcję wrapperów podstron. */

    //O CO CHODZI?? Dzięki temu w thisApp.pages nie będziemy mieli zapisanej kolekcji elementów, ale tablicę (array) zawierającą elementy.

    thisApp.navLinks = Array.from(document.querySelectorAll(select.nav.links)); //tablica linkow do podstron
    
    // thisApp.activatePage(thisApp.pages[0].id); //wywolanie metody, 0 - pierwsza strona z indeksem 0 
    // kasujemy kod powyzej, aby Po odświeżeniu strony jednak wyświetla się ponownie menu z produktami.
    
    let pagesMatchingHash = [];

    if (window.location.hash.length > 2) {
      const idFromHash = window.location.hash.replace('#/', ''); // odczytując hash i zamieniając w nim '#/' na pusty ciąg znaków ''

      pagesMatchingHash = thisApp.pages.filter(function (page) { //??? Ta metoda pozwala na przefiltrowanie tablicy za pomocą funkcji filtrującej, przekazanej jako argument.
        return page.id == idFromHash;
      });
    }

    thisApp.activatePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id);
    



    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        /* TODO: GET PAGE ID FROM HREF*/
        const pageId = clickedElement.getAttribute('href');
        const href = pageId.replace('#', ''); //jaką role pewni href 

        /*  TODO: activate page */
        thisApp.activatePage(href); //????? pageId argument id podstrony, otrzymane z href klikniętego linka.
      });
    }


  },


  activatePage: function (pageId) {
    const thisApp = this;

    for (let link of thisApp.navLinks) {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId); //???
    }
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.nav.active, page.getAttribute('href') == '#' + pageId);
    }
  
    window.location.hash = '#/' + pageId; 
    // # - strona nie przeładuje się, jeśli do adresu dodamy znak hash #. 
    // / - sprawi, że strona nie będzie się przewijać. 
    // pageId  - id aktywowanej podstrony.
  },

  initBooking: function () {
    const thisApp = this;

    const bookingContainer = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingContainer);

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
    thisApp.initBooking();

  },
};

app.init();
