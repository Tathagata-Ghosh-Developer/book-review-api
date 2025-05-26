# 📚 Book Review API

This is a **RESTful API** for a Book Review system built using **Node.js (Express)** and **MongoDB (Mongoose)** with JWT authentication. The project includes complete CRUD operations for books and reviews, secure authentication, search functionality, and modular architecture with services and middlewares.

---

## 🔧 Setup Instructions

### 1️⃣ Clone the Repository
```
git clone https://github.com/Tathagata-Ghosh-Developer/book-review-api.git
cd book-review-api
```

### 2️⃣ Install Dependencies
```
npm install
```

### 3️⃣ Install Prerequisites
Install the following globally if not present:
- Node.js (v16 or higher)
- MongoDB (for local setup)
- npm (comes with Node.js)

### 4️⃣ Create `.env` File
```
# Database Configuration
MONGO_URI=mongodb://localhost:27017/book-review-api

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### 5️⃣ Start the Server
```
npm run dev
```
Your API will be live at `http://localhost:3000`.

### 6️⃣ MongoDB Setup
- Install MongoDB locally and run `mongod`.
- Use the default URI from `.env` or Atlas.

---

## 📄 API Endpoints Overview
- Authentication: `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`
- Books: `/api/books`, `/api/books/:id`
- Reviews: `/api/reviews`, `/api/reviews/:bookId`, `/api/reviews/:id`
- Search: `/api/search`, `/api/search/advanced`, `/api/search/suggestions`

---

## 📂 Folder Structure with JS Files
```
book-review-api/
├── src/
│   ├── config/
│   │   └── database.js
│   │   └── jwt.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   └── reviewController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/
│   │   ├── Review.js
│   │   ├── Book.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── books.js
│   │   ├── reviews.js
│   │   └── search.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── bookService.js
│   │   └── reviewService.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── validators.js
│   ├── app.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
├── README.md
```

---

## 💾 Data Storage
- **Users**, **Books**, **Reviews** collections in MongoDB.

---

## 🚀 Deployment
- Update `.env` with production DB and secrets.
- `npm run start`

---

## 🧪 Manual Testing with Postman (Local MongoDB)

### 📌 1. Register a User
**POST /api/auth/signup**
```
curl -X POST http://localhost:3000/api/auth/signup \
-H "Content-Type: application/json" \
-d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'
```

### 📌 2. Login
**POST /api/auth/login**
```
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "test@example.com", "password": "password123"}'
```
Save the returned JWT token for authenticated requests.

### 📌 3. Add a New Book
**POST /api/books**
```
curl -X POST http://localhost:3000/api/books \
-H "Authorization: Bearer <jwt-token>" \
-H "Content-Type: application/json" \
-d '{"title": "Book Title", "author": "Author Name", "genre": "Fiction", "description": "Book description", "publishedDate": "2023-01-01"}'
```

### 📌 4. Get All Books
**GET /api/books**
```
curl http://localhost:3000/api/books
```

### 📌 5. Get Book Details with Reviews
**GET /api/books/:id**
```
curl http://localhost:3000/api/books/<bookId>
```

### 📌 6. Submit a Review
**POST /api/reviews**
```
curl -X POST http://localhost:3000/api/reviews \
-H "Authorization: Bearer <jwt-token>" \
-H "Content-Type: application/json" \
-d '{"bookId": "<bookId>", "rating": 5, "comment": "Excellent book!"}'
```

### 📌 7. Update Review
**PUT /api/reviews/:id**
```
curl -X PUT http://localhost:3000/api/reviews/<reviewId> \
-H "Authorization: Bearer <jwt-token>" \
-H "Content-Type: application/json" \
-d '{"rating": 4, "comment": "Updated review"}'
```

### 📌 8. Delete Review
**DELETE /api/reviews/:id**
```
curl -X DELETE http://localhost:3000/api/reviews/<reviewId> \
-H "Authorization: Bearer <jwt-token>"
```

### 📌 9. Search Books
**GET /api/search**
```
curl "http://localhost:3000/api/search?q=title"
```

## 🔢 Database Schema Overview

### 📚 User Collection
- `username`: String, unique, required, 3-30 characters
- `email`: String, unique, required, validated
- `password`: String (hashed), required
- `role`: Enum ['user', 'admin'], default 'user'
- `timestamps`: createdAt, updatedAt

### 📚 Book Collection
- `title`: String, required
- `author`: String, required
- `genre`: String, required
- `description`: String, required
- `publishedDate`: Date, required
- `isbn`: String, unique, validated
- `pageCount`: Number (optional)
- `language`: String, default 'English'
- `averageRating`: Number, default 0
- `totalReviews`: Number, default 0
- `createdBy`: ObjectId (User)
- `timestamps`: createdAt, updatedAt

### 📚 Review Collection
- `book`: ObjectId (Book), required
- `user`: ObjectId (User), required
- `rating`: Number (1-5), required
- `comment`: String, required (10-1000 characters)
- `helpful`: Number, default 0
- `timestamps`: createdAt, updatedAt

---

## 📊 Data Flow & Relationships (DFD Style)
- **User** can create **Book** (`createdBy` field)
- **User** can create one **Review** per **Book** (`book` & `user` composite unique index)
- **Review** triggers recalculation of **Book** average rating after create/update/delete
- **Books** and **Reviews** collections are related via **bookId** foreign key
- **Books** reference **User** (creator) for authorization

### 📚 Entity-Relationship Diagram (ERD)

```
┌─────────────┐           ┌─────────────┐           ┌─────────────┐
│   User      │           │    Book     │           │   Review    │
├─────────────┤           ├─────────────┤           ├─────────────┤
│ _id (PK)    │           │ _id (PK)    │           │ _id (PK)    │
│ username    │           │ title       │           │ book (FK)   │───┐
│ email       │           │ author      │           │ user (FK)   │   │
│ password    │           │ genre       │           │ rating      │   │
│ role        │           │ description │           │ comment     │   │
│ createdAt   │──┬──►────►│ publishedDt │           │ helpful     │   │
│ updatedAt   │  │        │ isbn        │           │ createdAt   │   │
└─────────────┘  │        │ createdBy(FK)◄──┬───────│ updatedAt   │   │
                 │        │ avgRating    │  │       └─────────────┘   │
                 │        │ totalReviews │  │                         │
                 │        │ createdAt    │  │                         │
                 │        │ updatedAt    │  │                         │
                 │        └───────────── ┘  │                         │
                 └───────────────────────── ┘                         │
                                   │                                  │
                                   └──────────────────────────────────┘
```

### 📌 Notes:
- **User** creates **Book** (via `createdBy` field).
- **Book** is linked to **User** via `createdBy`.
- **Review** is linked to both **Book** and **User** via `book` and `user` fields.
- One **Review** per **User** per **Book** enforced with unique index.

---

## 📊 Data Flow & Relationships (DFD Style)

- **User** creates **Book**.
- **User** creates **Review** for **Book**.
- **Review** updates **Book**'s average rating and total reviews.

```
[User] ──creates──> [Book] ──hasMany──> [Review] ──belongsTo──> [User]
```



## 📊 Detailed Data Flow Diagram (DFD) - Visual Representation

[External User] --requests--> [API Gateway]
    │
    ├── [Auth Service] --manages--> [User Collection]
    │
    ├── [Book Service] --manages--> [Book Collection]
    │        └── [Review Service] --manages--> [Review Collection]
    │                 └── Updates Book Collection's averageRating & totalReviews


### 📈 DFD Levels:
- **Level 0:** User sends HTTP requests to API endpoints.
- **Level 1:** API Gateway routes requests to appropriate services.
- **Level 2:**
  - **Auth Service:** Manages user registration/login/token verification.
  - **Book Service:** Manages CRUD for books.
  - **Review Service:** Manages CRUD for reviews, linked to books and users.
- **Level 3 (Lowest):** Data is persisted in MongoDB collections (User, Book, Review) with indexing and aggregation.
