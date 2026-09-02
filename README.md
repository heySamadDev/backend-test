# MiniStore Backend API

MiniStore is a simple backend API built with **Node.js + Express.js** for handling products, orders, checkout, fake payments, request logging, and centralized API responses.

The project is built without a database. For now, products and orders are handled using in-memory data, so the data will reset whenever the server restarts.

---

## Tech Stack

- Node.js
- Express.js
- JavaScript
- REST API
- File System (`fs`)
- Async/Await
- Custom Middleware
- Centralized Error Handling
- Centralized API Response Handling

---

## Project Structure

```text
backend-test/
│
├── controllers/
│   ├── productController.js
│   ├── orderController.js
│   └── checkout.controller.js
│
├── data/
│   ├── products.js
│   └── orders.js
│
├── middleware/
│   └── adminAuth.js
│
├── routes/
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   └── checkout.routes.js
│
├── services/
│   └── payment.service.js
│
├── Data/
│   └── server.log
│
├── utils/
│   └── ApiResponse.js
│
├── server.js
├── package.json
└── README.md
```

> Folder/file names should match the actual project structure. If a file is moved to another directory, its import path also needs to be updated.

---

# Server Setup

## Install Dependencies

```bash
npm install
```

## Start Server

```bash
node server.js
```

Server will start on:

```text
http://localhost:3000
```

---

# Base URL

```text
http://localhost:3000
```

Frontend can use this as the base URL for all API requests.

---

# Request Flow

The backend follows a simple flow:

```text
Client
   ↓
Request
   ↓
Route
   ↓
Controller
   ↓
Business Logic
   ↓
ApiResponse / Error
   ↓
HTTP Response
```

For errors:

```text
Controller
   ↓
throw Error
   ↓
Error Middleware
   ↓
HTTP Error Response
```

---

# API Response Handling

Earlier, API responses were handled manually inside each controller.

For example, every controller had to write its own response structure:

```js
return res.status(200).json({
  success: true,
  message: "Products fetched successfully",
  data: products,
});
```

The problem with this approach is that the same response structure has to be repeated everywhere.

To keep the response format consistent, a centralized `ApiResponse` class is now used.

## ApiResponse

```js
class ApiResponse {
  constructor(res, status, message, data = null) {
    return res.status(status).json({
      success: true,
      message,
      data,
    });
  }
}

module.exports = ApiResponse;
```

Now controllers can simply do:

```js
return new ApiResponse(
  res,
  200,
  "Products fetched successfully",
  products
);
```

The API response will always follow the same structure.

### Success Response

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Laptop",
      "price": 50000
    }
  ]
}
```

### Success Response Without Data

If an API does not need to return any data:

```js
return new ApiResponse(
  res,
  200,
  "Product deleted successfully"
);
```

Response:

```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": null
}
```

This keeps the response format consistent across the entire API.

---

# Error Handling

Success responses and error responses are handled separately.

For errors, controllers can pass the error to Express's error middleware:

```js
next(error);
```

The central error handler in `server.js` handles the response:

```js
app.use((err, req, res, next) => {
  console.error("Error Trace:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  return res.status(statusCode).json({
    success: false,
    message: message,
  });
});
```

So error responses follow this structure:

```json
{
  "success": false,
  "message": "Product not found"
}
```

### Complete Response Flow

```text
Successful Request
       ↓
Controller
       ↓
ApiResponse
       ↓
success: true
       ↓
Client


Failed Request
       ↓
Controller
       ↓
next(error)
       ↓
Error Middleware
       ↓
success: false
       ↓
Client
```

---

# Request Logging

The server also contains a custom request logging middleware.

Every incoming request is logged with:

- Request time
- HTTP method
- Request URL
- Client IP

Example log:

```text
2026-08-24T10:30:00.000Z - GET - /products - IP: ::1
```

Logs are stored inside:

```text
Data/server.log
```

The directory and log file are automatically created when the server starts if they don't already exist.

The logging itself uses:

```js
fs.appendFile()
```

so existing logs are not overwritten.

---

# Products API

Products are stored in memory for now.

## Get All Products

### Endpoint

```http
GET /products
```

### Response

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": []
}
```

---

## Get Product By ID

### Endpoint

```http
GET /products/:id
```

Example:

```http
GET /products/1
```

### Response

```json
{
  "success": true,
  "message": "Product fetched successfully",
  "data": {
    "id": 1,
    "name": "Laptop",
    "price": 50000
  }
}
```

If the product does not exist, the centralized error handler returns:

```json
{
  "success": false,
  "message": "Product not found"
}
```

---

# Create Product

### Endpoint

```http
POST /products
```

This route is protected by the admin API key middleware.

### Header

```http
x-api-key: admin123
```

### Request Body

```json
{
  "name": "Laptop",
  "price": 50000,
  "stock": 10
}
```

### Example Response

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 3,
    "name": "Laptop",
    "price": 50000,
    "stock": 10
  }
}
```

---

# Update Product

### Endpoint

```http
PATCH /products/:id
```

Example:

```http
PATCH /products/1
```

### Request Body

```json
{
  "price": 45000
}
```

Only the fields that need to be changed have to be sent.

---

# Delete Product

### Endpoint

```http
DELETE /products/:id
```

This route requires the admin API key.

### Header

```http
x-api-key: admin123
```

### Response

```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": null
}
```

---

# Admin Authentication

Admin-protected routes currently use a simple API key middleware.

The expected header is:

```http
x-api-key: admin123
```

For example:

```text
x-api-key: admin123
```

If the API key is missing or incorrect, the request will be rejected.

> This is only a simple authentication mechanism for this project. In a production application, proper authentication and authorization should be implemented.

---

# Orders API

## Get All Orders

### Endpoint

```http
GET /orders
```

Returns all currently created orders.

---

## Get Order By ID

### Endpoint

```http
GET /orders/:id
```

Example:

```http
GET /orders/1
```

---

# Create Order

### Endpoint

```http
POST /orders
```

### Request Body

```json
{
  "productId": 1,
  "quantity": 2
}
```

When an order is created, the backend performs the following checks:

```text
Request
  ↓
Validate productId
  ↓
Validate quantity
  ↓
Find product
  ↓
Check product stock
  ↓
Create order
  ↓
Reduce product stock
  ↓
Return response
```

---

## Order Validation

Before creating the order, the backend checks:

### 1. Product ID

The `productId` must be provided and must point to an existing product.

### 2. Quantity

The quantity must be valid.

### 3. Stock

The requested quantity cannot be greater than the available stock.

For example, if the product has:

```text
Stock: 5
```

and the request contains:

```json
{
  "productId": 1,
  "quantity": 7
}
```

the order will not be created.

---

# Stock Management

When an order is successfully created, the product stock is reduced.

Example:

Before order:

```text
Stock = 10
```

Customer orders:

```text
Quantity = 3
```

After order:

```text
Stock = 7
```

This logic is handled on the backend, so the frontend does not need to manually update the product stock.

---

# Checkout API

Checkout is handled separately from order creation.

### Endpoint

```http
POST /checkout
```

### Request Body

```json
{
  "amount": 5000
}
```

The checkout controller sends the amount to the fake payment service.

---

# Fake Payment Service

The payment logic is separated into its own service:

```text
services/payment.service.js
```

The purpose of keeping payment logic inside a service is to keep the controller focused on handling the request instead of putting all payment logic directly inside the route/controller.

The payment service returns a Promise and uses `setTimeout()` to simulate an asynchronous payment process.

Flow:

```text
POST /checkout
      ↓
Checkout Controller
      ↓
Payment Service
      ↓
Process Payment
      ↓
Promise Resolve / Reject
      ↓
ApiResponse / Error Middleware
      ↓
Client
```

---

# Payment Rules

For the fake payment gateway:

```text
Amount <= 50000
       ↓
Payment Successful
```

and:

```text
Amount > 50000
       ↓
Payment Failed
```

This is only a fake payment implementation for testing the backend flow. It does not connect to any real payment provider.

---

# Async/Await

Asynchronous operations are handled using `async/await`.

For example:

```js
try {
  const result = await processPayment(amount);

  return new ApiResponse(
    res,
    200,
    "Payment successful",
    result
  );
} catch (error) {
  next(error);
}
```

This keeps asynchronous controller logic readable and allows errors to be passed to the centralized error middleware.

---

# HTTP Status Codes

The API uses standard HTTP status codes depending on the result.

| Status | Meaning |
|---|---|
| `200` | Request successful |
| `201` | Resource created |
| `400` | Bad request / validation error |
| `401` | Unauthorized |
| `404` | Resource not found |
| `500` | Internal server error |

The exact status code depends on the situation handled by the controller.

---

# Frontend Integration

Frontend developers only need the following base URL:

```text
http://localhost:3000
```

## Products

```text
GET     /products
GET     /products/:id
POST    /products
PATCH   /products/:id
DELETE  /products/:id
```

## Orders

```text
GET     /orders
GET     /orders/:id
POST    /orders
```

## Checkout

```text
POST    /checkout
```

---

# Frontend Request Examples

## Get Products

```js
const response = await fetch("http://localhost:3000/products");

const result = await response.json();

console.log(result.data);
```

Because the API follows a consistent response structure, the actual payload will be available inside:

```js
result.data
```

For example:

```js
const products = result.data;
```

---

## Create Order

```js
const response = await fetch("http://localhost:3000/orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    productId: 1,
    quantity: 2,
  }),
});

const result = await response.json();
```

Then:

```js
if (result.success) {
  console.log(result.data);
}
```

---

## Admin Request

For protected product APIs, send the API key in the request headers:

```js
const response = await fetch("http://localhost:3000/products", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "admin123",
  },
  body: JSON.stringify({
    name: "Laptop",
    price: 50000,
    stock: 10,
  }),
});
```

---

# Important Frontend Note

All successful API responses follow this structure:

```json
{
  "success": true,
  "message": "Some message",
  "data": {}
}
```

So frontend code should generally read the actual response data from:

```js
response.data
```

For errors:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

So the frontend can display:

```js
response.message
```

This makes handling API responses predictable across different endpoints.

---

# Complete Backend Flow

The overall backend flow is:

```text
Client
  ↓
Express Server
  ↓
Request Logger Middleware
  ↓
Route
  ↓
Controller
  ↓
Business Logic
  ↓
Service (when required)
  ↓
ApiResponse
  ↓
HTTP Response
```

If something goes wrong:

```text
Client
  ↓
Express Server
  ↓
Route
  ↓
Controller
  ↓
Error
  ↓
next(error)
  ↓
Central Error Middleware
  ↓
HTTP Error Response
```

---

# Current Architecture

The backend currently follows a basic separation of responsibilities:

### Routes

Routes define the API endpoints and connect them with controllers.

### Controllers

Controllers handle incoming requests and contain the main request-level business logic.

### Middleware

Middleware handles functionality that needs to run before or around the controller, such as admin authentication and request logging.

### Services

Services contain reusable business functionality that should stay separate from controllers.

Currently, the fake payment logic is handled through:

```text
services/payment.service.js
```

### ApiResponse

`ApiResponse` handles the common structure of successful API responses.

### Error Middleware

The central error middleware handles errors from the application and returns a consistent error response.

---

# Data Storage

This project currently does **not use a database**.

Products and orders are stored in memory.

Because of this:

```text
Server Restart
      ↓
Application Memory Reset
      ↓
Data Reset
```

So any newly created products or orders will be lost when the server restarts.

A database can be added later without changing the overall API structure.

---

# Summary

The current backend provides:

- Product CRUD APIs
- Order APIs
- Product stock management
- Admin API key protection
- Fake payment gateway
- Separate payment service
- Request logging
- Async/await based asynchronous handling
- Centralized error handling
- Centralized success response handling
- Consistent API response structure
- REST-style API endpoints
- In-memory data storage

The main response architecture is:

```text
SUCCESS
   ↓
ApiResponse
   ↓
{
  success: true,
  message: "...",
  data: ...
}
```

and for errors:

```text
ERROR
   ↓
next(error)
   ↓
Central Error Middleware
   ↓
{
  success: false,
  message: "..."
}
```

This keeps the controllers cleaner and gives the frontend a predictable response structure across the complete backend.