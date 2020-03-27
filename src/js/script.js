/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{ // dzieki temu, zmienne i stałe z naszego skryptu nie będą dostępne w innych plikach
  'use strict';

  const select = { // obiekt zawierający selektory, które będą nam potrzebne
    templateOf: { //obiekt 
      menuProduct: '#template-menu-product', // jego właściwość, która zawiera selektor do naszego szablonu produktu.
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = { //nazwy klas, którymi nasz skrypt będzie manipulował (nadawał i usuwał),
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = { //  ustawienia naszego skryptu, wszystkie wartości, które wygodniej będzie zmieniać w jednym miejscu
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = { //szablony Handlebars, do których wykorzystujemy selektory z obiektu select
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML), //metoda, stworzona za pomocą handlebars
  };   //NIE JASNE 

  class Product { // product to klasa
    constructor(id, data) { /* to specjalna metoda, która uruchomi się przy tworzeniu 
      każdej instancji. Id i data to argumenty ktore otrzymuje konstruktor */

      const thisProduct = this; //reprezentuje obiekt stworzony na podstawie klasy.

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.initAccordion();
      console.log('new Product;', thisProduct);

    }
    renderInMenu() { //renderuje czyli tworzy produkty na stronie
      const thisProduct = this;

      /* generate HTML based on template czyli generuje kod HTML pojedynczego produktu */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML - tworzenie elementu DOM */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      //PO CO DOM? potrzebujemy też zapisać we właściwości instancji ten wygenerowany element?jak to 

      /* find menu container */ // znajdujemy kontener menu,którego selektor mamy zapisany w select.containerOf.menu.
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu  */ //dodajemy stworzony element do menu za pomocą metody appendChils
      menuContainer.appendChild(thisProduct.element);
    }


    initAccordion() { //metoda
      const thisProduct = this;

      /* [DONE] find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /*   [DONE] START: click event listener to trigger */
      clickableTrigger.addEventListener('click', function (event) {

        /*  [DONE] prevent default action for event */
        event.preventDefault();

        /*  [DONE] toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');

        /*  [DONE] find all active products */
        const allActiveProducts = document.querySelectorAll('article.active');

        /* [DONE] START LOOP: for each active product */
        for (let activeProduct of allActiveProducts) {

          /* [DONE]  START: if the active product isn't the element of thisProduct */
          if (activeProduct !== thisProduct.element) {

            /*  [DONE] remove class active for the active product */
            activeProduct.classList.remove('active');

            /* END: if the active product isn't the element of thisProduct */
          }
          /* END LOOP: for each active product */
        }
        /* END: click event listener to trigger */
      });

    }
  }

  const app = { //obiekt który pomoże nam w organizacji kodu naszej aplikacji,

    initMenu: function () { // metoda i jej deklaracja
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);
      for (let productData in thisApp.data.products) { // tworzymy nową instancję dla każdego produktu. 
        new Product(productData, thisApp.data.products[productData]);
      }

    },

    initData: function () { // metoda. gdzie zapisalismy def.prod i chcemy z tego skorzystać
      const thisApp = this;

      thisApp.data = dataSource; // dataSource to obiekt,w którym zapisaliśmy definicje naszych produktów 
    },



    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },


  };

  app.init(); // wywołanie metody, która będzie uruchamiać wszystkie pozostałe komponenty strony.
}
