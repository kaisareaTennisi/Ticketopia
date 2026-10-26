(function (window) {
  function buildQuery(params) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      const trimmed = String(value ?? "").trim();
      if (trimmed) search.set(key, trimmed);
    });
    return search.toString();
  }

  function buildUrl(pathname, params) {
    const query = buildQuery(params);
    return query ? `${pathname}?${query}` : pathname;
  }

  function canonicalizeCurrentUrl() {
    const params = new URLSearchParams(window.location.search);
    const canonical = buildQuery({
      province: params.get("province"),
      q: params.get("q"),
      sort: params.get("sort"),
    });
    const current = window.location.search.replace(/^\?/, "");
    if (canonical === current) return;
    const nextUrl = canonical
      ? `${window.location.pathname}?${canonical}`
      : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  }

  function bindDestinationFilterForm(form) {
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      window.location.href = buildUrl(form.getAttribute("action") || "/destinations", {
        province: form.elements.province?.value || "",
        q: form.elements.q?.value || "",
        sort: form.elements.sort?.value || "",
      });
    });
  }

  window.TiketopiaUrlParams = { buildUrl, canonicalizeCurrentUrl, bindDestinationFilterForm };
})(window);
