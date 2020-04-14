export class BaseWidget {
  constructor(wrapperElement, initialValue) {

    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.correctValue = initialValue;  //c.v do przechowyw. wartosci widgetu 
  }

  get value() { //do odczyt.wartosci 
    const thisWidget = this;
    return thisWidget.correctValue;
  }

  set value(assignedValue) { // Przypisywana wartość, do ustawiania wartosci 
    const thisWidget = this;

    const newValue = thisWidget.parseValue(assignedValue); //zmieniamy przepis. wartosc 
    //assignedValue - przepisana wartosc, przekazana setterowi 

    //blok if sprawdza, czy wartość jest inna od dotychczasowej wartości,
    if (newValue != thisWidget.correctValue && thisWidget.isValid(newValue)) {
      //isValid - czy wartość jest poprawna – np. czy jest liczbą.
      thisWidget.correctValue = newValue;
      thisWidget.announce(); //wywoła event informujący o zmianie wartości. 
    }

    thisWidget.renderValue();
  }

  parseValue(newValue) {  //parseValue domyślnie będzie używać wbudowanej w przeglądarkę funkcji parseInt
    return parseInt(newValue);
  }

  isValid(newValue) { //czy ustawiana wartość jest poprawna
    return !isNaN(newValue); //po return wpisujemy warunek 
  }

  renderValue() { //funkcja renderująca wartość widgetu. 
    const thisWidget = this;

    console.log('widget value', thisWidget.value);
  }

  announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
    
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}