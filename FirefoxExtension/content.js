document.addEventListener("mouseup", async () => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (!selectedText || selectedText.length == 0) {
    return;
  }

  const result = await browser.runtime.sendMessage({ text: selectedText });
  if (result == null) {
    return;
  }

  await showPopup(selection, result);
});

async function showPopup(selection, result) {
  const old = document.getElementById("currency-popup");
  if (old) old.remove();

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const popup = document.createElement("div");
  popup.id = "currency-popup";

  if (result.currency in currencyMap) {
    popup.textContent = currencyMap[result.currency];
  } else {
    popup.textContent = "$";
  }

  popup.style.position = "absolute";
  popup.style.left = `${rect.right + window.scrollX}px`;
  popup.style.top = `${rect.top - rect.height + window.scrollY}px`;
  popup.style.width = "auto";
  popup.style.height = "auto";
  popup.style.padding = "0px 8px";
  popup.style.background = "#ffd700";
  popup.style.color = "#000";
  popup.style.textAlign = "center";
  popup.style.zIndex = 9999;

  const resultString = `${result.amount.toFixed(2)} ${result.currency}`;
  const { fastShow } = await browser.storage.local.get("fastShow");

  if (fastShow) {
    popup.textContent = resultString;
  } else {
    popup.style.cursor = "pointer";
    popup.addEventListener("click", (event) => {
      event.stopPropagation(); // prevent closing when clicking inside
      popup.textContent = resultString;
    });
  }

  document.body.appendChild(popup);

  // Add a one-time click listener to the document
  const outsideClickListener = (event) => {
    if (!popup.contains(event.target)) {
      popup.remove();
      document.removeEventListener("click", outsideClickListener);
    }
  };

  document.addEventListener("click", outsideClickListener);
}
