export const ucFirst = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const clamp = (value, min, max) =>
  value < min ? min : value > max ? max : value;

export function parseNestedKey(obj, key, val) {
  let keys = key.split(/\[|\]/).filter((k) => k);
  let current = obj;

  for (let i = 0; i < keys.length; i++) {
    let k = keys[i];
    let isLast = i === keys.length - 1;

    if (!isNaN(k)) {
      k = parseInt(k);
      if (!Array.isArray(current)) current = [];
      if (!current[k]) current[k] = isLast ? val : isNaN(keys[i + 1]) ? {} : [];
    } else {
      if (!current[k]) current[k] = isLast ? val : isNaN(keys[i + 1]) ? {} : [];
    }

    current = current[k];
  }

  return obj;
}

export function formdataToJSON(formData) {
  const obj = {};
  for (const [key, val] of formData.entries()) {
    let value = key.includes("completed") ? val === "true" : val;
    parseNestedKey(obj, key, value);
  }

  return JSON.stringify(obj);
}

export function toast(html, type = "success", lifetime = 5000) {
  const existToasts = document.querySelectorAll(".toast");
  if (existToasts) {
    Array.from(existToasts).map((toast) => toast.prettyRemove());
  }

  const toastEl = document.createElement("div");
  toastEl.classList.add("toast", "toast__progress-in");
  setTimeout(() => {
    toastEl.classList.remove("toast__progress-in");
  }, 150);
  if (type) {
    toastEl.classList.add(`toast_${type}`);
  }
  const toastBodyEl = document.createElement("div");
  toastBodyEl.classList.add("toast__body");
  toastBodyEl.innerHTML = html;
  const toastUtilityEl = document.createElement("div");
  toastUtilityEl.classList.add("toast__utility");

  const removeToastHandle = () => {
    toastEl.classList.add("toast__progress-out");
    setTimeout(() => {
      toastEl.classList.remove("toast__progress-out");
      toastEl.remove();
    }, 150);
  };
  toastEl.prettyRemove = removeToastHandle;
  toastUtilityEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 11 11"><path d="M2.2 1.19l3.3 3.3L8.8 1.2a.67.67 0 0 1 .5-.2a.75.75 0 0 1 .7.7a.66.66 0 0 1-.2.48L6.49 5.5L9.8 8.82c.13.126.202.3.2.48a.75.75 0 0 1-.7.7a.67.67 0 0 1-.5-.2L5.5 6.51L2.21 9.8a.67.67 0 0 1-.5.2a.75.75 0 0 1-.71-.71a.66.66 0 0 1 .2-.48L4.51 5.5L1.19 2.18A.66.66 0 0 1 1 1.7a.75.75 0 0 1 .7-.7a.67.67 0 0 1 .5.19z" fill="currentColor"/></svg>`;
  toastUtilityEl.addEventListener("click", removeToastHandle);

  toastEl.append(toastBodyEl, toastUtilityEl);
  if (lifetime) {
    const toastProgressEl = document.createElement("div");
    toastProgressEl.classList.add("toast__progress");
    toastProgressEl.style.animationDuration = `${lifetime}ms`;
    toastEl.appendChild(toastProgressEl);
  }

  document.body.appendChild(toastEl);
  if (!lifetime) {
    return toastEl;
  }

  setTimeout(removeToastHandle, lifetime);
}

export function modal(element, title = "Ошибка") {
  const existModals = document.querySelectorAll(".modal");
  if (existModals) {
    Array.from(existModals).map((modal) => modal.remove());
  }

  const modalEl = document.createElement("div");
  modalEl.classList.add("modal");

  const modalBackdropEl = document.createElement("div");
  modalBackdropEl.classList.add("modal-backdrop");
  modalBackdropEl.addEventListener("click", () => modalEl.remove());

  const modalContentEl = document.createElement("div");
  modalContentEl.classList.add("modal-content");

  const modalHeaderEl = document.createElement("div");
  modalHeaderEl.classList.add("modal-header");

  const modalHeaderTitleEl = document.createElement("h2");
  modalHeaderTitleEl.classList.add("modal-header__title");
  modalHeaderTitleEl.textContent = title;

  const modalHeaderCloseEl = document.createElement("button");
  modalHeaderCloseEl.classList.add(
    "button",
    "button_icon",
    "modal-header__close"
  );
  modalHeaderCloseEl.addEventListener("click", () => modalEl.remove());
  modalHeaderCloseEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m11.25 4.75l-6.5 6.5m0-6.5l6.5 6.5"/></svg>`;

  modalHeaderEl.append(modalHeaderTitleEl, modalHeaderCloseEl);

  const modalBodyEl = document.createElement("div");
  modalBodyEl.classList.add("modal-body");
  modalBodyEl.appendChild(element);

  modalContentEl.append(modalHeaderEl, modalBodyEl);
  modalEl.append(modalBackdropEl, modalContentEl);
  document.body.appendChild(modalEl);
  return modalEl;
}
