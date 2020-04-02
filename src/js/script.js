/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
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
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
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
      thisProduct.initAmountWidget();
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
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
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
        thisProduct.addToCart();
      });
    }


    processOrder() {
      const thisProduct = this;
      console.log(thisProduct);

      /* [DONE] read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);

      thisProduct.params = {}; //???? dlaczego dopiero teraz 

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

          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > 0;
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
          /* find all images of selected options*/
          const optionImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

          /* START IF: if option is selected */
          if (optionSelected) {
            if (!thisProduct.params[paramId]) {
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }

            thisProduct.params[paramId].options[optionId] = option.label;
            /* START LOOP: for each optionImage of  all option images */
            for (let optionImage of optionImages) {

              /* add class active for images of selected options */
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
          }

          /* START ELSE : if option is not selected  */
          else {
            /* START LOOP: for each  optionImage of  all option images */
            for (let optionImage of optionImages) {

              /* remove class active for the active image */
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }

          /* END LOOP: for each optionId in param.options */
        }
        /* END LOOP: for each paramId in thisProduct.data.params */
      }
      /* multiply price by amount */
      thisProduct.priceSingle = price; //cena jednej sztuki
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value; //cena całkowita

      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = thisProduct.price;
      console.log(thisProduct.params);
    }
    
    initAmountWidget() { //tworzy instancję klasy AmountWidget i zapisuje ją we właściwości produktu.

      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });


    }

    addToCart() { //przekazuje ona całą instancję jako argument metody app.cart.add. 
      const thisProduct = this;
      thisProduct.name = thisProduct.data.name;
      app.cart.add(thisProduct); //odwolanie do cart.add 
      thisProduct.amount = thisProduct.amountWidget.value;
    }
  
  }

  class AmountWidget {
    constructor(element) { //otrzymuje odniesienie do elementu, w którym widget ma zostać zainicjowany
      const thisWidget = this;


      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element);
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) { //będziemy używać do ustawiania nowej wartości widgetu.
      const thisWidget = this;

      const newValue = parseInt(value);

      if (newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {



        thisWidget.value = newValue; // będzie sprawdzać czy wartość tej stałej jest poprawna i mieści się w dopuszczalnym zakresie
        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;  //nową wartość inputa. Dzięki temu nowa wartość wy
    }
    initActions() {

      const thisWidget = this;

      thisWidget.input.addEventListener('change', function () {

        thisWidget.setValue(thisWidget.input.value);

      });

      thisWidget.linkDecrease.addEventListener('click', function (event) {

        event.preventDefault();

        thisWidget.setValue(thisWidget.value - 1);


      });

      thisWidget.linkIncrease.addEventListener('click', function (event) {

        event.preventDefault();

        thisWidget.setValue(thisWidget.value + 1);


      });


    }
    announce() { //Będzie ona tworzyła instancje klasy Event. Następnie, ten event zostanie wywołany na kontenerze naszego widgetu.
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event); //Wywołuje zdarzenie w bieżącym elemencie.
    }

  }
  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();

      console.log('new Cart', thisCart);
    }

    getElements(element) {

      const thisCart = this;

      thisCart.dom = {}; //obiekt, przechowywuje wszystkie elementy DOM, wyszukane w komponencie koszyka. 
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList =  thisCart.dom.wrapper.querySelector(select.cart.productList);

    }
    initActions() {

      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

    }
    add(menuProduct) { //dodaje produkt do koszyka , menuProdukt - instancja produktu 
      const thisCart = this;
      console.log('adding product', menuProduct);

      /* generate HTML based on template czyli generuje kod HTML pojedynczego produktu */
      const generatedHTML = templates.cartProduct(menuProduct);

      /* create element using utils.createElementFromHTML - tworzenie elementu DOM */
      const generatedDOM  = utils.createDOMFromHTML(generatedHTML);
      console.log('generatedDOM', generatedDOM);

      /* find cart container */ // znajdujemy kontener menu,którego selektor mamy zapisany w select.containerOf.menu.
      const cartContainer = thisCart.dom.productList;

      /* add element to cart  */ //dodajemy stworzony element do menu za pomocą metody appendChils
      cartContainer.appendChild(generatedDOM);
     
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

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);


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
      thisApp.initCart();
    },
  };

  app.init();
}