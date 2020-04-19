/* global flatpickr */
import { BaseWidget } from './BaseWidget.js';
import { utils } from '../utils.js';
import { select, settings,  } from '../settings.js';


export class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));
    const thisWidget = this;

    thisWidget.dom = {};
    // console.log(thisWidget.dom.wrapper);
    thisWidget.dom.wrapper = wrapper;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();
  }

  initPlugin() { //app. komp., która rozszerza funkcjon. przgłądarki 
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value);  // tworzy obiekt daty, którego wartość to "teraz", czyli data i godzina w momencie wykonania tego kodu JS.
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);
    //aby uzyskać datę przesuniętą o ileś dni, 

    

    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      disable: [
        function (date) {
          // return true to disable
          return (date.getDay() === 1);

        }
      ],
      locale: {
        firstDayOfWeek: 1 // start week on Monday
      },

      onChange: function (dateStr) { // NIE JESTEM pewna 

        thisWidget.value = dateStr;
      },
    });
  }

  parseValue(newValue) {
    return newValue;
  }

  isValid() { //też nie może pozostać domyślna, ale nie mamy dla niej zastosowania w tym widgecie
    return true;
  }

  renderValue() { //nie będzie nam potrzebna 

  }

}