import CalendarWidget from "./widget.js";
import EventAPI from "./api/events.js";
import { modal, toast } from "./utils.js";

let widget = new CalendarWidget({
  rootEl: document.querySelector(".calendar-widget__container"),
});

class CalendarPage {
  constructor() {
    this.events = [];
    this.selectedDateInfo = widget.getInfoByDate(widget.currentDate);
    this.dateFilterValues = ["День", "Неделя", "Месяц"];
    this.selectedDateFilter = this.dateFilterValues[0];
  }

  onSelectDate = (dateInfo) => {
    this.selectedDateInfo = dateInfo;

    this.updateEventDetails(dateInfo);
  };

  updateEventDetails(dateInfo) {
    const date = new Date(dateInfo.dateAsString);
    let dayOfWeek = date.getDay();

    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(date.setDate(date.getDate() - dayOfWeek));

    const endOfWeek = new Date(date.setDate(date.getDate() + 6));
    const startOfWeekDay = startOfWeek.getDate();
    const endOfWeekDay = endOfWeek.getDate();

    const { day, month, year } = dateInfo;

    const eventsPerDate = this.events
      .filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() + 1 === month;
      })
      .filter((event) => {
        if (this.selectedDateFilter === "День") {
          return (
            `${year}-${month}-${String(day).padStart(2, "0")}` === event.date
          );
        }

        if (this.selectedDateFilter !== "Неделя") {
          return true;
        }

        const eventDate = new Date(event.date);
        const eventDay = eventDate.getDate();
        return eventDay >= startOfWeekDay && eventDay <= endOfWeekDay;
      })
      .sort((a, b) => a.date - b.date);

    const calendarGridEl = document.querySelector(".calendar-details__grid");
    calendarGridEl.innerHTML = "";

    const eventItemEls = eventsPerDate.map((event) => {
      const eventItemEl = document.createElement("div");
      const height =
        +event.end_time.split(":", 1) - +event.start_time.split(":", 1) || 1;
      eventItemEl.classList.add("calendar-event");
      eventItemEl.style.height = `${height * 48}px`;

      eventItemEl.textContent = event.text;
      eventItemEl.dataset.start_time = event.start_time;
      eventItemEl.dataset.end_time = event.end_time;

      const eventItemUtilsEl = document.createElement("div");
      eventItemUtilsEl.classList.add("calendar-event__utils");
      const editButtonEl = document.createElement("button");
      editButtonEl.classList.add(
        "button",
        "button_icon",
        "calendar-event__utils-edit"
      );
      editButtonEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h6.525q.5 0 .75.313t.25.687t-.262.688T11.5 5H5v14h14v-6.525q0-.5.313-.75t.687-.25t.688.25t.312.75V19q0 .825-.587 1.413T19 21zm4-7v-2.425q0-.4.15-.763t.425-.637l8.6-8.6q.3-.3.675-.45t.75-.15q.4 0 .763.15t.662.45L22.425 3q.275.3.425.663T23 4.4t-.137.738t-.438.662l-8.6 8.6q-.275.275-.637.438t-.763.162H10q-.425 0-.712-.288T9 14m12.025-9.6l-1.4-1.4zM11 13h1.4l5.8-5.8l-.7-.7l-.725-.7L11 11.575zm6.5-6.5l-.725-.7zl.7.7z"/></svg>`;
      editButtonEl.addEventListener("click", () => this.updateEvent(event));

      const deleteButtonEl = document.createElement("button");
      deleteButtonEl.classList.add(
        "button",
        "button_icon",
        "calendar-event__utils-delete"
      );
      deleteButtonEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zm-7 11q.425 0 .713-.288T11 16V9q0-.425-.288-.712T10 8t-.712.288T9 9v7q0 .425.288.713T10 17m4 0q.425 0 .713-.288T15 16V9q0-.425-.288-.712T14 8t-.712.288T13 9v7q0 .425.288.713T14 17M7 6v13z"/></svg>`;
      deleteButtonEl.addEventListener("click", () => this.deleteEvent(event));

      eventItemUtilsEl.append(editButtonEl, deleteButtonEl);
      eventItemEl.appendChild(eventItemUtilsEl);

      return eventItemEl;
    });

    calendarGridEl.append(...eventItemEls);

    const calendarHeader = document.querySelector(".calendar-details__header");
    const calendarHeaderItem = document.createElement("li");
    calendarHeaderItem.classList.add("calendar-details__header-item");
    calendarHeaderItem.textContent =
      this.selectedDateFilter === "День"
        ? `${dateInfo.weekday}, ${dateInfo.day}`
        : this.selectedDateFilter === "Неделя"
        ? `${startOfWeekDay}.${startOfWeek.getMonth() + 1} - ${endOfWeekDay}.${
            endOfWeek.getMonth() + 1
          }`
        : widget.getTitleByDate(dateInfo.date);

    calendarHeader.innerHTML = "";
    calendarHeader.appendChild(calendarHeaderItem);
  }

  createFilter() {
    const panelFilters = document.querySelector(".calendar-panel__filters");
    const selectEl = document.createElement("div");
    selectEl.classList.add("calendar-select");

    const selectButtonTextEl = document.createElement("span");
    selectButtonTextEl.classList.add("calendar-select__button-text");
    selectButtonTextEl.textContent = this.selectedDateFilter;

    const selectButtonEl = document.createElement("button");
    selectButtonEl.classList.add("calendar-select__button");
    selectButtonEl.innerHTML = `${selectButtonTextEl.outerHTML}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1.5rem"
        height="1.5rem"
        viewBox="0 0 24 24"
      >
        <path
          fill="#fff"
          d="M8.12 9.29L12 13.17l3.88-3.88a.996.996 0 1 1 1.41 1.41l-4.59 4.59a.996.996 0 0 1-1.41 0L6.7 10.7a.996.996 0 0 1 0-1.41c.39-.38 1.03-.39 1.42 0"
        />
      </svg>`;
    selectButtonEl.addEventListener("click", () => {
      selectButtonEl.classList.toggle("calendar-select__button_selected");
    });

    const popupEl = document.createElement("ul");
    popupEl.classList.add("calendar-select__popup");
    const popupItemEls = this.dateFilterValues.map((val) => {
      const popupItemEl = document.createElement("li");
      popupItemEl.classList.add("calendar-select__popup-item");
      if (val === this.selectedDateFilter) {
        popupItemEl.classList.add("calendar-select__popup-item_selected");
      }
      popupItemEl.textContent = val;
      popupItemEl.addEventListener("click", () => {
        const buttonTextEl =
          popupItemEl.parentElement?.parentElement?.querySelector(
            ".calendar-select__button > .calendar-select__button-text"
          );
        if (buttonTextEl) {
          this.selectedDateFilter = buttonTextEl.textContent = val;
        }
        Array.from(popupEl.children).map((el) =>
          el.classList.remove("calendar-select__popup-item_selected")
        );
        popupItemEl.classList.add("calendar-select__popup-item_selected");
        this.updateEventDetails(this.selectedDateInfo);
      });

      return popupItemEl;
    });

    popupEl.append(...popupItemEls);
    selectEl.append(selectButtonEl, popupEl);
    panelFilters.appendChild(selectEl);
  }

  createCalendarDetails() {
    const calendarEl = document.querySelector(".calendar-details");
    calendarEl.innerHTML = "";
    const calendarHeaderEl = document.createElement("ul");
    calendarHeaderEl.classList.add("calendar-details__header");

    const currentDateFullInfo = widget.getCurrentDateFullInfo();

    const calendarHeaderItem = document.createElement("li");
    calendarHeaderItem.classList.add("calendar-details__header-item");
    calendarHeaderItem.textContent = `${currentDateFullInfo.weekday}, ${currentDateFullInfo.day}`;

    calendarHeaderEl.append(calendarHeaderItem);

    const calendarBodyEl = document.createElement("div");
    calendarBodyEl.classList.add("calendar-details__body");

    const calendarBodyHeaderEl = document.createElement("ul");
    calendarBodyHeaderEl.classList.add("calendar-details__body-header");
    calendarBodyHeaderEl.style.display = "none"; // удалить позже
    const hours = Array.from(
      { length: 24 },
      (_, i) => `${String(i).padStart(2, "0")}:00`
    );

    const calendarBodyItemEls = hours.map((hour) => {
      const calendarBodyItemEl = document.createElement("li");
      calendarBodyItemEl.classList.add("calendar-details__body-header__item");
      const calendarBodyItemNameEl = document.createElement("span");
      calendarBodyItemNameEl.classList.add(
        "calendar-details__body-header__item-name"
      );
      calendarBodyItemNameEl.textContent = hour;
      calendarBodyItemEl.appendChild(calendarBodyItemNameEl);
      return calendarBodyItemEl;
    });

    calendarBodyHeaderEl.append(...calendarBodyItemEls);

    const calendarBodyGridEl = document.createElement("div");
    calendarBodyGridEl.classList.add("calendar-details__grid");

    calendarBodyEl.append(calendarBodyHeaderEl, calendarBodyGridEl);

    calendarEl.append(calendarHeaderEl, calendarBodyEl);
  }

  createEventForm = (dateInfo) => {
    const { year, month, day } = dateInfo;
    const modalFormEl = document.createElement("form");
    modalFormEl.classList.add("modal-form");
    modalFormEl.id = "event-create";
    modalFormEl.method = "POST";
    modalFormEl.action = "/api/events/index.php";

    const textLabelEl = document.createElement("label");
    textLabelEl.classList.add("modal-form__label-wrapper");
    textLabelEl.setAttribute("for", "event-text");

    const textInputEl = document.createElement("input");
    textInputEl.classList.add("modal-form__text-input");
    textInputEl.type = "text";
    textInputEl.id = "event-text";
    textInputEl.name = "text";
    textInputEl.required = true;
    textLabelEl.append("Описание события", textInputEl);

    const dateInputEl = document.createElement("input");
    dateInputEl.hidden = true;
    dateInputEl.required = true;
    dateInputEl.id = "event-date";
    dateInputEl.name = "date";
    dateInputEl.value = `${year}-${month}-${day}`;

    const startTimeInputEl = document.createElement("input");
    startTimeInputEl.hidden = true;
    startTimeInputEl.required = true;
    startTimeInputEl.id = "event-start-time";
    startTimeInputEl.name = "start_time";
    startTimeInputEl.value = "12:00:00";

    const endTimeInputEl = document.createElement("input");
    endTimeInputEl.hidden = true;
    endTimeInputEl.required = true;
    endTimeInputEl.id = "event-start-time";
    endTimeInputEl.name = "end_time";
    endTimeInputEl.value = "12:00:00";

    const createButtonEl = document.createElement("button");
    createButtonEl.classList.add("button");
    createButtonEl.type = "submit";
    createButtonEl.textContent = "Создать";

    modalFormEl.append(
      textLabelEl,
      dateInputEl,
      startTimeInputEl,
      endTimeInputEl,
      createButtonEl
    );
    return modalFormEl;
  };

  createEvent = () => {
    const date = new Date(widget.selectedDateAsString);
    const dateInfo = widget.getMiniInfoByDate(date);
    const modalFormEl = this.createEventForm(dateInfo);

    const modalEl = modal(modalFormEl, "Создать новое событие");
    modalFormEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      modalEl.remove();
      const result = await EventAPI.fetchByForm(modalFormEl);
      if (!result) {
        return;
      }

      toast("Событие успешно создано", "success", 5000);
      await this.fetchEvents();
      this.updateEventDetails(this.selectedDateInfo);
    });
  };

  updateEvent = (event) => {
    const date = new Date(widget.selectedDateAsString);
    const dateInfo = widget.getMiniInfoByDate(date);
    const modalFormEl = this.createEventForm(dateInfo);
    modalFormEl._method = "PATCH";
    modalFormEl.action = `/api/events/index.php?id=${event.id}`;

    const submitButtonEl = modalFormEl.querySelector(".button");
    submitButtonEl.textContent = "Изменить";

    const modalEl = modal(modalFormEl, "Изменить событие");
    modalFormEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      modalEl.remove();
      const result = await EventAPI.fetchByForm(modalFormEl);
      if (!result) {
        return;
      }

      toast("Событие успешно изменено", "success", 5000);
      await this.fetchEvents();
      this.updateEventDetails(this.selectedDateInfo);
    });
  };

  deleteEvent = (event) => {
    const modalFormEl = document.createElement("form");
    modalFormEl.classList.add("modal-form");
    modalFormEl.id = "event-delete";
    modalFormEl._method = "DELETE";
    modalFormEl.action = `/api/events/index.php?id=${event.id}`;

    const createButtonEl = document.createElement("button");
    createButtonEl.classList.add("button", "button_danger");
    createButtonEl.textContent = "Удалить";
    createButtonEl.type = "submit";
    modalFormEl.append(createButtonEl);

    const modalEl = modal(modalFormEl, "Удалить событие?");
    modalFormEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      modalEl.remove();
      const result = await EventAPI.fetchByForm(modalFormEl);
      if (!result) {
        return;
      }

      toast("Событие успешно удалено", "success", 5000);
      await this.fetchEvents();
      this.updateEventDetails(this.selectedDateInfo);
    });
  };

  async fetchEvents() {
    this.events = await EventAPI.getAll();
  }

  addEventListeners() {
    const createButtonEl = document.querySelector(
      ".calendar-panel__actions-create"
    );

    createButtonEl.addEventListener("click", this.createEvent);
  }

  async init() {
    widget.onSelectDate(this.onSelectDate);
    widget.createWidget();

    this.createFilter();
    this.createCalendarDetails();
    this.addEventListeners();
    await this.fetchEvents();
    this.updateEventDetails(this.selectedDateInfo);
  }
}

const page = new CalendarPage();
await page.init();
