// // SPDX-License-Identifier: UNLICENSED

// pragma solidity ^0.7.6;

// import "forge-std/Test.sol";
// import "../contracts/v2-contracts/contracts/ObservableOracle.sol";
// import "../contracts/v2-contracts/libraries/UniswapV2Library.sol";

// contract ObservationsViewerTest is Test {
//     ObservableOracle public oracle;
    
//     // Test addresses from your configuration
//     address constant FACTORY = 0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6;
//     address constant TOKEN_A = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
//     address constant TOKEN_B = 0xbCC7F0E389638686Db5C0a3e54d11474f8c9bFC1;
//     address constant EXPECTED_PAIR = 0x19efbaff6E7Fa1A0f7115249e8833b325F276002;
    
//     uint constant WINDOW_SIZE = 86400; // 24 hours
//     uint8 constant GRANULARITY = 12;   // 12 observations

//     function setUp() public {
//         // Deploy the oracle
//         oracle = new ObservableOracle(FACTORY, WINDOW_SIZE, GRANULARITY);
        
//         // Grant keeper role to this test contract
//         oracle.grantRole(oracle.KEEPER_ROLE(), address(this));
//     }

//     function testPairForFunction() public {
//         // Test the pairFor function with your specific addresses
//         address calculatedPair = UniswapV2Library.pairFor(FACTORY, TOKEN_A, TOKEN_B);
        
//         console.log("Factory Address:", FACTORY);
//         console.log("Token A:", TOKEN_A);
//         console.log("Token B:", TOKEN_B);
//         console.log("Calculated Pair:", calculatedPair);
//         console.log("Expected Pair:", EXPECTED_PAIR);
        
//         assertEq(calculatedPair, EXPECTED_PAIR, "Pair address mismatch");
        
//         // Test with reversed token order (should give same result)
//         address calculatedPairReversed = UniswapV2Library.pairFor(FACTORY, TOKEN_B, TOKEN_A);
//         assertEq(calculatedPairReversed, EXPECTED_PAIR, "Reversed token order should give same pair");
//     }

//     function testViewAllObservations() public {
//         address pair = EXPECTED_PAIR;
        
//         console.log("=== Oracle Configuration ===");
//         console.log("Factory:", oracle.factory());
//         console.log("Window Size:", oracle.windowSize());
//         console.log("Granularity:", oracle.granularity());
//         console.log("Period Size:", oracle.periodSize());
//         console.log("");
        
//         console.log("=== Pair Information ===");
//         console.log("Pair Address:", pair);
//         console.log("");
        
//         // Get the length of observations array
//         uint observationsLength = oracle.pairObservations(pair, 0);
//         console.log("Observations Length:", observationsLength);
        
//         if (observationsLength == 0) {
//             console.log("No observations found. Updating oracle...");
            
//             // Update the oracle to create observations
//             oracle.update(TOKEN_A, TOKEN_B);
            
//             // Check length again
//             observationsLength = oracle.pairObservations(pair, 0);
//             console.log("Observations Length after update:", observationsLength);
//         }
        
//         console.log("");
//         console.log("=== All Observations ===");
//         console.log("Index | Timestamp | Price0 Cumulative | Price1 Cumulative");
//         console.log("------|-----------|-------------------|-------------------");
        
//         for (uint i = 0; i < observationsLength; i++) {
//             try oracle.pairObservations(pair, i) returns (
//                 uint timestamp,
//                 uint price0Cumulative,
//                 uint price1Cumulative
//             ) {
//                 console.log(
//                     i,
//                     timestamp,
//                     price0Cumulative,
//                     price1Cumulative
//                 );
//             } catch {
//                 console.log("Could not fetch observation at index:", i);
//             }
//         }
        
//         console.log("");
//         console.log("=== Current Observation Index ===");
//         uint currentTimestamp = block.timestamp;
//         uint8 currentIndex = oracle.observationIndexOf(currentTimestamp);
//         console.log("Current Timestamp:", currentTimestamp);
//         console.log("Current Observation Index:", currentIndex);
        
//         console.log("");
//         console.log("=== First Observation in Window ===");
//         try oracle.getFirstObservationInWindow(pair) returns (
//             uint timestamp,
//             uint price0Cumulative,
//             uint price1Cumulative
//         ) {
//             console.log("First Observation Timestamp:", timestamp);
//             console.log("First Observation Price0 Cumulative:", price0Cumulative);
//             console.log("First Observation Price1 Cumulative:", price1Cumulative);
//         } catch {
//             console.log("Could not fetch first observation in window");
//         }
//     }

//     function testUpdateObservations() public {
//         address pair = EXPECTED_PAIR;
        
//         console.log("=== Before Update ===");
//         uint observationsLengthBefore = oracle.pairObservations(pair, 0);
//         console.log("Observations Length Before:", observationsLengthBefore);
        
//         // Update the oracle
//         oracle.update(TOKEN_A, TOKEN_B);
        
//         console.log("=== After Update ===");
//         uint observationsLengthAfter = oracle.pairObservations(pair, 0);
//         console.log("Observations Length After:", observationsLengthAfter);
        
//         // Get the latest observation
//         uint8 currentIndex = oracle.observationIndexOf(block.timestamp);
//         console.log("Current Observation Index:", currentIndex);
        
//         try oracle.pairObservations(pair, currentIndex) returns (
//             uint timestamp,
//             uint price0Cumulative,
//             uint price1Cumulative
//         ) {
//             console.log("Latest Observation:");
//             console.log("  Timestamp:", timestamp);
//             console.log("  Price0 Cumulative:", price0Cumulative);
//             console.log("  Price1 Cumulative:", price1Cumulative);
//         } catch {
//             console.log("Could not fetch latest observation");
//         }
//     }

//     function testConsultFunction() public {
//         // First update the oracle
//         oracle.update(TOKEN_A, TOKEN_B);
        
//         // Test consult function
//         uint amountIn = 1e18; // 1 token
        
//         console.log("=== Consult Test ===");
//         console.log("Amount In:", amountIn);
//         console.log("Token A:", TOKEN_A);
//         console.log("Token B:", TOKEN_B);
        
//         try oracle.consult(TOKEN_A, amountIn, TOKEN_B) returns (uint amountOut) {
//             console.log("Amount Out (A -> B):", amountOut);
//         } catch Error(string memory reason) {
//             console.log("Consult failed (A -> B):", reason);
//         }
        
//         try oracle.consult(TOKEN_B, amountIn, TOKEN_A) returns (uint amountOut) {
//             console.log("Amount Out (B -> A):", amountOut);
//         } catch Error(string memory reason) {
//             console.log("Consult failed (B -> A):", reason);
//         }
//     }

//     // Helper function to view observations for any pair address
//     function viewObservationsForPair(address pair) public {
//         console.log("=== Viewing Observations for Pair:", pair);
        
//         uint observationsLength = oracle.pairObservations(pair, 0);
//         console.log("Observations Length:", observationsLength);
        
//         if (observationsLength == 0) {
//             console.log("No observations found for this pair");
//             return;
//         }
        
//         console.log("Index | Timestamp | Price0 Cumulative | Price1 Cumulative");
//         console.log("------|-----------|-------------------|-------------------");
        
//         for (uint i = 0; i < observationsLength; i++) {
//             try oracle.pairObservations(pair, i) returns (
//                 uint timestamp,
//                 uint price0Cumulative,
//                 uint price1Cumulative
//             ) {
//                 console.log(
//                     i,
//                     timestamp,
//                     price0Cumulative,
//                     price1Cumulative
//                 );
//             } catch {
//                 console.log("Could not fetch observation at index:", i);
//             }
//         }
//     }
// }
