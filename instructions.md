# teapot

> **You need an X account.** teapot reads X through the session cookies of a real, logged-in X account. Use a burner account: X may restrict or suspend accounts used for scraping.

## Documentation

- [teapot on GitHub](https://github.com/amaanq/teapot) — the upstream README: what teapot does, its routes, and how its sessions work.

## Getting Set Up

### 1. Choose private or public

teapot asks you to run **Manage Access** before it starts.

- **Private**, the default, asks for a username and password, in your browser and in RSS readers. The username is always `admin`. The password is generated for you and shown only once, so save it. Discord can't log in, so it shows no previews of teapot links.
- **Public** lets anyone who can reach one of teapot's addresses use it, and every page they open is fetched with your X account.

### 2. Get your session cookies

1. In a desktop browser, log in to <https://x.com> with your (burner) account.
2. Open the browser's developer tools (`F12`) and find the cookies for `x.com`:
   - **Firefox:** Storage tab → Cookies → `https://x.com`
   - **Chrome/Brave:** Application tab → Cookies → `https://x.com`
3. Copy the values of these two cookies:
   - `auth_token`
   - `ct0`

Keep the browser session logged in — logging out invalidates the cookies.

### 3. Add the session to teapot

1. Run **Add X Account Session** and paste the two cookie values. The username field is optional and only labels the session.
2. Start the service.

You can add multiple sessions from different accounts: when one hits X's rate limit, teapot switches to another.

### 4. Choose the address used in links

RSS feeds and Discord previews link back to teapot, and they all use one address. A **Set Primary URL** task asks you to choose it, suggesting a public domain if teapot has one, otherwise your `.local` address, which only works on your home network. Links use the suggestion until you choose. If you read feeds away from home, or want Discord previews, pick an address that works there; for Discord it has to be a public one. **Open UI** opens teapot at the same address.

### 5. Open the web UI

Open the **Web UI** and go to `/<username>` to see a profile and confirm data loads.

## RSS Feeds and Discord

Subscribe to `/<username>/rss` in your feed reader. Paste a teapot link into Discord to get a preview.

While teapot is private, RSS readers need the username and password too. Most support Basic Auth natively or via `https://admin:password@your-address/...` URLs. Discord shows previews only while teapot is public.

## Private or Public

Run **Manage Access** at any time to switch between private and public.

- Choosing **Private** again keeps your current password. Turn on **Generate a new password** to replace it; the old one then stops working everywhere, including in RSS readers.
- **Tor addresses:** an onion address added without SSL skips the login, and that is Tor's default for a web interface. To keep a private teapot private over Tor, turn on SSL when you add the onion address. Tor Browser then shows a certificate warning.

## Display Preferences

Run **Set Default Preferences** to choose the theme, infinite scrolling, and where links to Twitter/X, YouTube and Reddit open, for example on your own Invidious. Visitors can still change these for themselves on teapot's **Preferences** page.

## GIFs in Discord

X sends GIFs as videos, which Discord doesn't play inline. Run **GIF Transcoding** and turn it on to have teapot convert them into real GIFs for Discord. Converting uses your server's processor, so leave it off if you don't share teapot links in Discord.

## Troubleshooting

- **Pages show errors or empty timelines:** check the **X Account Sessions** health check on teapot's page. If it says X refused a session, the account's cookies have expired or X has restricted it: run **Remove X Account Sessions**, then **Add X Account Session** with fresh cookies. If it says the sessions are rate-limited, wait up to 15 minutes.
- **The service won't start after install:** complete the **Manage Access** and **Add X Account Session** tasks first.
- **teapot asks you to choose a primary URL again:** the address you chose is gone, for example a domain you removed, so links use another address for now. Run **Set Primary URL** and pick one. If the task disappears on its own, the address came back and links use it again.
- **RSS links point to the wrong address:** run **Set Primary URL**.
- **teapot says you're being rate limited:** teapot paces how often each device can fetch pages it hasn't cached. Wait a minute and reload. If your feed reader keeps hitting the limit, make it check less often.
- **Lost the password:** run **Manage Access**, choose **Private** and turn on **Generate a new password**. Update the new password in every RSS reader.
