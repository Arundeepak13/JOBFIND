// Thin wrapper around fetch(): attaches the base URL, JSON headers,
// the JWT (if logged in), and normalizes error handling.
const Api = (() => {

  function token() {
    return localStorage.getItem("jf_token");
  }

  async function request(path, { method = "GET", body, isForm = false, raw = false } = {}) {
    const headers = {};
    const t = token();
    if (t) headers["Authorization"] = "Bearer " + t;
    if (!isForm) headers["Content-Type"] = "application/json";

    const res = await fetch(API_BASE_URL + path, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });

    const contentType = res.headers.get("content-type") || "";
    let data = null;
    if (contentType.includes("application/json")) {
      data = await res.json().catch(() => null);
    } else if (raw) {
      data = await res.blob();
    } else {
      data = await res.text().catch(() => "");
    }

    if (!res.ok) {
      const message =
        (data && typeof data === "object" && (data.message || data.error)) ||
        (typeof data === "string" && data) ||
        `Request failed (${res.status})`;
      throw new Error(message);
    }
    return data;
  }

  return {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body }),
    postForm: (path, formData) => request(path, { method: "POST", body: formData, isForm: true }),
    getBlob: (path) => request(path, { raw: true }),
  };
})();
