# Oracle Observations Viewer Scripts

This directory contains scripts to view and analyze observations from the SlidingWindowOracle contract.

## Files

- `viewObservations.ts` - TypeScript script for viewing observations
- `viewObservations.js` - JavaScript script for viewing observations
- `ObservationsViewer.test.sol` - Solidity test file for comprehensive testing

## Usage

### 1. TypeScript Script

```bash
# Update the ORACLE_ADDRESS and PAIR_ADDRESS in the script first
npx hardhat run scripts/viewObservations.ts --network <network_name>
```

### 2. JavaScript Script

```bash
# Update the ORACLE_ADDRESS and PAIR_ADDRESS in the script first
node scripts/viewObservations.js
```

### 3. Solidity Test

```bash
# Run the test to view observations
npx hardhat test test/ObservationsViewer.test.sol --network <network_name>
```

## Configuration

Before running any script, update these values:

### For TypeScript/JavaScript scripts:

```typescript
const ORACLE_ADDRESS = "0x..."; // Your deployed oracle address
const PAIR_ADDRESS = "0x19efbaff6E7Fa1A0f7115249e8833b325F276002"; // The pair address to query
```

### For Solidity test:

The test uses these predefined addresses:

- Factory: `0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6`
- Token A: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- Token B: `0xbCC7F0E389638686Db5C0a3e54d11474f8c9bFC1`
- Expected Pair: `0x19efbaff6E7Fa1A0f7115249e8833b325F276002`

## What the Scripts Show

1. **Oracle Configuration**:

   - Factory address
   - Window size (e.g., 24 hours)
   - Granularity (number of observations)
   - Period size (time between observations)

2. **All Observations**:

   - Index
   - Timestamp (converted to readable date)
   - Price0 Cumulative
   - Price1 Cumulative

3. **Current State**:
   - Current observation index
   - First observation in the sliding window

## Example Output

```
🔍 Viewing Observations for Pair: 0x19efbaff6E7Fa1A0f7115249e8833b325F276002
📊 Oracle Address: 0x...
============================================================
📋 Oracle Configuration:
  Factory: 0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6
  Window Size: 86400 seconds
  Granularity: 12
  Period Size: 7200 seconds

📈 Total Observations: 12

📊 Observations:
--------------------------------------------------------------------------------
Index | Timestamp | Price0 Cumulative | Price1 Cumulative
--------------------------------------------------------------------------------
    0 | 2024-01-01T00:00:00.000Z | 1234567890123456789 | 9876543210987654321
    1 | 2024-01-01T02:00:00.000Z | 1234567890123456790 | 9876543210987654322
...

🎯 Current Observation Index: 5
⏰ Current Timestamp: 1704067200

🔄 First Observation in Window:
  Timestamp: 1704060000
  Price0 Cumulative: 1234567890123456789
  Price1 Cumulative: 9876543210987654321
```

## Troubleshooting

1. **No observations found**: Make sure the oracle has been updated for the pair
2. **Contract not found**: Verify the oracle address is correct
3. **Network issues**: Make sure you're connected to the correct network

## Testing the pairFor Function

The Solidity test also includes a test for the `pairFor` function to verify it returns the correct pair address:

```solidity
function testPairForFunction() public {
    address calculatedPair = UniswapV2Library.pairFor(FACTORY, TOKEN_A, TOKEN_B);
    assertEq(calculatedPair, EXPECTED_PAIR, "Pair address mismatch");
}
```

This verifies that the `pairFor` function correctly calculates the pair address for the given factory and token addresses.
