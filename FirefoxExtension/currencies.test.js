const {parseMoney} = require("./currencies");

test("parse", () => {
    expect(parseMoney("123$")).toEqual({amount: 123, currency: "USD"});
    expect(parseMoney("123.00$")).toEqual({amount: 123, currency: "USD"});
    expect(parseMoney("123.45$")).toEqual({amount: 123.45, currency: "USD"});
    expect(parseMoney("123.45 $")).toEqual({amount: 123.45, currency: "USD"});
    expect(parseMoney("$123.45")).toEqual({amount: 123.45, currency: "USD"});
    expect(parseMoney("USD 123.45")).toEqual({amount: 123.45, currency: "USD"});
    expect(parseMoney("USD,,, 123.45")).toEqual({amount: 123.45, currency: "USD"});
    expect(parseMoney("zxc 123.45 $")).toEqual({amount: 123.45, currency: "USD"});
    expect(parseMoney("123.45 USD")).toEqual({amount: 123.45, currency: "USD"});
    expect(parseMoney("123.45 ,,,,USD")).toEqual({amount: 123.45, currency: "USD"});
    expect(parseMoney("123.45 ,,,,USD $")).toEqual({amount: 123.45, currency: "USD"});
    expect(parseMoney("123,456$")).toEqual({amount: 123456, currency: "USD"});
    expect(parseMoney("123,456 $")).toEqual({amount: 123456, currency: "USD"});
    expect(parseMoney("123,456.00 $")).toEqual({amount: 123456, currency: "USD"});
    expect(parseMoney("123456.00 $")).toEqual({amount: 123456, currency: "USD"});
    expect(parseMoney("123,456,789 $")).toEqual({amount: 123456789, currency: "USD"});
    expect(parseMoney("123,456,789.00 $")).toEqual({amount: 123456789, currency: "USD"});
    expect(parseMoney("123,456,789.54 $")).toEqual({amount: 123456789.54, currency: "USD"});
    expect(parseMoney("123,45 EUR")).toEqual({amount: 12345, currency: "EUR"});
});