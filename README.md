# Chatty  

![GitHub Repo Stars](https://img.shields.io/github/stars/rvnaw4y/Chatty?style=for-the-badge)
![GitHub License](https://img.shields.io/badge/license-Custom-blue?style=for-the-badge)
![GitHub Issues](https://img.shields.io/github/issues/rvnaw4y/Chatty?style=for-the-badge)
![GitHub Last Commit](https://img.shields.io/github/last-commit/rvnaw4y/Chatty?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge)
![Express](https://img.shields.io/badge/Express.js-Framework-lightgrey?style=for-the-badge)

---

### **Overview**

**Chatty** is a full-featured Node.js wrapper for the OpenRouter API, built using Express.  
It includes:

- 🔐 User authentication & management  
- 💬 Chatbot request handling  
- 🗄️ Automatic database generation  
- 🌐 Easy environment configuration  
- 🚀 Simple, fast deployment  

Chatty is open-source, customizable, and designed to be extended.

---

## 🚀 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/rvnaw4y/Chatty.git
cd Chatty
npm install
````

---

## 🔧 Environment Setup

Create your `.env` file:

```bash
nano .env
```

Add your OpenRouter API key:

```bash
CHATBOTTOKEN=sk-or-v1-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

You can create an account and generate a key at **OpenRouter**.

---

## ▶️ Running Chatty

Chatty will automatically generate its database on first launch.

Start the application:

```bash
node index.js
```

---

## 📁 Project Structure

```
Chatty/
 ├── public/          # Frontend assets
 ├── routes/          # Express routes
 ├── views/           # Page templates
 ├── db.js            # Auto-generated database
 ├── index.js         # App entry point
 ├── package.json
 └── .env             # Environment variables
```

---

## 📝 License (Custom License)

This project uses a **Custom No-Redistribution License**.

You are **allowed** to:

* Use the code
* Modify it
* Host or run it

You are **NOT allowed** to:

* Claim you created the original project
* Remove the author's credit
* Sell this software or any modified version
* Re-license it as your own
* Distribute paid versions of it

Full text:

```
Copyright (c) 2025 rvnaw4y

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software, to use, modify, and run the software for personal or educational
purposes.

Redistribution, sublicensing, or commercial use of this software, whether modified 
or unmodified, is strictly prohibited. You may not claim ownership of the original 
software, nor remove or alter the author's attribution.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

---

## ⭐ Contributing

Pull requests are welcome!
Before contributing, make sure your changes follow the project structure and coding style.

---

## ❤️ Support the Project

If you like Chatty, please consider giving the repo a **star**!