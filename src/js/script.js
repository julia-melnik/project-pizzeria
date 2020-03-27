/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = { //obiekt
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

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = { //obiekt
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML), //metoda, stworzona za pomocą handlebars
  };

  class Product { // product to obiekt 
    constructor(id, data) { /* to specjalna metoda, która uruchomi się przy tworzeniu 
      każdej instancji. Id i data to argumenty ktore otrzymuje konstruktor */

      const thisProduct = this; //reprezentuje obiekt stworzony na podstawie klasy.
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      console.log('new Product;', thisProduct);
      thisProduct.initAccordion();
    }
    renderInMenu() { //renderuje czyli tworzy produkty na stronie
      const thisProduct = this;

      /* generate HTML based on template czyli generuje kod HTML pojedynczego produktu */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML - tworzenie elementu DOM */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

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
      clickableTrigger.addEventListener('click', function(event){

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

  const app = {

    initMenu: function () { // metoda i jej deklaracja
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);
      for (let productData in thisApp.data.products) { // tworzymy nową instancję dla każdego produktu. 
        new Product(productData, thisApp.data.products[productData]);
      }

    },

    initData: function () { // metoda. w przyszłości pozwoli nam zmienić sposób pobierania danych.
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

  app.init();
}
