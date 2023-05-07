const API_KEY =
  "d0d2b450ed0585a7275d54ec60888d493bdacafe3daa0be679882db85e2cdc1c";

const tickersHandles = new Map();
const loadTickers = () => {
  if (tickersHandles.size === 0) {
    return;
  }

  return fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandles.keys(),
    ].join(",")}&tsyms=USD&api_key=${API_KEY}`
  )
    .then((res) => res.json())
    .then((rawData) => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );

      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handler = tickersHandles.get(currency) ?? [];
        handler.forEach((fn) => fn(newPrice));
      });
    });
};

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandles.get(ticker) || [];
  tickersHandles.set(ticker, [...subscribers, cb]);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandles.delete(ticker);
};

setInterval(loadTickers, 5000);

window.tickers = tickersHandles;
