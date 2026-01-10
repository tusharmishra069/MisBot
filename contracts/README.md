# TON Smart Contracts - Reference Templates

## ⚠️ Important Notice

**These contracts are NOT used in production.**

These are **reference implementations** and **learning templates** for understanding TON smart contract development. The actual MISBOT token deployment uses a third-party service.

---

## What's Here

### 1. `ton/claim.fc`
**Purpose:** Reference template for claim contracts
- Signature-based verification
- Nonce management (prevent replay attacks)
- Admin-signed permissions

### 2. `ton/jetton-minter.fc`
**Purpose:** Reference template for Jetton tokens
- TEP-74 compliant implementation
- Token minting functionality
- Standard Jetton operations

---

## What We Actually Use

### Production Deployment: **minter.ton.org**

Instead of deploying these custom contracts, we use **TON Minter** (https://minter.ton.org):

**Why?**
- ✅ Battle-tested, audited contracts
- ✅ No compilation required
- ✅ Simple web interface
- ✅ Faster deployment
- ✅ Lower risk of bugs
- ✅ Community standard

**How it works:**
1. Go to https://minter.ton.org
2. Switch to testnet mode
3. Fill in token details (MISBOT, MIS, etc.)
4. Deploy with one click
5. Get contract address
6. Use in backend via `jetton-utils.ts`

---

## Why Keep These Files?

These reference contracts are kept for:

1. **Learning** - Understand how TON contracts work
2. **Documentation** - Reference for future development
3. **Customization** - If we need custom features later
4. **Education** - Study TON smart contract patterns

---

## For Developers

If you want to learn from these contracts:
- Study the FunC syntax
- Understand Jetton standards (TEP-74)
- See signature verification patterns
- Learn nonce-based security

If you want to deploy MISBOT token:
- **Don't compile these contracts**
- Use minter.ton.org instead
- Follow the setup guide in `/MISBOT_SETUP.md`

---

## Summary

| Item | Status |
|------|--------|
| These contracts | ❌ Not deployed |
| Production token | ✅ Deployed via minter.ton.org |
| Purpose | 📚 Reference & learning |
| Safe to delete? | ⚠️ Yes, but keep for reference |
