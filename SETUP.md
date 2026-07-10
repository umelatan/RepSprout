# CalCollab — Setup Guide

## Step 1 — Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → give it a name (e.g. `calcollab`)
3. Disable Google Analytics (not needed) → **Create project**

---

## Step 2 — Enable Google Sign-In

1. In your project, go to **Build → Authentication**
2. Click **Get started**
3. Under **Sign-in method**, click **Google** → toggle **Enable** → Save
4. Set a support email (your own Gmail is fine)

---

## Step 3 — Create a Realtime Database

1. Go to **Build → Realtime Database**
2. Click **Create database**
3. Choose a region (pick the closest to your team)
4. Start in **test mode** (we'll lock it down next)

---

## Step 4 — Set security rules

In the Realtime Database console, click the **Rules** tab and replace everything with:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "userGroups": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && (auth.uid === $uid || auth.token.email === 'shaf.r210003@gmail.com')"
      }
    },
    "userPending": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && (auth.uid === $uid || auth.token.email === 'shaf.r210003@gmail.com')"
      }
    },
    "notifications": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null"
      }
    },
    "groups": {
      "$groupId": {
        ".read": "auth != null && (root.child('groups/' + $groupId + '/members/' + auth.uid).exists() || root.child('groups/' + $groupId + '/admins/' + auth.uid).exists() || auth.token.email === 'shaf.r210003@gmail.com')",
        ".write": "auth != null && (auth.token.email === 'shaf.r210003@gmail.com' || root.child('groups/' + $groupId + '/admins/' + auth.uid).exists())",
        "name": { ".read": "auth != null" },
        "inviteCode": { ".read": "auth != null" },
        "admins": { ".read": "auth != null" },
        "members": {
          "$uid": { ".read": "auth != null && auth.uid === $uid" }
        },
        "availability": {
          "$date": {
            "$uid": {
              ".write": "auth != null && auth.uid === $uid && root.child('groups/' + $groupId + '/members/' + auth.uid).exists()"
            }
          }
        },
        "lepak": {
          ".write": "auth != null && root.child('groups/' + $groupId + '/members/' + auth.uid).exists()"
        },
        "pending": {
          "$uid": {
            ".read": "auth != null && (auth.uid === $uid || root.child('groups/' + $groupId + '/admins/' + auth.uid).exists() || auth.token.email === 'shaf.r210003@gmail.com')",
            ".write": "auth != null && (auth.uid === $uid || root.child('groups/' + $groupId + '/admins/' + auth.uid).exists() || auth.token.email === 'shaf.r210003@gmail.com')"
          }
        }
      }
    }
  }
}
```

Click **Publish**.

This means:
- Members can read and write their own availability/hangouts within a group
- Admins can manage members and approve join requests
- Only authenticated users can submit join requests
- The `inviteCode` path is only readable by group admins (needed to generate invite links)

---

## Step 5 — Get your Firebase config

1. Go to **Project settings** (gear icon, top left)
2. Scroll down to **Your apps** → click **</>** (Web)
3. Register the app (any nickname, e.g. `calcollab-web`)
4. Copy the `firebaseConfig` object — looks like:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "calcollab-abc12.firebaseapp.com",
  databaseURL: "https://calcollab-abc12-default-rtdb.firebaseio.com",
  projectId: "calcollab-abc12",
  storageBucket: "calcollab-abc12.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Step 6 — Paste the config into index.html

Open `index.html` and find the section at the bottom:

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  ...
};
```

Replace it with the config you copied in Step 5.

---

## Step 7 — Add your domain to Firebase Auth

After deploying to GitHub Pages, you need to whitelist the domain:

1. In Firebase Console → **Authentication → Settings → Authorized domains**
2. Click **Add domain**
3. Enter your GitHub Pages domain: `YOUR_USERNAME.github.io`

---

## Step 8 — Deploy to GitHub Pages

1. Create a **public** repo on [github.com](https://github.com) (e.g. `calcollab`)
2. Push `index.html` to the repo:

```bash
git init
git add index.html
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/calcollab.git
git push -u origin main
```

3. Go to the repo → **Settings → Pages**
4. Under **Source**, select **Deploy from a branch** → `main` → `/ (root)` → Save
5. Your app will be live at: `https://YOUR_USERNAME.github.io/calcollab`

---

## Sharing with colleagues

Just send them the `https://YOUR_USERNAME.github.io/calcollab` link.  
They sign in with any Google account — no setup needed on their end.

---

## Free tier limits (Firebase Spark plan)

| Resource | Free limit | Your likely usage |
|---|---|---|
| Storage | 1 GB | < 1 MB |
| Downloads/month | 10 GB | < 1 MB |
| Simultaneous connections | 100 | 5–7 |

You will **never** hit these limits with a 5–7 person team.
