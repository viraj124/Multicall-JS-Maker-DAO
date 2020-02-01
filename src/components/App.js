import React, { Component } from 'react';
import eth from './web3';
import './App.css';

const ethers = require('ethers')
const utils = ethers.utils

const add = {}
add["MULTICALL"] = "0x2cc8688c5f75e365aaeeb4ea8d6a480405a48d2a"
add["CDAI"] = "0xe7bc397dbd069fc7d0109c0636d06888bb50668c"
add["Comptroller"] = "0x1f5d7f3caac149fe41b8bd62a3673fe6ec0ab73b"

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
const cdai = build(add.CDAI, "cdai")
const comptroller = build(add.Comptroller, "comptroller")
const myAddress = "0xc19c5f0ecf68be63937cd1e9a43b4b4b19629c0f"
window.utils = utils
window.cdai = cdai
window.multi = multi
window.comptroller = comptroller


class App extends Component {
  async componentWillMount() {
    this.all()
  }
  //This is for all read function of CDAI, as you kn ow all CTOKEN read functions return only one parameter, but if there are mutiple params returned we would need to use the decode function in the utils library(Just an FYI)
  all = async () => {
    let p1 = multi.aggregate([
      [add.CDAI, cdai.interface.functions.getCash.encode([])],
      [add.CDAI, cdai.interface.functions.totalBorrowsCurrent.encode([])],
      [add.CDAI, cdai.interface.functions.borrowBalanceCurrent.encode([myAddress])],
      [add.CDAI, cdai.interface.functions.borrowRatePerBlock.encode([])],
      [add.CDAI, cdai.interface.functions.totalSupply.encode([])],
      [add.CDAI, cdai.interface.functions.balanceOfUnderlying.encode([myAddress])],
      [add.CDAI, cdai.interface.functions.supplyRatePerBlock.encode([])],
      [add.CDAI, cdai.interface.functions.totalReserves.encode([])],
      [add.CDAI, cdai.interface.functions.reserveFactorMantissa.encode([])],
      [add.Comptroller, comptroller.interface.functions.getAccountLiquidity.encode([myAddress])]
    ])
    let [res] = await Promise.all([p1])
    res = res[1]
    console.log("GET_CASH", utils.formatUnits(res[0], 9))
    console.log("TOTAL_BORROWS", utils.formatUnits(res[1], 9))
    console.log("BORROW_BALANCE_CURRENT", utils.formatUnits(res[2], 9))
    console.log("BORROW_RATE", utils.formatUnits(res[3], 9))
    console.log("TOTAL_SUPPLY", utils.formatUnits(res[4], 9))
    console.log("BALANCE_UNDERLYING", utils.formatUnits(res[5], 9))
    console.log("SUPPLY_RATE", utils.formatUnits(res[6], 9))
    console.log("TOTAL_RESERVE", utils.formatUnits(res[7], 9))
    console.log("RESERVE_FACTOR", utils.formatUnits(res[8], 9))
    //Using the COMPTROLLER GET FUNCTIONS FOR SHOWING MULTI PARAM GETTING RETURNED FROM READ FUNCTION
    const decodeResult = comptroller.interface.functions.getAccountLiquidity.decode(res[9])
    console.log("LIQUIDITY", utils.formatUnits(decodeResult[1], 9))
    console.log("SHORTFALL", utils.formatUnits(decodeResult[2], 9))
  }


  render() {
    return (
      <div>
        Multicall JS
      </div>
    );
  }
}

export default App;
