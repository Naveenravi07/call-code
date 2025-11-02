# 🚀 DevLab  
### A scalable, container-based web coding playground built for exploration and infra learning.

DevLab is my deep dive into how platforms like **Codedamn** and **Replit** run full-stack apps — like React or Next.js — directly in the browser.  
It’s not just an editor; it’s an entire containerized environment that spins up real servers, terminals, and isolated runtimes — all dynamically.

---

## ⚙️ Architecture Overview

Each playground session runs as a **Kubernetes Job**, creating a Pod that includes:
- 🧩 **Runtime Container** – runs the user’s code (Node, Go, Python, etc.)  
- 🔌 **WebSocket Service** – syncs file edits, terminal I/O, and logs in real time  
- 📁 **Shared Volume** – provides a low-latency filesystem shared between containers  

The whole setup is managed through:
- **Kubernetes Jobs + PVCs** for lifecycle and storage  
- **Ingress + wildcard DNS** for dynamic routing (e.g., `s1.playground.domain.com`)  
- **Docker-based local dev setup** for easy testing without a full cluster  

---

## 🧠 What I Learned

Building DevLab taught me how to design scalable developer infrastructure:
- Container orchestration & isolation  
- Kubernetes Job patterns  
- Ingress routing & service discovery  
- Real-time communication systems  
- Designing for developer experience at scale  

---

## 🧰 Tech Stack
- **Frontend:**  Vite.js, Shadcn Ui, Tanstack router
- **Backend:** Nestjs, Redis, Postgres  
- **Infra:** Docker, Kubernetes  

---

