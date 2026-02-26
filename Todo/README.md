# Document Management System (DMS)

A robust Document Management System built with the MEAN stack (MongoDB, Express, Angular, Node.js).

## Features
- **Authentication**: Secure JWT-based login and registration.
- **Document Upload**: Support for PDFs, images, and other file types.
- **Tagging & Categorization**: Add tags to documents for easy organization.
- **Search & Filter**: Search documents by keywords or filter by tags.
- **Permissions**: Set viewer/editor permissions for other users (Owner controlled).
- **Version Control**: Track history of updates and manage multiple versions of a document.
- **Responsive UI**: Modern, clean design optimized for all devices.

## Tech Stack
- **Frontend**: Angular 17+ (Standalone Components), RxJS, CSS3.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **File Handling**: Multer for local storage.
- **Auth**: JWT (Json Web Token), bcryptjs.

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (Running locally on `mongodb://localhost:27017/dms`)
- Angular CLI (`npm install -g @angular/cli`)

## Setup Instructions

### 1. Backend Setup
```bash
cd server
npm install
# Create/Check .env file (already provided)
npm run dev # Starts server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm start # Starts frontend on http://localhost:4200
```

### 3. Usage
1. Open `http://localhost:4200` in your browser.
2. Register a new account.
3. Login and start uploading documents.
4. Add tags and search for them in the dashboard.
5. Upload new versions of existing documents to see version tracking in action.

## Project Structure
- `server/`: Express backend API.
- `client/`: Angular frontend application.
- `uploads/`: Directory where documents are stored.

## Screenshots
Please refer to the screenshots provided in the submission email for a visual overview of all pages.
