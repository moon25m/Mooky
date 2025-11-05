## 🌟 Sumanth Samala's Netflix inspired Portfolio 🌟 - https://sumanthsamala.com/

Welcome to my personal portfolio project! 🚀 This website showcases my work, skills, and experiences in web development. It's designed to be lightweight, customizable, and professional while maintaining an approachable style.

Explore specific subdomains tailored to different tech stacks:

- 🌟 [java.sumanthsamala.com](https://java.sumanthsamala.com/) for Java Spring Boot-related work.
- 🌟 [node.sumanthsamala.com](https://node.sumanthsamala.com/) for Node.js and backend development.
- 🌟 [frontend.sumanthsamala.com](https://frontend.sumanthsamala.com/) for frontend development expertise.
- 🌟 [ror.sumanthsamala.com](https://ror.sumanthsamala.com/) for Ruby on Rails projects.

![Screenshot from 2024-12-08 19-19-06](https://github.com/user-attachments/assets/f8220485-16ec-48cf-8cb2-7853540c5724)

---

## ✨ Features

- 🌍 **Dynamic Content**: Powered by [DatoCMS](https://www.datocms.com) for easy content management.
- ⚡ **Fast & Responsive**: Built with modern web technologies for seamless performance.
- 🎨 **Customizable**: Modular and easy to adapt to your own needs.
- 📈 **Professional Yet Personal**: Highlights projects, skills, and achievements.
- 🎨 It can support various por

---

## 🛠️ Tech Stack

This portfolio is built with love and:

- ⚛️ **React** (Frontend)
- ☁️ **AWS S3 & CloudFront** (Hosting and CDN)
- 🖌️ **Tailwind CSS** (Styling)
- 🛡️ **DatoCMS** (Content Management)
- 🧩 **Other Cool Tools**: GitHub Actions

---

## ⭐ Show Your Support

If you find this project helpful or inspiring, give it a ⭐ on GitHub—it means the world to me! 🌟

Happy coding! 💻✨

---

## 📚 Getting Started

Want to set this up locally? Follow these steps:

1. **Clone the Repository**: Copy the repository to your local system.
2. **Install Dependencies**: Use a package manager to install the required dependencies.

```bash
nvm install 18
nvm use 18
```

After upgrading Node.js, clear your node_modules and reinstall:

```bash
rm -rf node_modules
npm cache clean --force
npm install
```

3. **Configure Environment Variables**: Create a `.env` file and set up the necessary API keys and configurations.
4. **Run the Project**: Start the development server.

```bash
npm start
```

5. **Visit the Local Server**: Open your browser and navigate to the local server URL.
   ![alt text](image.png)

---

## 🤝 Contribution Guidelines

Contributions are welcome and appreciated! 🥳 To contribute:

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Commit your changes with a descriptive message.
4. Push your changes to your branch.
5. Open a Pull Request. 🎉

---

## 🐛 Issues and Feature Requests

Found a bug? Have a feature in mind? 🤔 Feel free to raise an issue or suggest a feature!

1. Go to the **Issues** tab in the repository.
2. Click **New Issue**.
3. Provide a clear description of the bug or feature request.
4. If applicable, include screenshots or steps to reproduce the issue.

Your feedback is valuable and helps make this project better for everyone. Thank you for contributing!

---

## 🌟 Acknowledgments

- Thanks to [DatoCMS](https://www.datocms.com) for powering the dynamic content.
- Inspired by countless developers in the open-source community. 💻
- Special shoutout to all contributors—you rock! 🤘

---

## 📧 Contact Me

- 💼 [Portfolio Website](https://sumanthsamala.com)
- 📧 Email: [chintusamala96@gmail.com](mailto:chintusamala96@gmail.com)
- 🔗 [LinkedIn](https://uk.linkedin.com/in/sumanth-samala-82431161)

---

## 📜 License

This project is licensed under the MIT License. Feel free to use it, modify it, and share it! 🌈

---

Deployment heartbeat: 2025-11-05 — no-op change to trigger Vercel redeploy on main.

---

## Realtime Birthday Wishes (Vercel + Neon + Pusher)

- Serverless endpoints
   - `GET /api/wish` — returns latest wishes (Cache-Control: no-store)
   - `POST /api/wish` — inserts a wish into Neon and broadcasts via Pusher
   - `GET /api/wish/count` — returns `{ count }` (no-store)
   - `POST /api/wish/typing` — broadcasts typing start/stop via Pusher
- Client
   - Uses Server-Sent Events for low-latency list updates
   - Uses Pusher Channels for instant broadcast plus a typing indicator
   - SWR polling (6–8s) as fallback to keep devices consistent

### Environment

Set these in Vercel → Project → Settings → Environment Variables:

```
DATABASE_URL=postgres://USER:PASS@HOST/db?sslmode=require
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=

# Client (CRA)
REACT_APP_PUSHER_KEY=
REACT_APP_PUSHER_CLUSTER=
```

Note: If copying from Neon dashboard, paste the actual Postgres URL only (not the `psql ...` command). The app sanitizes common mistakes but correct values are best.

### Verify

1) Open the Wishes page on two devices.
2) Start typing on device A — “Someone is typing…” appears on device B.
3) Submit a wish on A — the message appears instantly on B, the count updates; within a few seconds SWR polling confirms consistency.
4) Hard refresh both — both list and counts match.

