import React, { Component } from 'react';
import eth from './web3';
import './App.css';

const ethers = require('ethers')
const utils = ethers.utils

const add = {}
add["MULTICALL"] = "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441"
add["INSTACOMPOUND"] = "0x2699fC3753B1036534FEb3bE8704c9c5e3262606"


let provider;
if (typeof window.ethereum !== 'undefined') {
  window.ethereum.autoRefreshOnNetworkChange = false;
  provider = new ethers.providers.Web3Provider(window.ethereum);
}


const build = (address, name) => {
  return new ethers.Contract(
    address,
    require(`../abis/${name}.json`),
    provider ? provider : eth
  );
}

const multi = build(add.MULTICALL, "Multicall")
const instacompound = build(add.INSTACOMPOUND, "instacompound")
// Was Using for testing
// const myAddress = "0xa7615CD307F323172331865181DC8b80a2834324"
// const cdai = "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643"


window.utils = utils
window.multi = multi
window.instacompound = instacompound

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tokenPrice: '',
      exchangeRateCurrent: '',
      balanceOfUser: '',
      balanceOfWallet: '',
      borrowBalanceCurrentUser: '',
      borrowBalanceCurrentWallet: '',
      supplyRatePerBlock: '',
      borrowRatePerBlock: ''
    }
    this.all = this.all.bind(this);
  }

  all = async (user, ctoken) => {
    let p1 = multi.aggregate([
      [add.INSTACOMPOUND, instacompound.interface.functions.getCompTokenData.encode([user, [ctoken]])],
      [add.INSTACOMPOUND, instacompound.interface.functions.getTokenData.encode([user, ctoken])]
    ])
    let [res] = await Promise.all([p1])
    res = res[1]
    //NOTE -> Capturing Only Token Data Result in state since the output params are same
    const decodeCompTokenResult = instacompound.interface.functions.getCompTokenData.decode(res[0])
    const decodeTokenResult = instacompound.interface.functions.getTokenData.decode(res[1])
    this.setState({
      tokenPrice: utils.formatUnits(decodeTokenResult[0], 9),
      exchangeRateCurrent: utils.formatUnits(decodeTokenResult[1], 9),
      balanceOfUser: utils.formatUnits(decodeTokenResult[2], 9),
      balanceOfWallet: utils.formatUnits(decodeTokenResult[3], 9),
      borrowBalanceCurrentUser: utils.formatUnits(decodeTokenResult[4], 9),
      borrowBalanceCurrentWallet: utils.formatUnits(decodeTokenResult[5], 9),
      supplyRatePerBlock: utils.formatUnits(decodeTokenResult[6], 9),
      borrowRatePerBlock: utils.formatUnits(decodeTokenResult[7], 9)
    })
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
            InstaCompound Multicall
          </a>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Multicall</h1>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const ctoken = this.ctoken.value
                  const user = this.user.value
                  this.all(user, ctoken)
                }}>
                  <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='Enter User Address'
                    ref={(input) => { this.user = input }}
                  />
                   <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='Enter CTOKEN Address'
                    ref={(input) => { this.ctoken = input }}
                  />
                  <input
                    type='submit'
                    className='btn btn-block btn-primary'
                    value='READ CTOKEN'
                  />
                </form>
                <h3>Token Price: {this.state.tokenPrice}</h3>
                <h3>Exchange Rate: {this.state.exchangeRateCurrent}</h3>
                <h3>User Balance: {this.state.balanceOfUser}</h3>
                <h3>Wallet Balance: {this.state.balanceOfWallet}</h3>
                <h3>Borrow Balance Current: {this.state.borrowBalanceCurrentWallet}</h3>
                <h3>Wallet Balance Current: {this.state.borrowBalanceCurrentWallet}</h3>
                <h3>Supply Rate: {this.state.supplyRatePerBlock}</h3>
                <h3>Borrow Rate: {this.state.borrowRatePerBlock}</h3>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
