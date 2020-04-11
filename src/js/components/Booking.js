
import { select, templates  } from '../settings.js';
import { utils } from '../utils.js';
import { AmountWidget } from './AmountWidget.js';

export class Booking {
  constructor(element) { 
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }


  render(element) {

    const thisBooking = this;

    /* [DONE]  generate HTML based on template*/
    const generatedHTML = templates.bookingWidget();
    // [DONE]  
    thisBooking.dom = {}; // 
    // [DONE] 
    thisBooking.dom.wrapper = element;

    thisBooking.dom.wrapper = utils.createDOMFromHTML(generatedHTML);


    // [DONE] 
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount); //??
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }




}