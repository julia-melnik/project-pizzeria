import { select, settings, } from '../settings.js';


export class AmountWidget {
  constructor(element) { //otrzymuje odniesienie do elementu, w którym widget ma zostać zainicjowany
    const thisWidget = this;


    thisWidget.getElements(element);
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();

    //console.log('AmountWidget:', thisWidget);
    //console.log('constructor arguments:', element);
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

    const event = new CustomEvent('updated', { //????custom dod. custom dla Aktualizacja sum po zmianie ilości
      bubbles: true //event po wykonaniu na jakimś elemencie będzie przekazany jego rodzicowi, oraz rodzicowi rodzica
    });
    thisWidget.element.dispatchEvent(event); //Wywołuje zdarzenie w bieżącym elemencie.
  }

}
