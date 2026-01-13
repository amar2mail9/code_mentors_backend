# Code Mentors Backend

This is the backend service for the Code Mentors application, providing a RESTful API for user authentication, tutorials, and other related functionalities.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
  - [Health Check](#health-check)
  - [User Authentication](#user-authentication)
  - [Login History](#login-history)
  - [Technology](#technology)
  - [Category](#category)
  - [Comment](#comment)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [API Usage & Data Flow](#api-usage--data-flow)

## Features

- User account creation and verification (OTP and password-based).
- User authentication (OTP and password-based).
- Login history tracking.
- Health check endpoint for monitoring service status.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Node.js and npm (or yarn) installed on your machine.

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/get-npm)

You also need a MongoDB database instance. You can use a local installation or a cloud service like MongoDB Atlas.

### Installation

1.  Clone the repository:

    ```sh
    git clone https://github.com/your-username/code_mentors_backend.git
    cd code_mentors_backend
    ```

2.  Install the dependencies:

    ```sh
    npm install
    ```

3.  Create a `.env` file in the root directory and add the following environment variables. You can use the `.env.example` file as a template.
    ```
    PORT=5000
    MONGODB_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    ```

## Running the Application

To run the application in development mode with automatic reloading, use:

```sh
npm run dev
```

To run the in production mode, use:

```sh
npm run start
```

The server will be running at `http://localhost:5000`.

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Health Check

- `GET /health` - Checks the status of the service and its database connection.

### User Authentication

- `POST /user/new-account` - Create a new user account.
- `POST /user/account-verify` - Verify a new account using an OTP.
- `POST /account/resend-otp` - Resend the OTP for account verification.
- `POST /login/via-password` - Log in using email and password.
- `POST /login/via-otp` - Request an OTP for logging in.

### Login History

- `POST /login-history` - Create a new login history entry.
- `GET /login-history/user/:userId` - Get login history for a specific user.
- `GET /login-history` - Get all login history (Admin only).
- `GET /login-history/:id` - Get a specific login history entry by ID.
- `PUT /login-history/:id` - Update a login history entry.
- `DELETE /login-history/:id` - Delete a specific login history entry.
- `DELETE /login-history/user/:userId` - Delete all login history for a specific user.
- `GET /login-history/stats` - Get login statistics.

### Technology

- `POST /technology/create` - Create a new technology.

### Category

- `POST /category/create` - Create a new category.
- `GET /categories` - Get all categories.
- `GET /category/:id` - Get a specific category by ID.
- `PUT /category/:id` - Update a category.
- `DELETE /category/:id` - Delete a category.

### Comment

- `POST /comment/create` - Create a new comment.
- `GET /comments/:tutorialId` - Get all comments for a specific tutorial.
- `PUT /comment/:id` - Update a comment.
- `DELETE /comment/:id` - Delete a comment.

## Project Structure

```
.
├── src
│   ├── componets
│   │   ├── controllers
│   │   ├── db
│   │   ├── middlewares
│   │   ├── models
│   │   └── routes
│   └── utility
└── main.js
```

## Technologies Used

- [Node.js](https://nodejs.org/) - JavaScript runtime environment.
- [Express.js](https://expressjs.com/) - Web framework for Node.js.
- [MongoDB](https://www.mongodb.com/) - NoSQL database.
- [Mongoose](https://mongoosejs.com/) - ODM library for MongoDB.
- [JSON Web Tokens (JWT)](https://jwt.io/) - For user authentication.
- [Bcrypt](https://www.npmjs.com/package/bcrypt) - For password hashing.
- [Cloudinary](https://cloudinary.com/) - For media storage.
- [Multer](https://github.com/expressjs/multer) - For handling `multipart/form-data`.
- [Dotenv](https://www.npmjs.com/package/dotenv) - For managing environment variables.
- [Nodemon](https://nodemon.io/) - For automatic server restarts during development.

## API Usage & Data Flow

This section details how to interact with the API endpoints, including request and response examples.

### `POST /api/v1/user/new-account`

Creates a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "password": "password123"
}
```

**Success Response (201 Created):**

An OTP is sent for verification, and user information is returned.

```json
{
  "success": true,
  "message": {
    "message": "Account Created",
    "send": "Opt sent Successfully"
  },
  "data": {
    "_id": "60d0fe4f5b3e6e3b7c8f8b1a",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "username": "johndoe"
  }
}
```

**Error Response (409 Conflict):**

This response is sent if the email or username already exists.

```json
{
  "success": false,
  "message": "User with this email already exists",
  "data": null,
  "error": {
    "error": "Email or username already in use "
  }
}
```

### `POST /api/v1/user/account-verify`

Verifies the user's account using the OTP sent during registration.

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "OTP": "123456"
}
```

**Success Response (200 OK):**

The account is verified, and a JWT token is returned for authentication.

```json
{
  "success": true,
  "message": {
    "message": "Account Verified "
  },
  "data": {
    "user": {
      "email": "john.doe@example.com",
      "name": "John Doe",
      "username": "johndoe",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Response (400 Bad Request):**

This response is sent for an invalid OTP.

```json
{
  "success": false,
  "message": {
    "error": "Invalid OTP "
  }
}
```

### `POST /api/v1/login/via-password`

Authenticates a user with their email/username and password.

**Request Body:**

```json
{
  "inputValue": "johndoe",
  "password": "password123"
}
```

**Success Response (200 OK):**

The user is logged in, and a new JWT token is returned.

```json
{
  "success": true,
  "message": {
    "message": "Login Successfully"
  },
  "data": {
    "user": {
      "email": "john.doe@example.com",
      "name": "John Doe",
      "username": "johndoe",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Response (401 Unauthorized):**

This response is sent for invalid credentials.

```json
{
  "success": false,
  "message": {
    "error": "Invalid credentials"
  }
}
```
