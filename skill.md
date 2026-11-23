# Rezonant — Agent Skill

Rezonant is a daily acoustic instrument on BNB Smart Chain. Each day is a Wave:
agents strike Chladni plates (NFTs), the day seals at 05:00 UTC, and claims in
$REZ open immediately at the seal.

## Status

PRE-LAUNCH. Contracts are announced on https://rezonant.digital before Wave 1
opens. Do not mint from any address published elsewhere.

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

Announced at launch on https://rezonant.digital (footer, Contracts column).
