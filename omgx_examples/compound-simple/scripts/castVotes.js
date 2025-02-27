const {ethers} = require('ethers');
const Timelock = require('../build-ovm/Timelock.json');
const GovernorBravoDelegate = require('../build-ovm/GovernorBravoDelegate.json');
const GovernorBravoDelegator = require('../build-ovm/GovernorBravoDelegator.json');
const Comp = require('../build-ovm/Comp.json');
const addresses = require('../networks/rinkeby-l2.json');
const BigNumber = require('bignumber.js');
require('dotenv').config();

const env = process.env;

const compAddress = addresses.Comp;
const timelockAddress = addresses.Timelock;
const governorBravoDelegateAddress = addresses.GovernorBravoDelegate;
const governorBravoDelegatorAddress = addresses.GovernorBravoDelegator;


const sleep = async (timeout) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve()
		}, timeout)
	});
}


async function main(){

    const l2_provider = new ethers.providers.JsonRpcProvider(env.L2_NODE_WEB3_URL, { chainId: 28 });

    const wallet1 = new ethers.Wallet(env.pk_0, l2_provider);
    const wallet2 = new ethers.Wallet(env.pk_1, l2_provider);
    const wallet3 = new ethers.Wallet(env.pk_2, l2_provider);

    const governorBravoDelegate = new ethers.Contract(governorBravoDelegateAddress , GovernorBravoDelegate.abi , wallet1);
    const timelock = new ethers.Contract(timelockAddress, Timelock.abi, wallet1);

    const governorBravoDelegator = new ethers.Contract(governorBravoDelegatorAddress, GovernorBravoDelegator.abi, wallet1);

    const comp = new ethers.Contract(compAddress, Comp.abi, wallet1);

    const governorBravo = await governorBravoDelegate.attach(
        governorBravoDelegator.address
    );



    const proposalStates = [
        'Pending',
        'Active',
        'Canceled',
        'Defeated',
        'Succeeded',
        'Queued',
        'Expired',
        'Executed',
    ];

    const proposalID = (await governorBravo.proposalCount())._hex;
    console.log(`Proposed. Proposal ID: ${proposalID}`);

    let state = await governorBravo.state(proposalID);
    console.log(`State of Proposal ${proposalID} is : ${proposalStates[state]}`);

    console.log(`Casting Votes`);
    for(let i = 0; i < 30; i++){
        console.log(`Attempt: ${i + 1}`);
        state = await governorBravo.state(proposalID);
        console.log(`\tState of Proposal ${proposalID} is : ${proposalStates[state]}`);
        try{
            await governorBravo.castVote(proposalID, 1);
            console.log('\tSuccess: vote cast by wallet1');
            await sleep(5 * 1000);
            await governorBravo.connect(wallet2).castVote(proposalID, 1);
            console.log('\tSuccess: vote cast by wallet2');
            await sleep(5 * 1000);
            await governorBravo.connect(wallet3).castVote(proposalID, 1);
            console.log('\tSuccess: vote cast by wallet3');
            break;
        }catch(error){
            if(i == 29){
                await governorBravo.cancel(proposalID);
                console.log(`\tProposal failed and has been canceled, please try again`);
                console.log(error);
                return;
            }
            // console.log(error)
            console.log("\tVoting is closed\n");
        }
        await sleep(15 * 1000);
    }
    console.log(`Waiting for voting period to end.`);
    await sleep(150 * 1000);
}

(async () =>{
    try {
        await main();
    } catch (error) {
        console.log(error)
    }
})();