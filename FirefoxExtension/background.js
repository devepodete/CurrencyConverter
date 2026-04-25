function getPredefinedExchangeRates() {
    return {
        EUR: 1.0,
        USD: 1.1919
    };
}

let exchangeRates = getPredefinedExchangeRates();

// default currency, can be changed in popup.js
browser.storage.local.set({ targetCurrency: "USD" });

async function tryRefreshExchangeRates() {
    try {
        const response = await fetch("https://open.er-api.com/v6/latest/EUR");
        const data = await response.json();
        const rates = data.rates;

        console.log("Fetched new data:", rates);
        exchangeRates = rates;
    } catch (error) {
        console.error("Fetch failed:", error);
    }
}

(async () => {
    await tryRefreshExchangeRates();
})();


function convertCurrency(from, to, amount) {
    if (!(from in exchangeRates)) {
        console.log("Unknown currency:", from);
        return null;
    }

    if (!(to in exchangeRates)) {
        console.log("Unknown currency:", to);
        return null;
    }

    return amount / exchangeRates[from] * exchangeRates[to];
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && /^http/.test(tab.url)) {
        browser.scripting.executeScript({
            target: { tabId: tabId },
            files: ["content.js"]
        });
    }
});


browser.runtime.onMessage.addListener(async (message, sender) => {
    console.log("Selected:", message.text);
    let money = parseMoney(message.text);
    console.log("Parsed:", money);

    if (money.amount == null || money.currency == null) {
        return Promise.resolve(null);
    }

    const { targetCurrency } = await browser.storage.local.get("targetCurrency");
    console.log("Using target currency:", targetCurrency);

    const convertedAmount = convertCurrency(money.currency, targetCurrency, money.amount);
    
    money.currency = targetCurrency;
    money.amount = convertedAmount;
    console.log("Converted:", money);
    if (money.amount == null || money.currency == null) {
        return Promise.resolve(null);
    }
    return Promise.resolve(money);
});
