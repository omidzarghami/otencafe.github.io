/**
 * Admin panel smoke tests (API + localStorage draft helpers)
 * Run: node scripts/admin-smoke-tests.mjs
 */

const BASE = process.env.BASE_URL || "http://localhost:3000";

const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function json(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { res, body };
}

async function login() {
  // password from production sync
  return json("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ password: "G13faqk7CNW91c1IOMh7kfrGwfJS0KkS" }),
  });
}

async function main() {
  // 1) home loads
  {
    const res = await fetch(`${BASE}/`);
    res.ok ? pass("01 home loads", String(res.status)) : fail("01 home loads", String(res.status));
  }

  // 2) login page loads
  {
    const res = await fetch(`${BASE}/admin/login`);
    res.ok ? pass("02 login page loads", String(res.status)) : fail("02 login page loads", String(res.status));
  }

  // 3) dashboard redirects/unauth without cookie still returns page shell
  {
    const res = await fetch(`${BASE}/admin/dashboard`);
    res.ok ? pass("03 dashboard shell loads", String(res.status)) : fail("03 dashboard shell loads", String(res.status));
  }

  // 4) public menu API
  let publicMenu;
  {
    const { res, body } = await json("/api/menu/public");
    if (res.ok && Array.isArray(body?.sections) && body.sections.length > 0) {
      publicMenu = body;
      pass("04 public menu API", `${body.sections.length} sections`);
    } else fail("04 public menu API", JSON.stringify(body));
  }

  // 5) login succeeds
  let cookie = "";
  {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "G13faqk7CNW91c1IOMh7kfrGwfJS0KkS" }),
    });
    const setCookie = res.headers.getSetCookie?.() || [];
    cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
    const body = await res.json();
    if (res.ok && body.success) pass("05 admin login", cookie ? "cookie set" : "ok no cookie header exposed");
    else fail("05 admin login", JSON.stringify(body));
  }

  const authHeaders = cookie ? { Cookie: cookie } : {};

  // 6) auth check
  {
    const res = await fetch(`${BASE}/api/auth/check`, { headers: authHeaders });
    const body = await res.json();
    body.authenticated
      ? pass("06 auth check authenticated")
      : fail("06 auth check authenticated", JSON.stringify(body));
  }

  // 7) items API
  let items = [];
  {
    const res = await fetch(`${BASE}/api/menu/items`, { headers: authHeaders });
    const body = await res.json();
    items = body.items || [];
    items.length > 0
      ? pass("07 menu items API", `${items.length} items`)
      : fail("07 menu items API", JSON.stringify(body));
  }

  // 8) sections API
  let sections = [];
  {
    const res = await fetch(`${BASE}/api/menu/sections`, { headers: authHeaders });
    const body = await res.json();
    sections = body.sections || [];
    sections.length > 0
      ? pass("08 menu sections API", `${sections.length} sections`)
      : fail("08 menu sections API", JSON.stringify(body));
  }

  // 9) tax message get
  let taxMessage = "";
  {
    const { res, body } = await json("/api/settings/tax-message");
    if (res.ok && typeof body.taxMessage === "string") {
      taxMessage = body.taxMessage;
      pass("09 tax message get");
    } else fail("09 tax message get", JSON.stringify(body));
  }

  // 10) update price
  const sample = items.find((i) => i.id === "latte") || items[0];
  const originalPrice = sample?.price;
  const testPrice = Number(originalPrice) + 1;
  {
    const res = await fetch(`${BASE}/api/menu/update`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: sample.id, price: testPrice }),
    });
    const body = await res.json().catch(() => ({}));
    res.ok ? pass("10 price update", `${sample.id} -> ${testPrice}`) : fail("10 price update", JSON.stringify(body));
  }

  // 11) public reflects price
  {
    const { body } = await json("/api/menu/public");
    const found = body.sections.flatMap((s) => s.items).find((i) => i.id === sample.id);
    found?.price === testPrice
      ? pass("11 public reflects price", String(found.price))
      : fail("11 public reflects price", `got ${found?.price}`);
  }

  // 12) restore price
  {
    const res = await fetch(`${BASE}/api/menu/update`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: sample.id, price: originalPrice }),
    });
    res.ok ? pass("12 restore price", String(originalPrice)) : fail("12 restore price");
  }

  // 13) update item name then restore via override path
  const originalName = sample.name;
  const tempName = `${originalName} (تست)`;
  {
    const res = await fetch(`${BASE}/api/menu/items/update-name`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: sample.id, newName: tempName }),
    });
    res.ok ? pass("13 rename item") : fail("13 rename item");
  }

  // 14) rename restore
  {
    const res = await fetch(`${BASE}/api/menu/items/update-name`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: sample.id, newName: originalName }),
    });
    res.ok ? pass("14 restore item name") : fail("14 restore item name");
  }

  // 15) section rename + restore
  const section = sections[0];
  const sectionOriginal = section.title;
  {
    const res = await fetch(`${BASE}/api/menu/sections/update-name`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId: section.id, newName: `${sectionOriginal} تست` }),
    });
    res.ok ? pass("15 rename section") : fail("15 rename section");
  }
  {
    const res = await fetch(`${BASE}/api/menu/sections/update-name`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId: section.id, newName: sectionOriginal }),
    });
    res.ok ? pass("16 restore section name") : fail("16 restore section name");
  }

  // 17) tax message update + restore
  {
    const res = await fetch(`${BASE}/api/settings/tax-message`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ taxMessage: `${taxMessage} ` }),
    });
    res.ok ? pass("17 tax message update") : fail("17 tax message update");
  }
  {
    const res = await fetch(`${BASE}/api/settings/tax-message`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ taxMessage }),
    });
    res.ok ? pass("18 tax message restore") : fail("18 tax message restore");
  }

  // 19) add + delete custom item
  const customItemId = `test-${Date.now()}`;
  {
    const res = await fetch(`${BASE}/api/menu/items/add`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        sectionId: section.id,
        item: {
          id: customItemId,
          name: "آیتم تست خودکار",
          description: "",
          price: 99,
          image: "/assets/images/a-cup-espresso.png",
        },
      }),
    });
    res.ok ? pass("19 add custom item", customItemId) : fail("19 add custom item");
  }
  {
    const res = await fetch(`${BASE}/api/menu/items/delete`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId: section.id, itemId: customItemId }),
    });
    res.ok ? pass("20 delete custom item") : fail("20 delete custom item");
  }

  // bonus: wrong password rejected
  {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "wrong-password" }),
    });
    const body = await res.json();
    !body.success
      ? pass("21 wrong password rejected")
      : fail("21 wrong password rejected");
  }

  // bonus: public still has expected sections after tests
  {
    const { body } = await json("/api/menu/public");
    body.sections?.length >= 7
      ? pass("22 public menu stable", `${body.sections.length} sections`)
      : fail("22 public menu stable", JSON.stringify(body?.sections?.map((s) => s.title)));
  }

  const failed = results.filter((r) => !r.ok);
  console.log("\n────────────────────────");
  console.log(`Total: ${results.length} | Passed: ${results.length - failed.length} | Failed: ${failed.length}`);
  if (failed.length) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
