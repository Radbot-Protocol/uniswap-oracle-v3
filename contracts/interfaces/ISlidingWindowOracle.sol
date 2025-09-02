// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity >=0.7.6 <0.9.0;

interface ISlidingWindowOracle {
    struct Observation {
        uint timestamp;
        uint price0Cumulative;
        uint price1Cumulative;
    }

    // View functions
    function factory() external view returns (address);

    function windowSize() external view returns (uint);

    function granularity() external view returns (uint8);

    function periodSize() external view returns (uint);

    function pairV2() external view returns (address);

    function pairObservations(
        address pair,
        uint256 index
    )
        external
        view
        returns (uint timestamp, uint price0Cumulative, uint price1Cumulative);

    // Utility functions
    function observationIndexOf(
        uint timestamp
    ) external view returns (uint8 index);

    // Core functions
    function update(address tokenA, address tokenB) external;

    function consult(
        address tokenIn,
        uint amountIn,
        address tokenOut
    ) external view returns (uint amountOut);
}
