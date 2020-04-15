import { select, settings } from '../settings.js';
import { BaseWidget } from './BaseWidget.js';


export class AmountWidget extends BaseWidget { //dodaliśmy informację, że jest ona rozszerzeniem klasy BaseWidget
  constructor(wrapper)  { //otrzymuje odniesienie do elementu, w którym widget ma zostać zainicjowany
    super(wrapper, settings.amountWidget.defaultValue);
    
    const thisWidget = this;

    thisWidget.getElements();
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.initActions();
   
    
    //thisWidget.setValue(thisWidget.input.value);
   
    //console.log('AmountWidget:', thisWidget);
    //console.log('constructor arguments:', element);
  }

  getElements() {
    const thisWidget = this;

    //thisWidget.element = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }
  /* NIE POTRZEBUJEMY, poniewaz mamy basewidget 
  setValue(value) { 
    const thisWidget = this;

    const newValue = parseInt(value);

    if (newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {



      thisWidget.value = newValue; 
      thisWidget.announce();
    }

    thisWidget.input.value = thisWidget.value;  
  } */

  isValid(newValue){
    return !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax;
  }
  
  
  initActions() {

    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function () {
      //thisWidget.setValue(thisWidget.input.value);
      thisWidget.value = thisWidget.dom.input.value;
      console.log(thisWidget.input.value);
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function () {
      event.preventDefault();
      //thisWidget.setValue(thisWidget.value - 1);
      thisWidget.value = parseInt(thisWidget.dom.input.value) - 1; 
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function () {
      event.preventDefault();
      //thisWidget.setValue(thisWidget.value + 1);
      thisWidget.value = parseInt(thisWidget.dom.input.value) + 1; 
    });

  }  
  
  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }
  
  // ANNOUNCE nie będzie nam już potrzebna, ponieważ zostanie "dostarczona" przez klasę BaseWidget

  /* announce() { Będzie ona tworzyła instancje klasy Event. Następnie, ten event zostanie wywołany na kontenerze naszego widgetu.
    const thisWidget = this;
   const event = new CustomEvent('updated', { custom dod. custom dla Aktualizacja sum po zmianie ilości
       bubbles: true          event po wykonaniu na jakimś elemencie będzie przekazany jego rodzicowi, oraz rodzicowi rodzica
   });
   thisWidget.element.dispatchEvent(event); Wywołuje zdarzenie w bieżącym elemencie. 
   } */

}
