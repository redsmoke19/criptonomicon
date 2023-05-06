const API_KEY =
  "d0d2b450ed0585a7275d54ec60888d493bdacafe3daa0be679882db85e2cdc1c";

export const loadTicker = (tickerName) => {
  return fetch(
    `https://min-api.cryptocompare.com/data/price?fsym=${tickerName}&tsyms=USD&api_key=${API_KEY}`
  ).then((res) => res.json());
};
