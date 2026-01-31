function tryExtractCurrency(text) {
    if (!text || typeof text !== "string") return null;

    const normalized = text.trim().toUpperCase();

    for (const [alpha, symbol] of Object.entries(currencyMap)) {
        if (normalized.includes(symbol) || normalized.includes(alpha)) {
            return alpha;
        }
    }

    const codeMatch = normalized.match(/\b([A-Z]{3})\b/);
    if (codeMatch) {
        return codeMatch[1];
    }

    return null;
}


function tryExtractAmount(text) {
    if (!text || typeof text !== "string") return null;

    // Extract the first number-like substring
    const matches = text.match(/[\d.,]+/g);
    if (!matches || matches.length !== 1) {
        return null;
    }

    let raw = matches[0];

    // Case 1: number contains a dot → split into integer and fractional parts
    if (raw.includes(".")) {
        const [intPartRaw, fracPartRaw] = raw.split(".");

        // Remove thousands separators (commas) from integer part
        const intPart = intPartRaw.replace(/,/g, "");

        // Keep fractional part as-is, but remove commas just in case
        const fracPart = fracPartRaw.replace(/,/g, "");

        const combined = `${intPart}.${fracPart}`;
        const amount = parseFloat(combined);
        return isNaN(amount) ? null : amount;
    } else {
        // Case 2: no dot → treat commas as thousands separators
        const intPart = raw.replace(/,/g, "");
        const amount = parseInt(intPart, 10);
        return isNaN(amount) ? null : amount;
    }
}



function parseMoney(text) {
    return {
        amount: tryExtractAmount(text),
        currency: tryExtractCurrency(text)
    };
}

function getPredefinedExchangeRates() {
    return {
        EUR: 1.0,
        USD: 1.1919
    };
}

let exchangeRates = getPredefinedExchangeRates();

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

    const targetCurrency = 'RUB';
    const convertedAmount = convertCurrency(money.currency, targetCurrency, money.amount);
    
    money.currency = targetCurrency;
    money.amount = convertedAmount;
    console.log("Converted:", money);
    if (money.amount == null || money.currency == null) {
        return Promise.resolve(null);
    }
    return Promise.resolve(money);
});
