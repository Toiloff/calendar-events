import BaseAPI from "./base.js";

export default new (class EventsAPI extends BaseAPI {
  constructor() {
    super("/api/events");
  }

  async get(id, options = {}) {
    return await this.request(`${this.prefix}/index.php?id=${id}`, options);
  }

  async getAll(options = {}) {
    const data = await this.request(`${this.prefix}/index.php`, options);
    return data ? data : [];
  }

  async create(id, date, title, options = {}) {
    return await this.request(`${this.prefix}/index.php?id=${id}`, {
      method: "POST",
      body: JSON.stringify({
        date,
        title,
        start_time: "12:00:00",
        end_time: "12:00:00",
      }),
      ...options,
    });
  }

  async update(id, title, options = {}) {
    return await this.request(`${this.prefix}/index.php?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title,
      }),
      ...options,
    });
  }

  async delete(id, options = {}) {
    const data = await this.request(`${this.prefix}/index.php?id=${id}`, {
      method: "DELETE",
      ...options,
    });

    return !!data;
  }
})();
