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

  showPopup(selection, result);
});

function showPopup(selection, result) {
  // Remove old popup
  const old = document.getElementById("currency-popup");
  if (old) old.remove();

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const popup = document.createElement("div");
  popup.id = "currency-popup";
  popup.textContent = "$";
  popup.style.position = "absolute";
  popup.style.left = `${rect.right + window.scrollX}px`;
  popup.style.top = `${rect.top - rect.height + window.scrollY}px`;
  popup.style.width = "20px";
  popup.style.height = "20px";
  popup.style.background = "#ffd700";
  popup.style.color = "#000";
  popup.style.textAlign = "center";
  popup.style.cursor = "pointer";
  popup.style.zIndex = 9999;

  popup.addEventListener("click", (event) => {
    event.stopPropagation(); // prevent closing when clicking inside
    popup.textContent = `${result.amount.toFixed(2)} ${result.currency}`;
    popup.style.width = "auto";
    popup.style.padding = "0px 4px";
  });

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
