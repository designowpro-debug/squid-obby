# Lemon Squeezy setup (Skin Shop)

The in-game Skin Shop sells **cosmetic-only** packs through Lemon Squeezy. Until you fill in the config, every pack shows **Coming soon** and nothing can be bought.

## 1. Create the store
1. Sign up at <https://app.lemonsqueezy.com>, create a store, and finish identity and payout verification so you can sell in live mode.
2. Note your **Store ID**: **Settings → Stores**, the number next to your store (for example `12345`).

## 2. Create 4 products
Create each product under **Store → Products → New product**: a single-payment product (not a subscription) with one variant.

| Product name (suggested) | Price | What it unlocks in the game | Config key |
|---|---|---|---|
| Candy Cloud Dash – Neon Pack | US$1.99 | Neon Glow + Cyber Lime | `neon` |
| Candy Cloud Dash – Candy Pack | US$1.99 | Bubblegum + Mint Choco | `candy` |
| Candy Cloud Dash – Galaxy Pack | US$1.99 | Starlight + Comet | `galaxy` |
| Candy Cloud Dash – Supporter Pack | US$4.99 | All 3 packs + Golden Hero (crown) + ⭐ Supporter badge | `supporter` |

You can change the prices. If you do, also update the `price` text in the config, which is display only.

For **each product**:
- Turn on **Generate license keys**. Set the activation limit to `5` (each device or browser uses one activation) and set the license length to **Unlimited / no expiry**.
- Optional: in the product description or the "Thank you" / receipt note, add: *"Open Candy Cloud Dash → 🛍 Skin Shop and paste your license key to unlock."*
- You can use the screenshots in `screenshots/22-shop-unlocked-neon.png` and `23-shop-supporter.png` as product images.

## 3. Copy these values
For each product, copy:
- **Checkout URL**: on the product, click **Share** and copy the checkout link (`https://<your-store>.lemonsqueezy.com/buy/<uuid>`).
- **Product ID** and/or **Variant ID**: these are numbers. The product ID appears in the dashboard URL when you edit the product, and both IDs are available from the product's options menu. One of the two is enough; adding both is safest.
  - Tip: if you can't find them, set `checkoutUrl` and `storeId` first, buy in test mode, and paste the key in the game. The "not for Candy Cloud Dash" error means the IDs are missing. You can also read `product_id` / `variant_id` from **Store → Orders** or from the License API response.

## 4. Paste them into the config
Open `src/game.html`, find `const CONFIG = {` near the top of the game script, and fill in the values:

```js
lemonSqueezy: {
  storeId: 12345,   // your Store ID (keys from other stores are rejected)
  packs: {
    neon:      { price: 'US$1.99', checkoutUrl: 'https://yourstore.lemonsqueezy.com/buy/xxxx', productIds: [111111], variantIds: [222222] },
    candy:     { price: 'US$1.99', checkoutUrl: 'https://yourstore.lemonsqueezy.com/buy/xxxx', productIds: [111112], variantIds: [222223] },
    galaxy:    { price: 'US$1.99', checkoutUrl: 'https://yourstore.lemonsqueezy.com/buy/xxxx', productIds: [111113], variantIds: [222224] },
    supporter: { price: 'US$4.99', checkoutUrl: 'https://yourstore.lemonsqueezy.com/buy/xxxx', productIds: [111114], variantIds: [222225] }
  }
}
```

Any `checkoutUrl` that still contains `TODO`, is empty, or isn't `https://` keeps that pack on **Coming soon**.

If you host the game on another domain, add it to `CONFIG.shopHosts`. On any host not in that list, and inside any iframe, the game runs in **portal mode** with no shop and no payment links.

## 5. Build and publish
```sh
# three.min.js from three@0.159.0, e.g. https://unpkg.com/three@0.159.0/build/three.min.js
THREE_JS=/path/to/three.min.js ./build.sh      # writes index.html
git commit -am "Configure Lemon Squeezy shop" && git push
```
GitHub Pages updates within a minute or two.

## 6. Test
1. In Lemon Squeezy, switch to **Test mode** and buy a pack with the test card `4242 4242 4242 4242` (any future date, any CVC).
2. Copy the license key from the receipt email (or from **Store → Licenses**).
3. In the game, open **🛍 Skin Shop**, paste the key, and press **Unlock**. The pack's skins unlock and the first one is equipped.
4. Live mode uses different product IDs from test mode. Make sure the config holds your **live** IDs and checkout links before you launch.

## How unlocking works
- The game calls the public Lemon Squeezy License API (`POST https://api.lemonsqueezy.com/v1/licenses/activate`) straight from the browser. No API key or server is needed, and the response says which product or variant the key belongs to.
- The game checks that the key is active, belongs to your store (if `storeId` is set), and maps to one of your packs. The unlock is then saved in the browser's `localStorage`.
- Each browser or device uses one activation. You can see or deactivate activations, or disable a refunded key, in **Store → Licenses**.
- **Limitation:** the unlock is client-side only, so a determined user could edit localStorage. That's acceptable for cosmetics that give no gameplay advantage. Don't sell gameplay power this way.
- Players who clear their browser data simply re-enter their key, which uses another activation.
