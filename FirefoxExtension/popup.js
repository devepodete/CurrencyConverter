const select = document.getElementById("targetCurrency");
const fastShowCheckbox = document.getElementById("fastShow");

browser.storage.local.set({ targetCurrency: "USD" });

// Save currency when changed
select.addEventListener("change", () => {
  browser.storage.local.set({ targetCurrency: select.value });
});

// Save fastShow when toggled
fastShowCheckbox.addEventListener("change", () => {
  browser.storage.local.set({ fastShow: fastShowCheckbox.checked });
});

// Load saved settings when popup opens
browser.storage.local.get(["targetCurrency", "fastShow"]).then((result) => {
  if (result.targetCurrency) {
    select.value = result.targetCurrency;
  }
  if (typeof result.fastShow !== "undefined") {
    fastShowCheckbox.checked = result.fastShow;
  }
});
