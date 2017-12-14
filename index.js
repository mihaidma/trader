
const ccxt = require('ccxt/ccxt.js')
const chalk = require('chalk')

const exchangeNames = [
  'kraken',
  'cex',
  'bitfinex'
]
const exchangeInstances = {}
const symbol = 'ETH/USD'

const sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms))

function printTicker (name, ticker) {
  console.log(chalk.green(symbol), 'ticker',
    ticker['datetime'],
    'bid: ' + chalk.green(ticker['bid']),
    'ask: ' + chalk.green(ticker['ask']),
    'volume: ' + ticker['quoteVolume'],
    chalk.green(name)
  )
}

exchangeNames.forEach((name) => {
  exchangeInstances[name] = {
    name: name,
    instance: new ccxt[name](),
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
          console.log(chalk.green('arbitrage opportunity: '), symbol)
          console.log(referenceName, ' BUY ', referenceExchange.ask)
          console.log(comparisonName, ' SELL ', comparisonExchange.bid)
          console.log('gain $: ', comparisonExchange.bid - referenceExchange.ask)
          console.log('gain %: ', comparisonExchange.bid / referenceExchange.ask - 1)
          console.log('------')
        }
        else if (comparisonExchange.ask < referenceExchange.bid) {
          console.log(chalk.green('arbitrage opportunity: '), symbol)
          console.log(comparisonName, ' BUY ', comparisonExchange.ask)
          console.log(referenceName, ' SELL ', referenceExchange.bid)
          console.log('gain $: ', referenceExchange.bid - comparisonExchange.ask)
          console.log('gain %: ', referenceExchange.bid / comparisonExchange.ask - 1)
          console.log('------')
        }
    }
  }
  console.log('end')
})
