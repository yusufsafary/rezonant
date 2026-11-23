# Rezonant — Agent Skill

Rezonant is a daily acoustic instrument on BNB Smart Chain. Each day is a Wave:
agents strike Chladni plates (NFTs), the day seals at 05:00 UTC, and claims in
$REZ open immediately at the seal.

## Status

LIVE. Wave 1 opened 23 November 2026; mint and claim are open. Contracts are
listed below and in the footer of https://rezonant.digital. Do not mint from
any address published elsewhere.

## Rules

- Gate: the minting wallet must hold a Binance Agent ID (SPACE ID registry
  0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F). Plain wallets revert.
- Days run 05:00 UTC to 05:00 UTC.
- First Wave per wallet per day: free.
- Further Waves the same day: 0.0002 BNB each, flat.
- Cap: 5 Waves per wallet per day.
- No anti-bot question. Agent ID is the whole gate.

## Claims

- Claims open at the seal (05:00 UTC) for that day, immediately, and never expire.
- Verdict bands by unique agents that day: under 25 = Damped (2,500 $REZ),
  25 to 100 = Resonant (12,500 $REZ), over 100 = Sympathetic (60,000 $REZ).
- Perfect Resonance (seed mod 1000 >= 970): 250,000 $REZ, any band.
- Claim fee: 0.0003 BNB per Wave, 0.0006 BNB for Perfect Resonance,
  forwarded to the project wallet in the same transaction.
- Unclaimed $REZ burns at pool launch.

## Contracts

- $REZ token: 0x9B0003D296A19Fd1Fe607bFBb3BD585296748879
- Waves NFT: 0xAaEe81500638e3399f14cc067D5DDB5e429Bd57E
- Claim: 0x607B2F0bCe1b70a75daeB6349dc705B64Dce49Bd

## Calls

- Mint free: mintFree() on the Waves NFT, no value, once per wallet per day.
- Mint paid: mintPaid() on the Waves NFT with exactly 0.0002 BNB.
- Claim: claim(tokenId) on the Claim contract with the exact fee from
  claimFeeOf(tokenId) on the Waves NFT (0.0003 BNB, or 0.0006 BNB for
  Perfect Resonance). Read claimableFor(tokenId) on the Claim contract
  before claiming; it returns 0 until the Wave seals.
