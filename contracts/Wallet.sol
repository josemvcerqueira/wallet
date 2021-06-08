// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Wallet {
    address[] public approvers;
    uint256 public quorum;
    struct Transfer {
        uint256 id;
        uint256 amount;
        address payable to;
        uint256 approvals;
        bool sent;
    }

    Transfer[] transfers;
    mapping(address => mapping(uint256 => bool)) approvals;

    constructor(address[] memory _approvers, uint256 _quorum) {
        approvers = _approvers;
        quorum = _quorum;
    }

    function getApprovers() external view returns (address[] memory) {
        return approvers;
    }

    function getTransfers() external view returns (Transfer[] memory) {
        return transfers;
    }

    function createTransfer(uint256 amount, address payable to)
        external
        onlyApprover()
    {
        transfers.push(Transfer(transfers.length, amount, to, 0, false));
    }

    function approveTransfer(uint256 id) external onlyApprover() {
        require(transfers[id].sent == false, "transfer has already been sent");
        require(
            !approvals[msg.sender][id],
            "cannot approve a transfer that has already been approved"
        );

        approvals[msg.sender][id] = true;
        transfers[id].approvals++;

        if (transfers[id].approvals >= quorum) {
            transfers[id].sent = true;
            address payable to = transfers[id].to;
            uint256 amount = transfers[id].amount;
            to.transfer(amount);
        }
    }

    receive() external payable {}

    modifier onlyApprover() {
        bool allowed;
        for (uint256 i; i < approvers.length; i++) {
            if (approvers[i] == msg.sender) {
                allowed = true;
            }
        }
        require(allowed, "only approvers are allowed");
        _;
    }
}