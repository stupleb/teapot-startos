# teapot

teapot is a privacy-focused frontend for Twitter/X. Browse profiles and posts with no JavaScript, no tracking, and no ads — and subscribe to any user's timeline as an RSS feed.

teapot fetches content through the Twitter/X API using session cookies from a logged-in account. Until you add one, the web UI loads but every profile or post request will fail.

> **Use a throwaway account.** Twitter/X may flag or suspend accounts whose cookies are used for scraping. Do not use an account you care about.

## Getting set up

### 1. Get your session cookies

1. In a desktop browser, log in to <https://x.com> with the account you want teapot to use.
2. Open the browser developer tools (usually F12) and find the cookies for `x.com`:
   - **Firefox:** Storage tab → Cookies
   - **Chrome/Brave:** Application tab → Cookies
3. Copy the values of two cookies:
   - `auth_token`
   - `ct0`

### 2. Add the session to teapot

1. Open teapot's **Actions** tab in StartOS.
2. Run **Add Twitter/X Session**.
3. Enter the account's username and paste the `auth_token` and `ct0` values.

The service restarts and content loads immediately after. You can add more than one account — teapot rotates between them, which spreads out rate limits. Re-adding the same username replaces its stored tokens (useful when cookies expire — log in again and repeat the steps above).

To remove an account, run **Remove Twitter/X Session**.

### 3. (Optional) Password-protect your instance

teapot has no login of its own — anyone who can reach your instance can use it (and consume your session's rate limits). To lock it down, run **Configure Basic Auth** and switch it on: StartOS generates a username and password and displays them once (they stay available via **Reset Basic Auth Password**, which generates a fresh password).

Keep in mind while Basic Auth is on:

- Browsers prompt for the login; RSS readers need the credentials in the URL: `https://user:password@your-address/<username>/rss`
- Discord embeds will not work, since Discord's servers cannot log in.

Turning it off later keeps your credentials, so re-enabling restores the same login.

### 4. (Optional) Set the primary URL

teapot embeds absolute links in RSS feeds and Discord embeds. By default these use your `.local` address, which only works on your LAN. If you access teapot over Tor or a public domain, run **Set Primary URL** and pick the address those links should use.

## Using teapot

- **Browse:** open the **Web UI** and go to `/<username>` to view a profile.
- **RSS:** subscribe to `/<username>/rss` in your feed reader.
- **Discord embeds:** paste a teapot link (your primary URL must be reachable by Discord's servers, i.e. a public clearnet address).

## Troubleshooting

- **Pages show errors or empty timelines:** your session cookies have likely expired or the account was restricted. Log in to x.com again, copy fresh `auth_token`/`ct0` values, and re-run **Add Twitter/X Session** with the same username.
- **RSS links point to the wrong address:** run **Set Primary URL**.
