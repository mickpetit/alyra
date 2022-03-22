# TP1 - Voting

## Context
This workspace area define project to validate "solidity development" chapter on Alyra formation.

We need to develop a smart contract for voting people in small or medium organizations. Voting people are represented by their ethereum addresses and can register proposals for voting session.
Main features are:
- Vote is not secret.
- Each voter can see others votes.
- Proposal winning is selected by the biggest vote counting.

The workflow need to be the following:
1. Administrator save an access list of voter identified by their ethereum address.
2. Administrator start the proposals submission session.
3. Voters allowed can registers theirs proposals.
4. Administrator end the proposals submission session.
5. Administrator start the voting session.
   6.Voters allowed can vote for a proposal.
7. Administrator end the voting session.
8. Administrator tallies votes.
9. People can see winning proposal.

Requirements:
- Your smart contract name is "Voting".
- Your smart contract must use last compilator version.
- Administrator is the contract owner.
- Your smart contract must define Voter and Proposal structs as following:
```
struct Voter {
   bool isRegistered;
   bool hasVoted;
   uint votedProposalId;
}
struct Proposal {
   string description;
   uint voteCount;
}
```
- Your smart contract must define workflow as following:
```
enum WorkflowStatus {
   RegisteringVoters,
   ProposalsRegistrationStarted,
   ProposalsRegistrationEnded,
   VotingSessionStarted,
   VotingSessionEnded,
   VotesTallied
}
```
- You must define a uint "winningProposalId" or a "getWinner" function.
- You must use "ownable" library of openzeppelin.
- Your smart contract must define those events:
```
event VoterRegistered(address voterAddress); 
event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
event ProposalRegistered(uint proposalId);
event Voted (address voter, uint proposalId);
```

## FYI

This project is implemented to **demonstrate and respect features approach in lessons**.

**It's not an optimal implementation for organization -;)**

Smart contracts are defined as following:
- Interfaces are prefixed with "I" letter
- Main smart contract is "Voting.sol"
- Code is splitted into some contracts to factorize some reusables notions into another futures contracts.



## Allowable feature
The feature is named to be compliant with new best practices to stopping used 
"black / grey or white" list.

Features are:
- Add or remove addresses into list.
- Defined and restrict access to allowed or unauthorized addresses only.
- Manage list by an administrator.

## Proposables list feature
Define and keep proposable into a list. Features are:
- Manage list by an administrator.
- CRUD for proposals.
- Restrict some actions to proposal author only (update / remove).
- Update voters counter foreach proposals.

## Winnables proposals list feature
Extend proposables list by new voting features.

- Voting for a previous proposal defined
- Restrict one vote per address
- Process vote counting to retrieve the first proposal with the biggest vote counter.

These uses cases are covered:
- No proposal: no winner return after counting process
- No voter: no winner return after counting process
- Many proposals with same vote counter: return the first proposal submitted to encourage quicker submitters. 

## Voting: the main contract
This contract is the entry point of this TP. It defined all workflow process and
restrictions about session.

Contract owner must call 'init' function first to initialize all internal variables with default values.
Many events are sent after specific actions:
- VoterRegistered: emitted after new voter registered
- VoterUnregistered: emitted after voter marked as unregistered
- WorkflowStatusChange: emitted after new internal workflow state save;
- ProposalRegistered: emitted on new proposal register
- Voted: emitted on new vote saved
- ProposalWinning: emitted on new proposal winning found
- NoProposalWinning: emitted when no proposal found

Some extra events are defined:
- AddressAllowed: emitted on new address added into the allowed addresses list
- AddressUnauthorized: emitted on address removed into the allowed addresses list

After voting session ended, winning data is stored into an internal history.
Those parameters are defined as public to be easily accessible.

## How to start this Smart Contract
Deploy the smart contract "Voting" and call the external "init" function with same address.
It will enable all internal parameters with defaults values.
