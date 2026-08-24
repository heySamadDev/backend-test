# MiniStore Backend API — Reference

Ye document MiniStore backend ko samajhne aur frontend se APIs integrate karne ke liye hai.

Backend **Node.js + Express.js** par bana hai. Is project me abhi database use nahi ho raha, data in-memory arrays me store ho raha hai.

# 1. Backend Overview

MiniStore ek small electronics store ka backend hai.

Currently backend me mainly 3 parts hain:

```text
Products
Orders
Checkout / Payment
```

Products ko manage karne ke liye CRUD APIs hain.

Orders ke liye product select karke quantity ke basis par order create hota hai. Order create hone ke baad product ka stock automatically reduce hota hai.

Checkout ke liye ek **fake payment service** bani hui hai jo asynchronous payment gateway jaisa behavior simulate karti hai.

---

# 2. Tech Stack

```text
Node.js
Express.js
JavaScript
Postman / Thunder Client
In-memory Arrays
```

Database intentionally use nahi kiya gaya hai because ye project Express.js ke routing, middleware, business logic, async flow aur error handling ko practice karne ke liye hai.

Server restart hone par in-memory data reset ho jayega.

---

# 3. Basic Folder Structure

Project ko responsibilities ke according separate rakha gaya hai.

```text
backend-test/
│
├── controllers/
│   ├── productController.js
│   ├── orderController.js
│   └── checkout.controller.js
│
├── routes/
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   └── checkout.routes.js
│
├── services/
│   └── payment.service.js
│
├── middleware/
│   └── adminMiddleware.js
│
├── Data/
│   └── server.log
│
├── server.js
└── REFFERENCE.md
```

Simple words me:

```text
routes      → URL handle karte hain
controllers → actual API logic
services    → reusable external/business service logic
middleware  → request ke beech me checks/processes
server.js   → application ko setup karta hai
```

---

# 4. Server

Server currently port `3000` par run ho raha hai.

Base URL:

```text
http://localhost:3000
```

Agar frontend locally run kar raha hai, toh APIs isi base URL se hit hongi.

---

# 5. Request Flow

Backend me request ka basic flow ye hai:

```text
Frontend
   ↓
Express Server
   ↓
express.json()
   ↓
Logger Middleware
   ↓
Route
   ↓
Controller
   ↓
Business Logic
   ↓
Response
```

Agar request ke during error aata hai:

```text
Controller
    ↓
next(error)
    ↓
Central Error Middleware
    ↓
Error Response
```

Iska matlab controller ke andar har jagah manually error response bhejne ki zarurat nahi hai.

---

# 6. JSON Body

Backend me:

```js
app.use(express.json());
```

use kiya gaya hai.

Isliye frontend se agar JSON body bheji ja rahi hai toh controller me wo:

```js
req.body
```

ke through available hogi.

Example:

```json
{
  "productId": 1,
  "quantity": 2
}
```

Controller me:

```js
const { productId, quantity } = req.body;
```

---

# 7. Products API

Products ke liye CRUD APIs available hain.

## GET `/products`

Saare products return karta hai.

```http
GET /products
```

Frontend se simple GET request karni hai.

Example response conceptually:

```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "Keyboard",
      "price": 1200,
      "stock": 5
    },
    {
      "id": 2,
      "name": "Mouse",
      "price": 600,
      "stock": 10
    }
  ]
}
```

---

# 8. Get Single Product

```http
GET /products/:id
```

Example:

```http
GET /products/1
```

Yaha `1` product ID hai.

Backend me ID:

```js
req.params.id
```

se milti hai.

Agar product mil gaya toh product return hoga.

Agar product nahi mila:

```text
404 Not Found
```

return hoga.

---

# 9. Create Product

```http
POST /products
```

Ye protected API hai, matlab request me admin API key bhejni padegi.

Header:

```text
x-api-key: admin123
```

Request body:

```json
{
  "name": "Monitor",
  "price": 15000,
  "stock": 5
}
```

Required fields:

```text
name
price
stock
```

Validation:

```text
price > 0
stock >= 0
```

Agar request valid hai:

```text
201 Created
```

Agar request invalid hai:

```text
400 Bad Request
```

Agar API key missing ya wrong hai:

```text
403 Forbidden
```

---

# 10. Update Product

```http
PATCH /products/:id
```

Example:

```http
PATCH /products/1
```

Body me allowed product fields bheje ja sakte hain.

Example:

```json
{
  "price": 1500,
  "stock": 8
}
```

Agar product exist nahi karta:

```text
404 Not Found
```

---

# 11. Delete Product

```http
DELETE /products/:id
```

Example:

```http
DELETE /products/1
```

Ye bhi protected operation hai.

Header:

```text
x-api-key: admin123
```

Wrong/missing API key:

```text
403 Forbidden
```

Product nahi mila:

```text
404 Not Found
```

Successful delete:

```text
200 OK
```

---

# 12. Admin API Key

Abhi proper authentication/JWT nahi hai.

Protected product operations ke liye simple API key use ki gayi hai.

Frontend/admin request me header:

```text
x-api-key: admin123
```

bhejna hoga.

Flow:

```text
Request
   ↓
Admin Middleware
   ↓
API key check
   ↓
Correct?
 ┌───────┴───────┐
Yes              No
 ↓                ↓
next()           403
 ↓
Controller
```

Important: API key ko frontend code me hardcode karna production security ke liye recommended nahi hai. Ye assignment ke scope me simple API-key middleware practice ke liye hai.

---

# 13. Orders API

Orders ke liye currently 3 basic operations hain:

```text
GET /orders
GET /orders/:id
POST /orders
```

---

# 14. Get All Orders

```http
GET /orders
```

Ye currently created saare orders return karega.

Agar abhi koi order create nahi hua hai, toh empty array milega.

---

# 15. Get Single Order

```http
GET /orders/:id
```

Example:

```http
GET /orders/1
```

Agar order mil gaya toh order return hoga.

Agar order nahi mila:

```text
404 Not Found
```

---

# 16. Create Order

```http
POST /orders
```

Frontend ko body me ye data bhejna hai:

```json
{
  "productId": 1,
  "quantity": 2
}
```

Yaha:

```text
productId → jis product ko order karna hai
quantity  → kitne units order karne hain
```

---

# 17. Order Create Hone ka Actual Flow

Order API me directly order create nahi hota.

Backend pehle kuch validations karta hai.

Flow:

```text
POST /orders
      ↓
productId + quantity read
      ↓
Required fields check
      ↓
quantity check
      ↓
Product find
      ↓
Stock check
      ↓
Order create
      ↓
Product stock reduce
      ↓
Response
```

---

# 18. Order Validation

### Product ID ya quantity missing

```json
{
  "productId": 1
}
```

ya:

```json
{
  "quantity": 2
}
```

Invalid request:

```text
400 Bad Request
```

---

### Quantity 1 se kam

Example:

```json
{
  "productId": 1,
  "quantity": 0
}
```

Ye valid order nahi hai.

Response:

```text
400 Bad Request
```

---

### Product exist nahi karta

Example:

```json
{
  "productId": 999,
  "quantity": 2
}
```

Agar product ID `999` available nahi hai:

```text
404 Not Found
```

---

### Stock available nahi hai

Suppose:

```text
Product stock = 5
Requested quantity = 8
```

Order create nahi hoga.

Response:

```text
400 Bad Request
```

Stock check karna important hai because backend ko unavailable quantity ka order create nahi karna chahiye.

---

# 19. Stock Automatically Reduce Hota Hai

Agar order successful hai:

```text
Current stock = 5
Order quantity = 2
```

Order create hone ke baad:

```text
New stock = 3
```

So:

```text
Before order:

Keyboard
stock: 5

       ↓

Order quantity: 2

       ↓

After order:

Keyboard
stock: 3
```

Ye stock update backend ke order business logic ka part hai.

Frontend ko manually stock calculate/update karne ki zarurat nahi hai.

Frontend simply order create karega; backend stock update karega.

---

# 20. Successful Order

Valid request:

```json
{
  "productId": 1,
  "quantity": 2
}
```

Agar:

- product available hai
- quantity valid hai
- stock enough hai

toh order create hoga.

Response status:

```text
201 Created
```

Aur product ka stock reduce ho jayega.

---

# 21. Checkout API

Checkout ke liye endpoint hai:

```http
POST /checkout
```

Frontend ko body me amount bhejna hai:

```json
{
  "amount": 5000
}
```

Important point:

**Ye real payment gateway nahi hai.**

Is project me ek fake payment service banayi gayi hai jo real payment gateway ka asynchronous behavior simulate karti hai.

---

# 22. Fake Payment Service

Payment logic controller me directly nahi rakhi gayi.

Separate service hai:

```text
services/
└── payment.service.js
```

Service ka main function:

```js
processPayment(amount)
```

Ye ek Promise return karta hai.

Payment ko asynchronous dikhane ke liye `setTimeout()` use kiya gaya hai.

Basic behavior:

```text
amount <= 50000
       ↓
   resolve()
       ↓
Payment successful
```

Aur:

```text
amount > 50000
       ↓
   reject()
       ↓
Payment failed
```

---

# 23. Successful Checkout

Frontend request:

```http
POST /checkout
```

Body:

```json
{
  "amount": 5000
}
```

Backend flow:

```text
POST /checkout
      ↓
Checkout Controller
      ↓
processPayment(5000)
      ↓
Promise
      ↓
setTimeout
      ↓
5000 <= 50000
      ↓
resolve()
      ↓
Success Response
```

Response:

```json
{
  "success": true,
  "message": "Payment successful"
}
```

Status:

```text
200 OK
```

---

# 24. Failed Checkout

Agar frontend:

```json
{
  "amount": 60000
}
```

bhejta hai, toh:

```text
60000 > 50000
```

isliye payment service Promise reject karegi.

Flow:

```text
POST /checkout
      ↓
Checkout Controller
      ↓
await processPayment(60000)
      ↓
Promise reject
      ↓
catch(error)
      ↓
next(error)
      ↓
Central Error Middleware
      ↓
500 Response
```

Response:

```json
{
  "success": false,
  "message": "Payment failed"
}
```

---

# 25. Why `async/await` + `try/catch`?

Checkout controller asynchronous hai because payment service Promise return karti hai.

Isliye:

```js
await processPayment(amount);
```

use kiya gaya hai.

Aur agar Promise reject hoti hai toh:

```js
try {
   await processPayment(amount);
} catch (error) {
   next(error);
}
```

error catch hota hai.

Yaha `catch` ka kaam error ko receive karna hai.

`next(error)` ka kaam us error ko Express ke centralized error middleware tak bhejna hai.

---

# 26. Central Error Handling

Backend me ek common error middleware hai.

Controllers se error:

```js
next(error);
```

ke through yaha aata hai.

Error middleware:

```text
Error
  ↓
next(error)
  ↓
Central Error Middleware
  ↓
statusCode
  ↓
message
  ↓
JSON response
```

Common response format:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

Agar error ke andar custom `statusCode` hai toh wahi use hota hai.

Otherwise default:

```text
500
```

use hota hai.

---

# 27. Why Central Error Middleware?

Suppose Product API me error aaya:

```text
Product not found
```

Order API me error aaya:

```text
Order not found
```

Payment me error aaya:

```text
Payment failed
```

Har controller me alag-alag response structure likhne ke bajaye sab errors ek common middleware me handle ho rahe hain.

Isse API response format consistent rehta hai.

---

# 28. HTTP Status Codes

Backend me currently important status codes:

| Status | Meaning |
|---|---|
| `200` | Request successfully complete |
| `201` | New product/order successfully created |
| `400` | Client ne invalid data bheja |
| `403` | API key missing/invalid |
| `404` | Requested product/order nahi mila |
| `500` | Unexpected server/payment error |

Frontend me response handle karte time in status codes ko dhyan me rakhna useful rahega.

---

# 29. Frontend Integration Quick Reference

Frontend developer ke liye main endpoints:

| Method | Endpoint | Body | Protected |
|---|---|---|---|
| GET | `/products` | — | No |
| GET | `/products/:id` | — | No |
| POST | `/products` | Product data | Yes |
| PATCH | `/products/:id` | Product fields | No |
| DELETE | `/products/:id` | — | Yes |
| GET | `/orders` | — | No |
| GET | `/orders/:id` | — | No |
| POST | `/orders` | `productId, quantity` | No |
| POST | `/checkout` | `amount` | No |

Base URL:

```text
http://localhost:3000
```

Example:

```text
GET http://localhost:3000/products
POST http://localhost:3000/orders
POST http://localhost:3000/checkout
```

---

# 30. Complete Backend Flow

Agar overall backend ko ek hi flow me samjhein:

```text
                    FRONTEND
                       │
                       ↓
                 HTTP REQUEST
                       │
                       ↓
                EXPRESS SERVER
                       │
                       ↓
                 MIDDLEWARES
                       │
                       ↓
                    ROUTE
                       │
                       ↓
                  CONTROLLER
                       │
              ┌────────┴────────┐
              ↓                 ↓
         Business Logic      Service
              │                 │
              │          Payment Service
              │                 │
              └────────┬────────┘
                       ↓
                    SUCCESS
                       │
                       ↓
                  HTTP RESPONSE
```

Error case:

```text
Controller / Service
        ↓
      Error
        ↓
   catch(error)
        ↓
   next(error)
        ↓
Central Error Middleware
        ↓
 JSON Error Response
```

---

# 31. Important Note for Frontend

Frontend ko backend ke business logic ko duplicate nahi karna hai.

For example, order create karte time frontend ko khud ye decide nahi karna:

```text
stock = stock - quantity
```

Backend already ye handle karta hai.

Frontend ka kaam:

```text
User selects product
        ↓
User selects quantity
        ↓
POST /orders
        ↓
Backend validates
        ↓
Backend creates order
        ↓
Backend reduces stock
        ↓
Frontend receives response
```

Similarly payment ke case me frontend sirf checkout request karega.

Fake payment processing backend service handle karegi.

---

# 32. Summary

MiniStore backend ka main idea simple hai:

```text
Products
   ↓
CRUD APIs

Orders
   ↓
Product + Quantity
   ↓
Stock Check
   ↓
Order Create
   ↓
Stock Reduce

Checkout
   ↓
Payment Service
   ↓
Promise
   ↓
Async Processing
   ↓
Resolve / Reject

Errors
   ↓
next(error)
   ↓
Central Error Middleware
```

Is project me focus sirf APIs banane par nahi hai. Main focus ye samajhna hai ki **request application ke andar kaise travel karti hai aur har layer ka kya responsibility hai.**

Agar frontend se integration karni hai, toh mainly endpoint, method, request body, required headers aur response/status code ko follow karna hai.

Backend ke andar agar kisi API me validation ya business rule fail hota hai, toh backend appropriate error response return karega.