import React, { Component } from 'react';
import eth from '../web3';
import '../App.css';


const ethers = require('ethers')
const utils = ethers.utils

const add = {}
add["MULTICALL"] = "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441"
add["UNISWAPFACTORY"] = "0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95"
add["UNISWAPDAIEXCHANGE"] = "0x2a1530c4c41db0b0b2bb646cb5eb1a67b7158667"


let provider;
if (typeof window.ethereum !== 'undefined') {
  window.ethereum.autoRefreshOnNetworkChange = false;
  provider = new ethers.providers.Web3Provider(window.ethereum);
}


const build = (address, name) => {
  return new ethers.Contract(
    address,
    require(`../../abis/${name}.json`),
    provider ? provider : eth
  );
}
const dai = "0x6b175474e89094c44da98b954eedeac495271d0f";
const multi = build(add.MULTICALL, "Multicall")
const uniswapfactory = build(add.UNISWAPFACTORY, "uinswapfactory")
const uniswapdaiexchange = build(add.UNISWAPDAIEXCHANGE, "uniswapdaiexchange")



window.utils = utils
window.multi = multi
window.uniswapfactory = uniswapfactory
window.uniswapdaiexchange = uniswapdaiexchange

class Compound extends Component {

  constructor(props) {
    super(props);
    this.state = {
      exchange: '',
      token: '',
      factory: '',
      tokens_bought: '',
      eth_sold: '',
      eth_bought: '',
      tokens_sold: ''
    }
    this.all = this.all.bind(this);
  }

  all = async (eth_sold, tokens_bought, tokens_sold, eth_bought) => {
    let p1 = multi.aggregate([
      [add.UNISWAPFACTORY, uniswapfactory.interface.functions.getExchange.encode([dai])],
      [add.UNISWAPFACTORY, uniswapfactory.interface.functions.getToken.encode([add.UNISWAPDAIEXCHANGE])],
      [add.UNISWAPDAIEXCHANGE, uniswapdaiexchange.interface.functions.factoryAddress.encode([])],
      [add.UNISWAPDAIEXCHANGE, uniswapdaiexchange.interface.functions.getEthToTokenInputPrice.encode([eth_sold])],
      [add.UNISWAPDAIEXCHANGE, uniswapdaiexchange.interface.functions.getEthToTokenOutputPrice.encode([tokens_bought])],
      [add.UNISWAPDAIEXCHANGE, uniswapdaiexchange.interface.functions.getTokenToEthInputPrice.encode([tokens_sold])],
      [add.UNISWAPDAIEXCHANGE, uniswapdaiexchange.interface.functions.getTokenToEthOutputPrice.encode([eth_bought])]
    ])
    let [res] = await Promise.all([p1])
    res = res[1]

    this.setState({
      exchange: uniswapfactory.interface.functions.getExchange.decode(res[0]),
      token: uniswapfactory.interface.functions.getToken.decode(res[1]),
      factory: uniswapdaiexchange.interface.functions.factoryAddress.decode(res[2]),
      tokens_bought: uniswapdaiexchange.interface.functions.getEthToTokenInputPrice.decode(res[3]),
      eth_sold: uniswapdaiexchange.interface.functions.getEthToTokenOutputPrice.decode(res[4]),
      eth_bought: uniswapdaiexchange.interface.functions.getTokenToEthInputPrice.decode(res[5]),
      tokens_sold: uniswapdaiexchange.interface.functions.getTokenToEthOutputPrice.decode(res[6])
      })
    console.log(this.state)
  }


  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            target="_blank"
            rel="noopener noreferrer"
          >
            Uniswap Multicall
          </a>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Uniswap Multicall</h1>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const eth_sold = this.eth_sold.value
                  const tokens_bought = this.tokens_bought.value
                  const tokens_sold = this.tokens_sold.value
                  const eth_bought = this.eth_bought.value
                  this.all(eth_sold, tokens_bought, tokens_sold, eth_bought)
                }}>
                  <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='Enter ETH Sold'
                    ref={(input) => { this.eth_sold = input }}
                  />
                   <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='Enter Tokens Brought'
                    ref={(input) => { this.tokens_bought = input }}
                  />
                    <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='Enter Tokens Sold'
                    ref={(input) => { this.tokens_sold = input }}
                  />
                   <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='Enter ETH Brought'
                    ref={(input) => { this.eth_bought = input }}
                  />
                  <input
                    type='submit'
                    className='btn btn-block btn-primary'
                    value='READ UNISWAP'
                  />
                </form>
                <h3>Exchange: {this.state.exchange.out}</h3>
                <h3>Factory: {this.state.factory.out}</h3>
                <h3>Token: {this.state.token.out}</h3>
                {/* /*<h3>Tokens Brought: {this.state.tokens_bought}</h3>
                <h3>ETH Sold: {this.state.eth_sold}</h3>
                <h3>Tokens Sold: {this.state.tokens_sold}</h3>
              <h3>ETH Brought: {this.state.eth_bought}</h3> */}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default Compound;