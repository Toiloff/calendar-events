import { formdataToJSON, toast } from "../utils.js";

export default class BaseAPI {
  constructor(prefix = "/api") {
    this.prefix = prefix;
  }

  async request(url, options = {}) {
    const { showToast = true, ...fetchOptions } = options;

    try {
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        ...fetchOptions,
      });
      const data = await res.json();
      if (Object.hasOwn(data, "error")) {
        throw new Error(data.error);
      }

      return data;
    } catch (err) {
      console.error(`Failed to fetch ${url}, because ${err.message}`);
      showToast && toast(err.message, "error", 5000);
      return null;
    }
  }

  async fetchByForm(formEl, options = {}) {
    return await this.request(formEl.action, {
      method: formEl._method ?? formEl.method,
      body: formdataToJSON(new FormData(formEl)),
      ...options,
    });
  }
}
