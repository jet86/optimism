import React from 'react'
import { ethers, Contract } from 'ethers'
import getBlockchain from '../../services/ethereum'
import './ProposalCard.css'

class ProposalCard extends React.Component {
	constructor(props) {
		super(props)
		this.state = { proposal: null, state: '', actions: null, show: false }
	}

	getProposal = async (i) => {
		const proposalStates = [
			'Pending',
			'Active',
			'Canceled',
			'Defeated',
			'Succeeded',
			'Queued',
			'Expired',
			'Executed',
		]
		const GovernorBravo = this.props.GovernorBravo
		const proposal = await GovernorBravo.proposals(i)
		const index = await GovernorBravo.state(i)
		const actions = await GovernorBravo.getActions(i)
		this.setState({ state: proposalStates[index] })
		this.setState({ proposal })
		this.setState({ actions })
		console.log(proposal)
	}

	async componentDidMount() {
		await this.getProposal(this.props.id)
	}

	makeSymbol(state) {
		switch (state) {
			case 'Pending':
				return <p>&#8230;</p>
			case 'Active':
				return <p>Active</p>
			case 'Canceled':
				return <p>&#10006;</p>
			case 'Defeated':
				return <p>&#9760;</p>
			case 'Succeeded':
				return <p>&#10004;</p>
			case 'Queued':
				return <p>Queued</p>
			case 'Expired':
				return <p>Expired</p>
			case 'Executed':
				return <p>&#10004;</p>
		}
	}

	getVotingStatus() {
		const { forVotes, againstVotes } = this.state.proposal
	}

	handleShow() {
		this.setState({ show: !this.state.show })
	}

	async vote(vote) {
		const GovernorBravo = this.props.GovernorBravo
		await GovernorBravo.castVote(this.props.id, vote)
	}

	render() {
		if (this.state.actions !== null) {
			const {
				abstainVotes,
				againstVotes,
				canceled,
				endBlock,
				eta,
				executed,
				forVotes,
				id,
				proposer,
				startBlock,
			} = this.state.proposal
			const state = this.state.state
			const { signatures, calldatas, targets } = this.state.actions
			return (
				<>
					<div className="proposal-card">
						<div className="proposal-content">
							<div className="proposal-title">Threshold to 65,000 BOBA</div>
							<div className="proposal-details">
								<div className="proposal-voting-state">
									For Votes:{forVotes.toString()}
								</div>
								<div className="proposal-text-details">
									<span>{id.toString()}</span>
									<span> • </span>
									<span>Date</span>
								</div>
							</div>
						</div>
						<div className="proposal-state" onClick={() => this.handleShow()}>
							{this.makeSymbol(state)}
						</div>
					</div>

					{this.state.show ? (
						<>
							<div className="modal">
								<div className="castVotes">
									<h2>Cast Vote</h2>
									<button className="forVotes" onClick={() => this.vote(1)}>
										For
									</button>
									<button className="againstVotes" onClick={() => this.vote(0)}>
										Against
									</button>
									<button className="abstain" onClick={() => this.vote(2)}>
										Abstain
									</button>
									<button className="close" onClick={() => this.handleShow()}>
										x
									</button>
								</div>
							</div>
							<div className="tint" />
						</>
					) : null}
				</>
			)
		}
		return null
	}
}

export default ProposalCard
