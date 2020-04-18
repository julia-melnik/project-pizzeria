
import { select, templates, settings, classNames } from '../settings.js';
import { utils } from '../utils.js';
import { AmountWidget } from './AmountWidget.js';
import { DatePicker } from './DatePicker.js';
import { HourPicker } from './HourPicker.js';



export class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  render(element) {

    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.appendChild(utils.createDOMFromHTML(generatedHTML));
    //console.log(generatedHTML);


    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    
  }


  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('update', function () {
      thisBooking.updateDOM();
    });

  }

  getData() {
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };
    console.log('getData params', params);

    const urls = { //zapiszemy pełne adresy zapytań.
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function ([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]) {
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });

  }


  parseData(bookings, eventsRepeat, eventsCurrent) { // Agregacja danych źródłowych
    const thisBooking = this;
    thisBooking.booked = {};

    for (let event of bookings) {
      console.log('event', event);
      thisBooking.makeBooked(event.date, event.hour, event.duration, event.table);
    }

    console.log('eventsCurrent', eventsCurrent);

    for (let event of eventsCurrent) {
      console.log('event', event);
      thisBooking.makeBooked(event.date, event.hour, event.duration, event.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let event of eventsRepeat) {
      if (event.repeat == 'daily') {
        for (let eventDate = minDate; eventDate <= maxDate; eventDate = utils.addDays(eventDate, 1)) { //aby uzyskać datę przesuniętą o ileś dni, 
         
          ///???wielokrotnie uruchomić metodę makeBooked – raz dla każdego dnia z zakresu dat zdefiniowanego dla date-pickera.
          thisBooking.makeBooked(utils.dateToStr(event), event.hour, event.duration, event.table);
          //?? przekształca obiekt daty na tekst w formacie rok-miesiąc-dzień,
        }
      }
    }

    
    thisBooking.updateDOM();
  }


  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    thisBooking.booked[date] = {};
    console.log(thisBooking.booked[date]);

    const bookedTime = utils.hourToNumber(hour);

    for (let bookedPeriod = bookedTime; bookedPeriod < bookedTime + duration; bookedPeriod += 0.5) {

      thisBooking.booked[date][bookedPeriod] = [];
      console.log('thisBooking.booked[date][bookedPeriod]: ', thisBooking.booked[date][bookedPeriod]);
      thisBooking.booked[date][bookedPeriod].push(table);
    }

  }

  updateDOM() {
    const thisBooking = this;
    console.log('updateDOM');

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    for (let table of thisBooking.dom.tables) {

      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (typeof thisBooking.booked[thisBooking.date] !== 'undefined' &&
        typeof thisBooking.booked[thisBooking.date][thisBooking.hour] !== 'undefined' &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
        console.log('table', table);
      }
    }


  }



}