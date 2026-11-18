# LowData Call (MVP)
Video calls designed to use as little data as possible, built for people on mobile data first, Wi-Fi second.
Zero npm dependencies. Node 18+.

## Core principles
- Every participant controls and sees their own data consumption.
- Every participant's data allowance and financial constraints remain private.
- A temporary loss of connectivity should not mean losing the conversation.

## 1. Why a relay (TURN) is required for mobile data
Calls go directly between devices when possible. Mobile carriers usually put phones behind carrier-grade NAT,
which blocks direct connections for a large share of users. Those calls only work through a TURN relay.
**Without a relay, many mobile-data users will fail to connect.** The server prints a warning at startup if none is set,
and the join page's "Test my connection" button tells each user whether a relay works for them.

### Easiest: Cloudflare Realtime TURN (managed)
1. In the Cloudflare dashboard create a TURN key (Realtime section). Docs: https://developers.cloudflare.com/realtime/turn/generate-credentials/
2. Copy the Key ID and API token into the environment variables `CF_TURN_KEY_ID` and `CF_TURN_API_TOKEN`
   (on Render: your service > Environment).
3. Redeploy. The server creates short-lived credentials automatically; the secret never reaches the browser.

Cost (as of Nov 2026, check current pricing): first 1,000 GB per month free, then $0.05/GB, billed on data sent from
Cloudflare to the client. A fully relayed 1-hour 1-to-1 call in Saver mode is at most ~165 MB, so the free allowance
covers thousands of call-hours. Only calls that need the relay count; most Wi-Fi calls connect directly.

### Alternatives
- Self-hosted coturn with `use-auth-secret`: set `TURN_URLS="turn:host:3478,turns:host:443?transport=tcp"` and `TURN_SECRET`.
- Any provider with fixed credentials: set `TURN_URL`, `TURN_USER`, `TURN_PASS`.
Tip: include a `turns:...:443?transport=tcp` URL; it passes through the strictest mobile and office firewalls.

## 2. Make it easy for testers (no terminal for them)
Deploy once, then share the https link. Testers tap it, allow camera and mic, press Join.
1. Make a GitHub repository and drag this folder's files into it in the browser.
2. On render.com choose New > Blueprint, connect the repo, Apply (render.yaml is included).
3. Add the two Cloudflare variables above, share the link.
The free Render tier sleeps when idle; the first visit can take 30-60 seconds.
Run locally instead: `node server.js`, then `npx cloudflared tunnel --url http://localhost:3000` for an https link.

## 3. Mobile-data features built in
- Auto quality starts in Saver (360p, 15 fps) on mobile data, or Audio only on 2G; optional MB/hour budget
- "I am on mobile data" switch (needed on iPhone, which does not report the network type)
- Recovers from Wi-Fi/mobile switches and short drops (ICE restart, stable reconnect with a 10 s grace period)
- Conversation Recovery: when connection is interrupted, record a short voice message locally and send it later
- Keeps the phone screen awake during calls (Screen Wake Lock)
- Receive video off, Share slides (2 fps), camera fully off, AV1/VP9 preferred, audio capped at 24 kbit/s
- Live personal data intelligence: measured sent/received usage, average rate, estimated remaining time, private to you
- Live meter: kbit/s up/down, MB used, direct vs relayed, codec, per-person resolution and fps

## 4. Testing on mobile conditions
- Add `?relay=1` to the link (e.g. `https://yourapp.onrender.com/?relay=1#room`) to force all media through the relay.
  Use it to confirm the relay works before inviting testers.
- Test with a real phone on mobile data (Wi-Fi off) joining a laptop on Wi-Fi.

## Known limits
- Mesh: everyone uploads to everyone. Keep rooms to 2-4 people. Larger rooms need an SFU (e.g. LiveKit).
- No accounts: anyone with the room link can join. Rooms are random; the link is the password.
- Browsers pause camera and microphone when a phone locks or the app is backgrounded. Keep the screen on.
- Screen sharing does not work on phone browsers. Safari ignores some bitrate settings.
- Conversation Recovery messages are stored locally for the session; full cross-device persistence and encrypted delivery are future work.
- Not yet verified end-to-end on a live carrier network; the first tester results are the real test.

## Product principle
Your data belongs to you. Your communication should continue even when your connection doesn't.
