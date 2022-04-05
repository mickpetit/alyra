# Projet : Système de vote - Tests

Le but de ce projet est de repartir du système de vote précédemment développer (projet précédent),
et de réaliser les tests d'integrations correspondant.

## Couverture des tests

File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------|----------|----------|----------|----------|----------------|
contracts/  |      100 |      100 |      100 |      100 |                |
Voting.sol |      100 |      100 |      100 |      100 |                |
All files    |      100 |      100 |      100 |      100 |                |


Résultat :
- 105 tests passent
- 1 test échoue

1 fichier de test: test-voting.js

Contract: Voting Contract Test Suite
- Test basics
  - ✓ should be valid to test mechanism
  - ✓ should create a new contract instance (1056ms)
- Test initial state "RegisteringVoters"
  - getVoters function: check parameters and requires only
    - ✓ should require 1 parameter (342ms)
    - ✓ should require an address as parameter (471ms)
    - ✓ should reject for voter not yet added into whitelist (269ms)
  - addVoter function: insert voter into the voters list
    - ✓ should require 1 parameter
    - ✓ should require an address as parameter
    - ✓ should be restricted to owner only (1073ms)
    - ✓ should add one voter and return it (1112ms)
    - ✓ should add second voter (1089ms)
    - ✓ should add multiples voters (1067ms)
    - ✓ should not add a previously added voter
    - ✓ should emit "VoterRegistered" event
  - getVoters function: check return data
    - should return default voter data for voter not yet added
      - ✓ should contain isRegistered to be false
      - ✓ should contain hasVoted to be false
      - ✓ should contain votedProposalId to be default string
    - should return voter data for voter previously added
      - ✓ should contain isRegistered to be true
      - ✓ should contain hasVoted to be false
      - ✓ should contain votedProposalId to be default string
- Test state "ProposalsRegistrationStarted"
  - addProposal function
    - ✓ should reject for voter not yet added into whitelist (1053ms)
    - ✓ should require 1 parameter (1058ms)
    - should emit "ProposalRegistered" event
      - ✓ should emit "ProposalRegistered" event with proposalId 1
      - ✓ should emit "ProposalRegistered" event with proposalId 2
      - ✓ should emit "ProposalRegistered" event with proposalId 3
      - ✓ should allow multiple proposals from same voter (1058ms)
  - getOneProposal function
    - ✓ should reject for proposal not yet added into whitelist
    - ✓ should require 1 parameter
    - ✓ should reject negative proposal id
    - ✓ should reject proposal id out of bounds
    - should return voter data for voter previously added
      - should be a valid description response
      - ✓ should contain description to be my proposal 1 string for proposal id 0
      - ✓ should contain description to be my proposal 2 string for proposal id 1
      - ✓ should contain description to be my proposal 3 string for proposal id 2
- Test state "VotingSessionStarted"
  - setVote function
    - ✓ should reject for voter not yet added into whitelist (1032ms)
    - ✓ should require 1 parameter
    - ✓ should revert for out of proposals boundaries (negative)
    - ✓ should revert for out of proposals boundaries (positive) (1035ms)
    - ❌ should revert for out of proposals boundaries (equal proposal size)
    - ✓ should emit "Voted" event to a valid proposal for voter 1 (1061ms)
    - ✓ should emit "Voted" event to a valid proposal for voter 2 (1061ms)
    - ✓ should revert for voter who already have voted (1048ms)
    - ✓ should mark voter 1 to have voted
    - ✓ should mark voter 2 to have voted
    - ✓ should mark proposal id voted for into voter 1
    - ✓ should mark proposal id voted for into voter 2
- Test state "VotingSessionEnded"
  - tallyVotes function
    - tests for global cases
      - ✓ should restrict call to owner only (1050ms)
      - ✓ should emit "WorkflowStatusChange" event (1081ms)
      - ✓ should set the winning proposal id as public
    - tests for no voters case
      - ✓ should emit "WorkflowStatusChange" event (1051ms)
      - ✓ should set the winning proposal id as first proposal set
    - tests for equal result for 2 proposals
      - ✓ should emit "WorkflowStatusChange" event (1056ms)
      - ✓ should set the winning proposal id as first proposal set
- Test workflow mechanisms
  - Step 1: "RegisteringVoters"
    - ✓ should be initialized with "RegisteringVoters"
    - ✓ should reject "addProposal" function (1055ms)
    - ✓ should reject "endProposalsRegistering" function (1038ms)
    - ✓ should reject "startVotingSession" function (1038ms)
    - ✓ should reject "setVote" function (1027ms)
    - ✓ should reject "endVotingSession" function (1036ms)
    - ✓ should reject "tallyVotes" function (1038ms)
  - Step 2: "ProposalsRegistrationStarted"
    - ✓ should be rejected for not owner (1034ms)
    - ✓ should update internal state to "ProposalsRegistrationStarted" (1054ms)
    - ✓ should emit a "WorkflowStatusChange" status change event
    - ✓ should reject "addVoter" function (1051ms)
    - ✓ should reject "startProposalsRegistering" function (1032ms)
    - ✓ should reject "startVotingSession" function (1034ms)
    - ✓ should reject "setVote" function (1025ms)
    - ✓ should reject "endVotingSession" function (1030ms)
    - ✓ should reject "tallyVotes" function (1038ms)
  - Step 3: "endProposalsRegistering"
    - ✓ should be rejected for not owner (1028ms)
    - ✓ should update internal state to "ProposalsRegistrationEnded" (1033ms)
    - ✓ should emit a "WorkflowStatusChange" status change event
    - ✓ should reject "addVoter" function (1034ms)
    - ✓ should reject "startProposalsRegistering" function (1036ms)
    - ✓ should reject "addProposal" function (1034ms)
    - ✓ should reject "endProposalsRegistering" function (1029ms)
    - ✓ should reject "endVotingSession" function (1030ms)
    - ✓ should reject "tallyVotes" function (1037ms)
  - Step 4: "startVotingSession"
    - ✓ should be rejected for not owner (1040ms)
    - ✓ should update internal state to "VotingSessionStarted" (1038ms)
    - ✓ should emit a "WorkflowStatusChange" status change event
    - ✓ should reject "addVoter" function (1028ms)
    - ✓ should reject "startProposalsRegistering" function (1035ms)
    - ✓ should reject "addProposal" function (1031ms)
    - ✓ should reject "endProposalsRegistering" function (1036ms)
    - ✓ should reject "startVotingSession" function (1038ms)
    - ✓ should reject "tallyVotes" function (1039ms)
  - Step 4: "endVotingSession"
    - ✓ should be rejected for not owner (1027ms)
    - ✓ should update internal state to "VotingSessionEnded" (1046ms)
    - ✓ should emit a "WorkflowStatusChange" status change event
    - ✓ should reject "addVoter" function (1047ms)
    - ✓ should reject "startProposalsRegistering" function (1034ms)
    - ✓ should reject "addProposal" function (1031ms)
    - ✓ should reject "endProposalsRegistering" function (1038ms)
    - ✓ should reject "startVotingSession" function (1034ms)
    - ✓ should reject "setVote" function (1035ms)
    - ✓ should reject "endVotingSession" function (1034ms)
  - Step 5: "tallyVotes"
    - ✓ should be rejected for not owner (1035ms)
    - ✓ should update internal state to "VotingSessionEnded" (1052ms)
    - ✓ should emit a "WorkflowStatusChange" status change event
    - ✓ should reject "addVoter" function (1032ms)
    - ✓ should reject "startProposalsRegistering" function (1027ms)
    - ✓ should reject "addProposal" function (1030ms)
    - ✓ should reject "endProposalsRegistering" function (1023ms)
    - ✓ should reject "setVote" function (1038ms)
    - ✓ should reject "startVotingSession" function (1030ms)
    - ✓ should reject "endVotingSession" function (1027ms)
    - ✓ should reject "tallyVotes" function (1030ms)

  
## Test en échec :
Le test vérifiant que l'id de proposition passé en paramètre est trop permissif.
En effet, il se base sur la taille du tableau or celui-ci est indicé depuis 0.

Propositon d'amélioration :
```solidity
require(_id < proposalsArray.length, 'Proposal not found');
```
Ou : 

```solidity
require(_id <= proposalsArray.length - 1, 'Proposal not found');
```

## Axes d'amélioration
### Amélioration du comptage des votes
En faisant en sorte que l'id de la 1ère proposition soit à 1 (et non pas 0), on pourrait gérer les cas :
- d'égalité
- aucun vote
- aucune proposition pour qui voter

Dans ces 3 cas, il n'y aurait aucun vainqueur car la winningProposalId serait à 0 et donc correspondant à aucune proposition.
