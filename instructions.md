# teapot

## Documentation

- [teapot on GitHub](https://github.com/amaanq/teapot) — the upstream README: what teapot does, its routes, and how its sessions work.

## Getting set up

### 1. Copy your session cookies

teapot reads Twitter/X through a logged-in account, so it needs that account's session cookies. Use an account you can afford to lose: Twitter/X may flag or suspend accounts used this way.

1. In a desktop browser, log in to <https://x.com> with that account.
2. Open the browser's developer tools (usually F12) and find the cookies for `x.com`:
   - **Firefox:** Storage → Cookies
   - **Chrome or Brave:** Application → Cookies
3. Copy the values of two cookies: `auth_token` and `ct0`.

### 2. Add the session to teapot

1. On teapot's page in StartOS, open **Actions & Config**.
2. Run **Add Twitter/X Session**.
3. Enter the account's username and paste the `auth_token` and `ct0` values.

teapot restarts and starts loading content. Until you add a session, every profile and post shows an error.

You can add more than one account: when one hits Twitter/X's rate limit, teapot switches to another.

### 3. (Optional) Put a password on it

teapot has no login of its own, so anyone who can reach it can use it and spend your accounts' rate limits. To require one, run **Configure Basic Auth** and turn it on. You'll see the username, `admin`, and a generated password.

While it's on:

- Your browser asks for that login.
- RSS readers need it in the feed address: `https://admin:<password>@<address>/<username>/rss`
- Discord embeds stop working, because Discord can't log in.

To see the password again, run **Configure Basic Auth** with it on. Turning it off keeps the password, so turning it back on restores the same login.

The login covers teapot's HTTPS addresses. If you have marked a gateway secure, teapot's plain HTTP address on that network has no login.

### 4. Choose the address used in links

RSS feeds and Discord embeds link back to teapot, and they all use one address. A **Set Primary URL** task asks you to choose it, suggesting a public domain if teapot has one, otherwise your `.local` address, which only works on your home network. Links use the suggestion until you choose. If you read feeds away from home, or want Discord embeds, pick an address that works there; for Discord embeds it has to be a public one. **Open UI** opens teapot at the same address.

## Using teapot

- **Browse:** open the **Web UI** and go to `/<username>` to see a profile.
- **RSS:** subscribe to `/<username>/rss` in your feed reader.
- **Discord embeds:** paste a teapot link into Discord.

## Troubleshooting

- **Pages show errors or empty timelines:** the account's cookies have probably expired, or Twitter/X has restricted it. Log in to x.com again, copy fresh `auth_token` and `ct0` values, and run **Add Twitter/X Session** with the same username. It replaces the old cookies.
- **teapot asks you to choose a primary URL again:** the address you chose is gone, for example a domain you removed, so links use another address for now. Run **Set Primary URL** and pick one. If the task disappears on its own, the address came back and links use it again.
- **RSS links point to the wrong address:** run **Set Primary URL**.
- **teapot says you're being rate limited:** teapot paces how often it fetches pages it hasn't cached, and everyone using your teapot, RSS readers included, shares that pace. Wait a minute and reload. If your feed reader keeps using it up, make it check less often.
- **You lost the Basic Auth password:** run **Configure Basic Auth** with it on to see it again, or **Reset Basic Auth Password** for a new one. A new password has to be updated in every RSS reader.
- **To stop using an account:** run **Remove Twitter/X Session**.
