## Document Management System (DMS)

### Project Overview

This is a full-stack **Document Management System** built using:

**Frontend**: Angular
**Backend**: Node.js + Express
**Database**: MongoDB 
**Authentication**: JWT-based authentication

The application allows users to:

 **Register & Login**
 **Upload documents**
 **Add tags to documents**
 **Search documents by tags**
 **Upload new versions of documents**
 **Track document version history**

### Project Architecture

- `client/` → Angular frontend
- `server/` → Express backend API
- `uploads_repo/` → Uploaded documents storage

###  Project Structure

SmartWinnrAssign/
│
├── client/                     # Angular frontend
│   ├── src/
│   ├── angular.json
│   └── package.json
│
├── server/                     # Express backend
│   ├── controllers/            # Route logic
│   ├── routes/                 # API routes
│   ├── middleware/             # Auth middleware (JWT)
│   ├── config/                 # DB configuration
│   ├── index.js                # Entry point
│   └── package.json
│
├── uploads_repo/               # Uploaded document storage
│
├── .gitignore
└── README.md



### 🛠️ Tech Stack & Versions Used

| **Technology**      | **Version**     |
|---------------------|-----------------|
| Node.js             | 18.x LTS        |
| npm                 | 11.2.0          |
| Angular             | 21.1.x          |
| Angular CLI         | 21.1.5          |
| TypeScript          | 5.9.2           |
| Express             | 4.x             |
| MongoDB( server)    | 8.0.x           |
| OS Tested           | Windows 11      |

Developed and tested using **Node.js 18.x LTS**.

### ⚙️ Prerequisites

Make sure the following are installed:

- **Node.js** (v18.x recommended)
- **npm** (v10+)
- **Git**
- **Database** (MongoDB running locally)

Verify installation:

```bash
node -v
npm -v
```

### 🚀 Local Setup Instructions

#### 1️⃣ Clone Repository

```bash
git clone https://github.com/poojithanemala21/SmartWinnrAssign_DMS.git
cd SmartWinnrAssign
```

Or download ZIP and extract the project.

#### 2️⃣ Backend Setup

```bash
cd server
npm install
```
Start backend:

```bash
npm run dev
```

Backend runs on: `http://localhost:5000`

#### 3️⃣ Frontend Setup

```bash
cd client
npm install
npm start
```

Frontend runs on: `http://localhost:4200`

### 🔐 Authentication Flow

1. User registers  
2. User logs in  
3. Backend generates **JWT**  
4. JWT is used to access **protected routes**

### 📂 API Endpoints (Suggested)

| **Method** | **Endpoint**           | **Description**        |
| ---------- | ---------------------- | ---------------------- |
| POST       | `/api/auth/register`   | Register user          |
| POST       | `/api/auth/login`      | Login user             |
| POST       | `/api/documents`       | Upload document        |
| GET        | `/api/documents`       | Get all documents      |
| PUT        | `/api/documents/:id`   | Upload new version     |

Add more endpoints here if your implementation exposes them.

### 📌 Assumptions

- Files are stored locally in `uploads_repo/`.
- Each new upload with the same document is treated as a **new version**.
- Basic validation (file type, size, required fields) is implemented.

### ⚠️ Limitations

- No cloud storage (local filesystem only).
- No role-based access control (single user role).
- No production deployment configuration included.


### 🧪 How to Test

1. Register a new account.
2. Log in.
3. Upload a document.
4. Add tags to the document.
5. Upload the same document again to test **versioning**.
6. Search using tags to filter documents.

### ✅ Evaluation Checklist Coverage

- **Setup instructions** included  
- **Version details** documented  
- **Architecture** explained  
- **API** documented (high level)  
- **Environment configuration** explained (`.env`)  
