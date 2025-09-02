// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.7.6;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

import "./SlidingWindowOracle.sol";

contract ObservableOracle is SlidingWindowOracle, AccessControl {
    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");

    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msg.sender), "ObservableOracle: NOT_AUTHORIZED");
        _;
    }

    constructor(
        address factory_,
        uint windowSize_,
        uint8 granularity_
    ) SlidingWindowOracle(factory_, windowSize_, granularity_) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function update(
        address tokenA,
        address tokenB
    ) public override onlyRole(KEEPER_ROLE) {
        super.update(tokenA, tokenB);
    }
}
