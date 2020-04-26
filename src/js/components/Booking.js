
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
    thisBooking.dom.selectedTable = null;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelectorAll(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelectorAll(select.booking.address);
    thisBooking.dom.starters = element.querySelectorAll(select.booking.starter);
  }


  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);


    for (let table of thisBooking.dom.tables) {
      table.addEventListener('click', function () {
        console.log('clicked table', table);
        event.preventDefault();
        thisBooking.dom.selectedTable = table.getAttribute(settings.booking.tableIdAttribute);
        for (let t of thisBooking.dom.tables) {
          t.classList.remove(classNames.booking.tableSelected);
        }
        table.classList.add(classNames.booking.tableSelected);
      });
    }


    for (let table of thisBooking.dom.tables) {
      thisBooking.dom.datePicker.addEventListener('updated', function () {
        thisBooking.updateDOM();
        table.classList.remove(classNames.booking.tableSelected);
        table.classList.add(classNames.booking.tableBooked);
      });
    }

    thisBooking.dom.hourPicker.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.wrapper.addEventListener('submit', function () {
      event.preventDefault();
      thisBooking.sendBooking();
      thisBooking.getData();
      alert('Reservation was successfully processed');
    
      
      
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
    //console.log('getData params', params);

    const urls = { //zapiszemy pełne adresy zapytań.
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    //console.log('getData urls', urls);

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
        thisBooking.parseData(bookings, eventsRepeat, eventsCurrent);
      });

  }


  parseData(bookings, eventsRepeat, eventsCurrent) { // Agregacja danych źródłowych
    const thisBooking = this;
    thisBooking.booked = {};

    for (let event of bookings) {

      thisBooking.makeBooked(event.date, event.hour, event.duration, event.table);
    }

    console.log('eventsCurrent', eventsCurrent);

    for (let event of eventsCurrent) {

      thisBooking.makeBooked(event.date, event.hour, event.duration, event.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let event of eventsRepeat) {
      if (event.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), event.hour, event.duration, event.table);
        }
      }
    }
    thisBooking.updateDOM();
  }


  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    //console.log(thisBooking.booked[date]);

    const bookedTime = utils.hourToNumber(hour);

    for (let bookedPeriod = bookedTime; bookedPeriod < bookedTime + duration; bookedPeriod += 0.5) {
      if (typeof thisBooking.booked[date][bookedPeriod] == 'undefined') {
        thisBooking.booked[date][bookedPeriod] = [];
      }
      //console.log('thisBooking.booked[date][bookedPeriod]: ', thisBooking.booked[date][bookedPeriod]);
      thisBooking.booked[date][bookedPeriod].push(table);
    }
  }


  updateDOM() {
    const thisBooking = this;
    //console.log('updateDOM');

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
        //console.log('table', table);
      }


    }


  }

  sendBooking() { //wysyłka rezerwacji do API,
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;
    thisBooking.hour = utils.numberToHour(thisBooking.hour);

    const payload = {
      date: thisBooking.date,
      hour: utils.numberToHour(thisBooking.hour),
      table: thisBooking.tableIsBooked,
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
      starters: [],

    };

    for (let starter of thisBooking.dom.starters) {
      if (starter.checked == true) {
        payload.starters.push(starter.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponseBOOKING', parsedResponse);
        thisBooking.makeBooked(payload.date, payload.hour, payload.table, payload.duration);
      });
  }

//[IN PROCESS ]
  rangeSliderStyle() {
    const thisBooking = this;
    const bookedTimeRange = thisBooking.booked[thisBooking.date];
    const rangeColors = [];

    thisBooking.dom.rangeSlider = thisBooking.dom.wrapper.querySelector('.rangeSlider');
    const slider = thisBooking.dom.rangeSlider;

    for (let bookedTime in bookedTimeRange) {
      if (bookedTimeRange[bookedTime].length < 1) {
        //rangeColors(push) green color 
      } else if (bookedTimeRange[bookedTime].length === 2) {
        //rangeColors(push)orange color 
      } else if (bookedTimeRange[bookedTime].length === 3) {
        //rangeColors(push) red color 
      }
    }

    const color = rangeColors.join();
    slider.style.background = color;



  }
}
