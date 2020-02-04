import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom"
import './App.css';
import Compound from './Compound/compound.component'
import Uniswap from './Uniswap/uniswap.component';

class App extends Component {

  render() {
    return (
      <Router>
        <nav className="navbar navbar-inverse">
          <div className="navbar-header">
            <a className="navbar-brand"> Maker DAO Multicall</a>
          </div>
          <ul className="nav navbar-nav">
            <li className="navbar-item">
              <Link to="/compound" className="nav-link">Compound</Link>
            </li>
          </ul>
          <ul className="nav navbar-nav">
            <li className="navbar-item">
              <Link to="/uniswap" className="nav-link">Uniswap</Link>
            </li>
          </ul>
        </nav>
        <Switch>
          <Route path="/compound" exact component={Compound} />
          <Route path="/uniswap" exact component={Uniswap} />
        </Switch>
      </Router>
    );
  }
}

export default App;
