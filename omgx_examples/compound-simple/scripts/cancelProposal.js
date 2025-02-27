const {ethers} = require('ethers');
const Timelock = require('../build-ovm/Timelock.json');
const GovernorBravoDelegate = require('../build-ovm/GovernorBravoDelegate.json');
const GovernorBravoDelegator = require('../build-ovm/GovernorBravoDelegator.json');
const Comp = require('../build-ovm/Comp.json');
const addresses = require('../networks/rinkeby-l2.json');
const BigNumber = require('bignumber.js');
require('dotenv').config();

const env = process.env;
const DECIMALS  = BigInt(10**18);

const compAddress = addresses.Comp;
const timelockAddress = addresses.Timelock;
const governorBravoDelegateAddress = addresses.GovernorBravoDelegate;
const governorBravoDelegatorAddress = addresses.GovernorBravoDelegator;


async function main(){

    const l2_provider = new ethers.providers.JsonRpcProvider(env.L2_NODE_WEB3_URL, { chainId: 28 });

    const wallet1 = new ethers.Wallet(env.pk_0, l2_provider);

    const governorBravoDelegate = new ethers.Contract(governorBravoDelegateAddress , GovernorBravoDelegate.abi , wallet1);

    const governorBravoDelegator = new ethers.Contract(governorBravoDelegatorAddress, GovernorBravoDelegator.abi, wallet1);

    const governorBravo = await governorBravoDelegate.attach(
        governorBravoDelegator.address
    );

    const proposalID = 2; // proposal to cancel
    await governorBravo.cancel(proposalID);
    return;
}

(async () =>{
    try {
        await main();
    } catch (error) {
        console.log(error)
    }
})();