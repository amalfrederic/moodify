Perfect! Here’s an enhanced version of your README with a **demo screenshot and live link section** added:

---

# Moodify 🎶

Moodify is a Next.js app that generates Spotify playlists based on your mood using Gemini AI. This version has been modified to work seamlessly with Vercel deployment.

---

## **Live Demo**

Try the app live: [https://moodify.vercel.app](https://moodify.vercel.app)

![Moodify Demo Screenshot](./public/demo-screenshot.png)

> *A preview of Moodify generating playlists based on mood input.*

> ⚠️ Replace `./public/demo-screenshot.png` with an actual screenshot of your deployed app in the `public` folder.

---

## **Getting Started (Local Development)**

1. **Clone the repository:**

```bash
git clone <your-repo-link>
cd moodify
```

2. **Install dependencies:**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables:**
   Create a `.env.local` file in the root folder:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

> ⚠️ Make sure the `redirect_uri` matches your Spotify Developer Dashboard settings for local testing.

4. **Run the development server:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## **Deployment on Vercel**

This project is ready for deployment on Vercel.

1. Push your modified code to GitHub.
2. Connect your GitHub repository to Vercel.
3. Configure the environment variables in Vercel:

```
NEXT_PUBLIC_SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://moodify.vercel.app/callback
```

4. Deploy the project. The app will be available at:

```
https://moodify.vercel.app
```

> ⚠️ Make sure to also add the deployed URL to your Spotify Developer Dashboard as a valid Redirect URI.

---

## **Usage**

* Click **Login with Spotify**.
* Enter your mood.
* Generate a playlist based on your mood.
* Spotify playlists and Gemini AI text will appear on the page.

---

## **Learn More**

* [Next.js Documentation](https://nextjs.org/docs)
* [Learn Next.js](https://nextjs.org/learn)
* [Next.js GitHub Repository](https://github.com/vercel/next.js)

---

If you want, I can also make a **super-clean version with badges, folder structure, and setup instructions** so it looks professional for club submission. That usually impresses reviewers. Do you want me to do that?
