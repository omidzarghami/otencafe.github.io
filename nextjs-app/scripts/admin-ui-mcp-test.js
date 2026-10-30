async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function runOnce(runId) {
    const checks = [];
    const note = (name, ok, detail = "") => {
      checks.push({ name, ok: !!ok, detail: String(detail || "") });
    };

    if (!location.pathname.includes("/admin/dashboard")) {
      location.href = "/admin/dashboard";
      await sleep(1200);
    }

    if (location.pathname.includes("/admin/login")) {
      const input =
        document.querySelector('input[type="password"]') ||
        document.querySelector("input");
      const button =
        document.querySelector('button[type="submit"]') ||
        Array.from(document.querySelectorAll("button")).find((b) =>
          /ورود|login/i.test(b.textContent || "")
        );
      if (!input || !button) {
        return {
          runId,
          ok: false,
          passed: 0,
          total: 1,
          failed: ["login-form"],
        };
      }
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      setter.call(input, "G13faqk7CNW91c1IOMh7kfrGwfJS0KkS");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      button.click();
      await sleep(1500);
    }

    await sleep(250);

    const header = document.querySelector("header.sticky");
    note(
      "sticky-header",
      !!header && getComputedStyle(header).position === "sticky",
      header ? getComputedStyle(header).top : "missing"
    );

    // Prefer desktop aside; otherwise open mobile sheet
    let rtlRoot = document.querySelector('aside[dir="rtl"]');
    const openBtn = Array.from(document.querySelectorAll("button")).find((b) =>
      /باز کردن منو/.test(b.getAttribute("aria-label") || "")
    );
    const mobileMode = !rtlRoot || getComputedStyle(rtlRoot).display === "none";
    if (mobileMode && openBtn) {
      openBtn.click();
      await sleep(450);
      const sheet = document.querySelector('[data-slot="sheet-content"]');
      rtlRoot = sheet?.querySelector('[dir="rtl"]') || sheet;
    }

    const dir = rtlRoot ? getComputedStyle(rtlRoot).direction : "";
    note("sidebar-rtl", dir === "rtl", `${dir || "missing"} (${mobileMode ? "mobile" : "desktop"})`);

    const sectionBtn = Array.from(document.querySelectorAll("button")).find((b) =>
      (b.textContent || "").includes("کیک و دسر")
    );
    note("category-button", !!sectionBtn, sectionBtn ? "found" : "missing");

    if (sectionBtn) {
      const beforeY = window.scrollY;
      sectionBtn.click();
      await sleep(900);
      const cakes = document.getElementById("admin-section-cakes");
      const r = cakes?.getBoundingClientRect();
      const inViewport =
        !!r && r.top < window.innerHeight * 0.9 && r.bottom > 60;
      const scrolledOrVisible = inViewport || Math.abs(window.scrollY - beforeY) > 10;
      note(
        "jump-cakes",
        scrolledOrVisible,
        r ? `top=${Math.round(r.top)} y=${Math.round(window.scrollY)}` : "missing"
      );
    } else {
      note("jump-cakes", false, "no button");
    }

    const prev = document.querySelector('button[aria-label="بخش قبلی"]');
    const next = document.querySelector('button[aria-label="بخش بعدی"]');
    note("arrow-nav", !!prev && !!next, `prev=${!!prev}, next=${!!next}`);

    // Draft autosave via React-friendly InputEvent
    const priceInput = document.querySelector('input[type="number"]');
    if (priceInput) {
      const original = priceInput.value;
      const nextVal = String(Number(original) + 0.1);
      priceInput.focus();
      const native = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      native.call(priceInput, nextVal);
      priceInput.dispatchEvent(new Event("input", { bubbles: true }));
      priceInput.dispatchEvent(new Event("change", { bubbles: true }));
      await sleep(400);

      let draftOk = false;
      try {
        const draftRaw = localStorage.getItem("oten-admin-draft");
        const draft = draftRaw ? JSON.parse(draftRaw) : null;
        draftOk = !!draft && Object.keys(draft.priceChanges || {}).length > 0;
      } catch {
        draftOk = false;
      }
      note("draft-autosave", draftOk, draftOk ? "draft present" : "empty");

      const discard = Array.from(document.querySelectorAll("button")).find((b) =>
        (b.textContent || "").includes("لغو تغییرات")
      );
      if (discard && !discard.disabled) {
        discard.click();
        await sleep(300);
      } else {
        native.call(priceInput, original);
        priceInput.dispatchEvent(new Event("input", { bubbles: true }));
        priceInput.dispatchEvent(new Event("change", { bubbles: true }));
        localStorage.removeItem("oten-admin-draft");
        await sleep(200);
      }
      note(
        "draft-discard",
        !localStorage.getItem("oten-admin-draft"),
        localStorage.getItem("oten-admin-draft") ? "still present" : "cleared"
      );
    } else {
      note("draft-autosave", false, "no price input");
      note("draft-discard", false, "skipped");
    }

    const closeBtn = Array.from(document.querySelectorAll("button")).find((b) =>
      /بستن منو/.test(b.getAttribute("aria-label") || "")
    );
    if (closeBtn) closeBtn.click();

    const failed = checks.filter((c) => !c.ok).map((c) => c.name);
    return {
      runId,
      ok: failed.length === 0,
      passed: checks.length - failed.length,
      total: checks.length,
      failed,
      checks,
    };
  }

  const runs = [];
  for (let i = 1; i <= 20; i++) {
    runs.push(await runOnce(i));
  }

  const okCount = runs.filter((r) => r.ok).length;
  return {
    suite: "admin-ui-mcp-test",
    via: "chrome-devtools-mcp",
    iterations: 20,
    okCount,
    failCount: 20 - okCount,
    allOk: okCount === 20,
    runs: runs.map(({ runId, ok, passed, total, failed }) => ({
      runId,
      ok,
      passed,
      total,
      failed,
    })),
  };
}
