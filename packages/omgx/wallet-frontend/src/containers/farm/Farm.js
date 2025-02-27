/*
  Utility Functions for OMG Plasma
  Copyright (C) 2021 Enya Inc. Palo Alto, CA

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import React from 'react';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';

import { getFarmInfo, getFee } from 'actions/farmAction'
import { openError } from 'actions/uiAction';

import ListFarm from 'components/listFarm/listFarm'
import networkService from 'services/networkService'

import * as styles from './Farm.module.scss'

class Farm extends React.Component {

  constructor(props) {

    super(props);

    const {
      totalFeeRate,
      userRewardFeeRate,
      poolInfo,
      userInfo,
    } = this.props.farm;

    const {
      layer1,
      layer2
    } = this.props.balance;

    this.state = {
      totalFeeRate,
      userRewardFeeRate,
      poolInfo,
      userInfo,
      layer1,
      layer2
    }

  }

  componentDidMount() {

    const { totalFeeRate, userRewardFeeRate } = this.props.farm;

    if (!totalFeeRate || !userRewardFeeRate) {
      this.props.dispatch(getFee());
    }

    this.props.dispatch(getFarmInfo());

    if (networkService.masterSystemConfig === 'mainnet') {
      this.props.dispatch(openError(`You are using Mainnet Beta.
        WARNING: the mainnet smart contracts are not fully audited and funds may
        be at risk. Please exercise caution when using mainnet beta.`
      ))
    }
  }

  componentDidUpdate(prevState) {

    const {
      totalFeeRate,
      userRewardFeeRate,
      poolInfo,
      userInfo,
    } = this.props.farm

    const {
      layer1,
      layer2
    } = this.props.balance

    if (prevState.farm.totalFeeRate !== totalFeeRate) {
      this.setState({ totalFeeRate })
    }

    if (prevState.farm.userRewardFeeRate !== userRewardFeeRate) {
      this.setState({ userRewardFeeRate })
    }

    if (!isEqual(prevState.farm.poolInfo, poolInfo)) {
      this.setState({ poolInfo })
    }

    if (!isEqual(prevState.farm.userInfo, userInfo)) {
      this.setState({ userInfo })
    }

    if (!isEqual(prevState.balance.layer1, layer1)) {
      this.setState({ layer1 })
    }

    if (!isEqual(prevState.balance.layer2, layer2)) {
      this.setState({ layer2 })
    }

  }


  getBalance(address, chain) {

    const { layer1, layer2 } = this.state;

    if (typeof (layer1) === 'undefined') return [0, 0]
    if (typeof (layer2) === 'undefined') return [0, 0]

    if (chain === 'L1') {
      let tokens = Object.entries(layer1)
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i][1].address.toLowerCase() === address.toLowerCase()) {
          return [tokens[i][1].balance, tokens[i][1].decimals]
        }
      }
    }
    else if (chain === 'L2') {
      let tokens = Object.entries(layer2)
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i][1].address.toLowerCase() === address.toLowerCase()) {
          return [tokens[i][1].balance, tokens[i][1].decimals]
        }
      }
    }

    return [0, 0]

  }

  render() {
    const {
      // Pool
      poolInfo,
      // user
      userInfo,
    } = this.state;

    const networkLayer = networkService.L1orL2

    return (
      <div className={styles.Farm}>
        <h2>Stake tokens to the liquidity pool to earn</h2>
        <div className={styles.Note}>
          Your tokens will be deposited into the liquidity pool.
          You will share the fees collected from the swap users.
        </div>
        <div className={styles.PoolContainer}>
          <h3>L1 Liquidity Pool</h3>
          {networkLayer === 'L2' &&
            <div className={styles.NoteStrong}>
              Note: MetaMask is set to L2. To interact with the L1 liquidity pool, please switch MetaMask to L1.
            </div>
          }
          <div className={styles.TableContainer}>
            {Object.keys(poolInfo.L1LP).map((v, i) => {
              const ret = this.getBalance(v, 'L1')
              return (
                <ListFarm
                  key={i}
                  poolInfo={poolInfo.L1LP[v]}
                  userInfo={userInfo.L1LP[v]}
                  L1orL2Pool='L1LP'
                  balance={ret[0]}
                  decimals={ret[1]}
                />
              )
            })}
          </div>
        </div>
        <div className={styles.PoolContainer}>
          <h3>L2 Liquidity Pool</h3>
          {networkLayer === 'L1' &&
            <div className={styles.NoteStrong}>
              Note: MetaMask is set to L1. To interact with the L2 liquidity pool, please switch MetaMask to L2.
            </div>
          }
          <div className={styles.TableContainer}>
            {Object.keys(poolInfo.L2LP).map((v, i) => {
              const ret = this.getBalance(v, 'L2')
              return (
                <ListFarm
                  key={i}
                  poolInfo={poolInfo.L2LP[v]}
                  userInfo={userInfo.L2LP[v]}
                  L1orL2Pool='L2LP'
                  balance={ret[0]}
                  decimals={ret[1]}
                />
              )
            })}
          </div>

        </div>

      </div>
    )
  }
}

const mapStateToProps = state => ({
  farm: state.farm,
  balance: state.balance
});

export default connect(mapStateToProps)(Farm);