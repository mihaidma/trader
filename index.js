
const ccxt = require('ccxt/ccxt.js')
const exchangeNames = [
  'kraken',
  'cex',
  'bitfinex'
]
const exchangeInstances = {}
const symbol = 'ETH/USD'

const sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms))

function printTicker (name, ticker) {
  console.log(symbol, 'ticker',
    ticker['datetime'],
    'bid: ' + ticker['bid'],
    'ask: ' + ticker['ask'],
    'volume: ' + ticker['quoteVolume'],
    name
  )
}

exchangeNames.forEach((name) => {
  exchangeInstances[name] = {
    name: name,
    instance: ccxt[name](),
    tickers: {}
  }
})

const fetchTicker = async (name) => {
  const exchange = exchangeInstances[name].instance
  const ticker = await exchange.fetchTicker(symbol)
  exchangeInstances[name].tickers[symbol] = ticker
  // await sleep(exchange.rateLimit)
  printTicker(name, ticker)

  return ticker
}

function fetchTickers() {
  return Promise.all(exchangeNames.map(value => fetchTicker(value)))
}

fetchTickers().then(() => {
  for (let i=0; i < exchangeNames.length; i++) {
    const referenceName = exchangeNames[i]
    const referenceExchange = exchangeInstances[referenceName].tickers[symbol]
    for (let j = i+1; j < exchangeNames.length; j++) {
      const comparisonName = exchangeNames[j]
      const comparisonExchange = exchangeInstances[comparisonName].tickers[symbol]
        if (referenceExchange.ask < comparisonExchange.bid) {
          console.log('arbitrage opportunity: ', symbol)
          console.log(referenceName, ' BUY ', referenceExchange.ask)
          console.log(comparisonName, ' SELL ', comparisonExchange.bid)
          console.log('gain $: ', comparisonExchange.bid - referenceExchange.ask)
          console.log('gain %: ', comparisonExchange.bid / referenceExchange.ask - 1)
        }
        else if (comparisonExchange.ask < referenceExchange.bid) {
          console.log('arbitrage opportunity: ', symbol)
          console.log(comparisonName, ' BUY ', comparisonExchange.ask)
          console.log(referenceName, ' SELL ', referenceExchange.bid)
          console.log('gain $: ', referenceExchange.bid - comparisonExchange.ask)
          console.log('gain %: ', referenceExchange.bid / comparisonExchange.ask - 1)
        }
    }
  }
  console.log('end')
})
