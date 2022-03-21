# TP1 - Voting

Smart contracts are defined as following:
- Interfaces are prefixed with "I" letter
- Main smart contract is "Voting.sol"
- Code is splitted into some contracts to factorize some reusables notions into another futures contracts.

## Allowable notion
The feature is named to be compliant with new best practices to stopping used 
"black / grey or white" list.

Features are:
- Add or remove addresses into list.
- Defined and restrict access to allowed or unauthorized addresses only.
- Manage list by an administrator.

## Proposables list notion
Define and keep proposable into a list. Features are:
- Manage list by an administrator.
- CRUD for proposals.
- Restrict some actions to proposal author only (update / remove).
- Update voters counter foreach proposals.

## Winnables proposals list notion
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
- AddressUnauthorized: emmited on address removed into the allowed addresses list

After voting session ended, winning data is stored into an internal history.
Those parameters are defined as public to be easily accessible.

