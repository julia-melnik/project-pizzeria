/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
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

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {

      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.processOrder();

      console.log('new Product:', thisProduct);
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
    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    }
    initAccordion() {

      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: click event listener to trigger */
      thisProduct.accordionTrigger.addEventListener('click', function (event) {

        /* prevent default action for event */
        event.preventDefault();

        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');

        /* find all active products */
        const allActiveProducts = document.querySelectorAll('active');

        /* START LOOP: for each active product */
        for (let activeProduct of allActiveProducts) {

          /* START: if the active product isn't the element of thisProduct */
          if (activeProduct != thisProduct.element) {
            /* remove class active for the active product */
            activeProduct.classList.remove('active');
            /* END: if the active product isn't the element of thisProduct */
          }
          /* END LOOP: for each active product */
        }
        /* END: click event listener to trigger */
      });

    }

    initOrderForm() { //odpowiedzialna za dodanie listenerów eventów do formularza, jego kontrolek, oraz guzika dodania do koszyka.
      const thisProduct = this;
      console.log(this.initOrderForm);

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
    processOrder() {
      const thisProduct = this;
      console.log(thisProduct);

      /* [DONE] read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);
      thisProduct.params = {};
      /* set variable price to equal thisProduct.data.price */
      let price = thisProduct.data.price;

      /* START LOOP: for each paramId in thisProduct.data.params */
      for (let paramId in thisProduct.data.params) {

        /* save the element in thisProduct.data.params with key paramId as const param */
        const param = thisProduct.data.params[paramId];
        console.log(param);

        /* START LOOP: for each optionId in param.options */
        for (let optionId in param.options) {

          /* save the element in param.options with key optionId as const option */
          const option = param.options[optionId];
          console.log(option);

          /* START IF: if option is selected and option is not default */
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId);
          console.log(optionSelected);

          /* START IF: if option is selected and option is not default */
          if (optionSelected && !option.default) {

            /* add price of option to variable price */
            price = price + option.price;

            /* END IF: if option is selected and option is not default */
          }
          /* START ELSE IF: if option is not selected and option is default */
          else if (!optionSelected && option.default) {
            /* deduct price of option from price */
            price = price - option.price;

            /* END ELSE IF: if option is not selected and option is default */
          }
          /* END LOOP: for each optionId in param.options */
        }
        /* END LOOP: for each paramId in thisProduct.data.params */
      }
      /*  [DONE] set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = thisProduct.price;

    }
  }
  const app = {

    initMenu: function () {
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

  app.init();
}
