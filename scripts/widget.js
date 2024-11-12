import { ucFirst } from "./utils.js";

export default class CalendarWidget {
  constructor({ rootEl, weekends = ["сб", "вс"] } = {}) {
    this.rootEl = rootEl;
    this.startOfWeek = "пн";
    this.endOfWeek = "вс";
    this.weekends = weekends;
    this.todayDate = this.currentDate = new Date();
    this.updateCurrentDateInfo();
    this.todayDateInfo = this.getMiniInfoByDate(this.todayDate);
    this.selectedDateAsString = this.currentDateInfo.dateAsString;

    this.weekdayList = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
    this.dateArray = this.getDateArray();
  }

  updateCurrentDateInfo() {
    this.currentDateInfo = this.getMiniInfoByDate(this.currentDate);
  }

  getMiniInfoByDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const dateAsString = date.toDateString();
    return {
      day,
      month,
      year,
      dateAsString,
    };
  }

  getCurrentDateFullInfo() {
    return this.dateArray.find(
      (date) => date.dateAsString === this.currentDateInfo.dateAsString
    );
  }

  getInfoByDate(date) {
    const weekday = new Intl.DateTimeFormat("ru-RU", {
      weekday: "short",
    }).format(date);
    const { day, month, year, dateAsString } = this.getMiniInfoByDate(date);
    const isToday = this.todayDateInfo.dateAsString === dateAsString;
    const isOutside = month !== this.currentDateInfo.month;
    return {
      day,
      month,
      year,
      weekday,
      dateAsString,
      date,
      isWeekend: this.weekends.includes(weekday),
      isToday,
      isSelected: this.selectedDateAsString === dateAsString,
      isOutside,
    };
  }

  getMonthDates(year, month) {
    const maxMonthDate = new Date(year, month, 0);
    return Array.from(
      { length: maxMonthDate.getDate() },
      (_, i) => new Date(year, month - 1, i + 1)
    );
  }

  getMissedMonthDates(date, num) {
    const missedDate = new Date(date);
    const isGreater = num > 0;
    missedDate.setDate(
      isGreater ? missedDate.getDate() + 1 : missedDate.getDate() - 1
    );
    const missedDateInfo = this.getInfoByDate(missedDate);
    return this.getMonthDates(missedDateInfo.year, missedDateInfo.month)
      .slice(isGreater ? 0 : num, isGreater ? num : undefined)
      .map((d) => this.getInfoByDate(d));
  }

  getDateArray() {
    const { year: currentYear, month: currentMonth } = this.currentDateInfo;
    const monthDates = this.getMonthDates(currentYear, currentMonth);

    this.dateArray = monthDates.reduce((result, date) => {
      const dateInfo = this.getInfoByDate(date);
      const isFirstDayOfMonth =
        dateInfo.day === 1 && dateInfo.month === currentMonth;
      if (
        dateInfo.isOutside ||
        ![1, monthDates.length].includes(dateInfo.day) ||
        (isFirstDayOfMonth && dateInfo.weekday === this.startOfWeek) ||
        (dateInfo.day === monthDates.length &&
          dateInfo.weekday === this.endOfWeek)
      ) {
        result.push(dateInfo);
        return result;
      }

      const dayPosition = this.weekdayList.indexOf(dateInfo.weekday);
      const numMissedDays = isFirstDayOfMonth
        ? -dayPosition
        : this.weekdayList.length - dayPosition;

      const missedMonthDates = this.getMissedMonthDates(
        dateInfo.date,
        numMissedDays
      );

      result = isFirstDayOfMonth
        ? [...missedMonthDates, ...result, dateInfo]
        : [...result, dateInfo, ...missedMonthDates];
      return result;
    }, []);

    return this;
  }

  goToPrevMonth() {
    this.currentDate.setDate(-1);
    this.updateCurrentDateInfo();
    this.rerender();
  }

  goToNextMonth() {
    this.currentDate = new Date(
      this.currentDateInfo.year,
      this.currentDateInfo.month, // in dateInfo month already has +1
      1
    );
    this.updateCurrentDateInfo();
    this.rerender();
  }

  createNavigation() {
    this.navEl = document.createElement("nav");
    this.navEl.classList.add("calendar-navigation");

    this.navBackButtonEl = document.createElement("button");
    this.navBackButtonEl.classList.add("calendar-navigation__action");
    this.navBackButtonEl.ariaLabel = "Предыдущий период";
    this.navBackButtonEl.innerHTML = `<svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.25rem"
      height="1.25rem"
      viewBox="0 0 24 24"
    >
      <path
        fill="var(--text-color)"
        d="m9.55 12l7.35 7.35q.375.375.363.875t-.388.875t-.875.375t-.875-.375l-7.7-7.675q-.3-.3-.45-.675t-.15-.75t.15-.75t.45-.675l7.7-7.7q.375-.375.888-.363t.887.388t.375.875t-.375.875z"
      />
    </svg>`;
    this.navBackButtonEl.addEventListener("click", () => this.goToPrevMonth());

    this.navTitleEl = document.createElement("button");
    this.navTitleEl.classList.add("calendar-navigation__title");

    this.navNextButtonEl = document.createElement("button");
    this.navNextButtonEl.classList.add("calendar-navigation__action");
    this.navNextButtonEl.ariaLabel = "Следующий период";
    this.navNextButtonEl.innerHTML = `<svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.25rem"
      height="1.25rem"
      viewBox="0 0 24 24"
    >
      <path
        fill="var(--text-color)"
        d="m14.475 12l-7.35-7.35q-.375-.375-.363-.888t.388-.887t.888-.375t.887.375l7.675 7.7q.3.3.45.675t.15.75t-.15.75t-.45.675l-7.7 7.7q-.375.375-.875.363T7.15 21.1t-.375-.888t.375-.887z"
      />
    </svg>`;
    this.navNextButtonEl.addEventListener("click", () => this.goToNextMonth());

    this.navEl.append(
      this.navBackButtonEl,
      this.navTitleEl,
      this.navNextButtonEl
    );
    return this;
  }

  createWeekdayList() {
    this.weekdayListEl = document.createElement("ul");
    this.weekdayListEl.classList.add("calendar-weekday");
    this.weekdayItemEls = this.weekdayList.map((weekday) => {
      const weekdayItemEl = document.createElement("li");
      weekdayItemEl.classList.add("calendar-weekday__item");
      weekdayItemEl.textContent = weekday;
      return weekdayItemEl;
    });
    this.weekdayListEl.append(...this.weekdayItemEls);
    return this;
  }

  createHeader() {
    this.headerEl = document.createElement("div");
    this.headerEl.classList.add("calendar-header");

    this.createNavigation();
    this.setNavigationTitle(this.getTitleByDate(this.currentDate));
    this.createWeekdayList();
    this.headerEl.prepend(this.navEl, this.weekdayListEl);
    return this;
  }

  createGridCell(dateInfo) {
    const cellEl = document.createElement("div");
    cellEl.classList.add("calendar-cell");
    // cellEl.dataset.date = dateInfo.dateAsString;
    cellEl.textContent = dateInfo.day;
    if (dateInfo.isToday) {
      cellEl.classList.add("calendar-cell_today");
    }

    if (dateInfo.isWeekend) {
      cellEl.classList.add("calendar-cell_weekend");
    }

    if (dateInfo.isOutside) {
      cellEl.classList.add("calendar-cell_outside");
    }

    if (dateInfo.isSelected) {
      cellEl.classList.add("calendar-cell_selected");
    }

    cellEl.addEventListener("click", () => {
      this.selectedDateAsString = dateInfo.dateAsString;
      if (dateInfo.isOutside) {
        dateInfo.month > this.currentDateInfo.month
          ? this.goToNextMonth()
          : this.goToPrevMonth();
      }

      this.selectDateCallback(dateInfo);

      this.rerender();
    });

    return cellEl;
  }

  createGridRow(els) {
    const rowEl = document.createElement("div");
    rowEl.classList.add("calendar-row");
    rowEl.append(...els);
    return rowEl;
  }

  createGrid() {
    this.gridEl = document.createElement("div");
    this.gridEl.classList.add("calendar-grid");
    const daysInWeek = this.weekdayList.length;
    const cellEls = this.dateArray.map((dateInfo) =>
      this.createGridCell(dateInfo)
    );
    const rowData = Array.from(
      {
        length: Math.ceil(cellEls.length / daysInWeek),
      },
      (_, i) => cellEls.slice(i * daysInWeek, (i + 1) * daysInWeek)
    );
    const rowEls = rowData
      .filter(
        (rowValues) =>
          !rowValues.every((val) =>
            val.classList.contains("calendar-cell_outside")
          )
      )
      .map((rowValues) => this.createGridRow(rowValues));
    this.gridEl.append(...rowEls);
  }

  setNavigationTitle(text) {
    this.navTitleEl.textContent = text;
    return this;
  }

  getTitleByDate(date) {
    const month = new Intl.DateTimeFormat("ru-RU", {
      month: "long",
    }).format(date);

    return `${ucFirst(month)} ${date.getFullYear()}`;
  }

  onSelectDate(cb = () => {}) {
    this.selectDateCallback = cb;
    return this;
  }

  rerender() {
    this.createWidget();
    const oldWidgetEl = this.rootEl.querySelector(".calendar-widget");
    if (!oldWidgetEl) {
      return;
    }

    oldWidgetEl.replaceWith(this.widgetEl);
  }

  createWidget() {
    this.getDateArray();
    this.createHeader();
    this.createGrid();

    this.widgetEl = document.createElement("div");
    this.widgetEl.classList.add("calendar-widget");
    this.widgetEl.prepend(this.headerEl, this.gridEl);
    if (!this.rootEl.querySelector(".calendar-widget")) {
      this.rootEl.append(this.widgetEl);
    }

    return this;
  }
}
