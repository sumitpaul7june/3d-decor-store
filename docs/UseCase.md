# Use Case Document  
Home Decor & STL File E-Commerce Platform

---

## 1. Introduction

This document describes the **functional interactions** between users and the system using use cases.  
It helps in understanding system behavior from a user’s perspective.

---

## 2. Actors

| Actor | Description |
|------|------------|
| Guest User | Unregistered user browsing products |
| Registered User | Logged-in customer who can purchase |
| Admin | Manages products, users, and orders |

---

## 3. Use Case List

### Guest User Use Cases
- Browse Products
- View Product Details
- Register Account
- Login

---

### Registered User Use Cases
- Login
- Logout
- Add Product to Cart
- Remove Product from Cart
- Place Order
- View Profile
- View Order History
- Download Purchased STL Files

---

### Admin Use Cases
- Login
- Add Product
- Update Product
- Delete Product
- Manage Orders
- Manage Users

---

## 4. Detailed Use Case Descriptions

---

### Use Case 1: Browse Products

**Actor:** Guest User  
**Description:** Allows users to view available products.

**Precondition:** None  
**Postcondition:** Product list displayed

**Main Flow:**
1. User opens website
2. System displays product list

---

### Use Case 2: Register User

**Actor:** Guest User  
**Description:** Allows new users to create an account.

**Precondition:** User is not logged in  
**Postcondition:** User account created

**Main Flow:**
1. User enters registration details
2. System validates input
3. System creates user account

---

### Use Case 3: Place Order

**Actor:** Registered User  
**Description:** Allows user to purchase products.

**Precondition:** User is logged in  
**Postcondition:** Order is placed successfully

**Main Flow:**
1. User adds product to cart
2. User proceeds to checkout
3. User completes payment
4. System confirms order

---

### Use Case 4: Download STL File

**Actor:** Registered User  
**Description:** Allows user to download purchased STL files.

**Precondition:** User has purchased STL file  
**Postcondition:** STL file downloaded

**Main Flow:**
1. User opens profile
2. User selects purchased STL file
3. System verifies purchase
4. File download starts

---

### Use Case 5: Manage Products

**Actor:** Admin  
**Description:** Admin manages product catalog.

**Precondition:** Admin is logged in  
**Postcondition:** Product data updated

**Main Flow:**
1. Admin logs in
2. Admin adds/updates/deletes product
3. System saves changes

---

## 5. Conclusion

This use case document provides a **clear functional overview** of the system and acts as a foundation for design, development, and testing.
