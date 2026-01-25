SRS – Software Requirement Specification

(Technical / Development document)

1. Introduction
1.1 Purpose

This document provides a detailed description of functional and non-functional software requirements for the Home Decor & STL File E-commerce System.

1.2 Scope

The system will provide:

Product listing with images

User authentication

Cart and order management

Profile-based purchase history

Admin management panel

2. Overall Description
2.1 Product Perspective

The application is a web-based system consisting of:

Frontend (UI)

Backend (APIs & logic)

Database

2.2 User Classes
User Type	Description
Guest	Can browse products
Customer	Can purchase products
Admin	Manages system
3. Functional Requirements
3.1 User Authentication Module

Register user

Login user

Logout user

Password security

3.2 Product Module

Display product list

Display product details

Show images (PNG/JPG)

3.3 Cart & Order Module

Add to cart

Remove from cart

Checkout

Order confirmation

3.4 User Profile Module

View profile

View order history

Download purchased STL files

3.5 Admin Module

Add/update/delete products

Upload product images

Manage orders

Manage users

4. Non-Functional Requirements
4.1 Performance

Page load time < 3 seconds

4.2 Security

Encrypted passwords

Secure session handling

4.3 Usability

Simple navigation

Responsive UI

4.4 Reliability

System uptime

Error handling

5. System Requirements
Hardware

Server with sufficient storage

Client device with browser

Software

Frontend: HTML, CSS, JavaScript, React

Backend: Node.js 

Database: MySQL / MongoDB