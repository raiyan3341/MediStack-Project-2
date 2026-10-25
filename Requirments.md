# Project: MediStock — Healthcare Supply & Inventory Management Platform

## 1. Project Overview

Build a professional, real-world healthcare supply and inventory management website called **MediStock**. It is a centralized healthcare supply management platform for pharmacies, hospitals, clinics, and ordinary users.

This is NOT a traditional e-commerce website. Its primary purpose is to help pharmacies and hospitals find and order essential medical products, manage restocking requests, and maintain detailed organization-wise order histories. It must also include a public blood donation and donor-finding system for ordinary users.

The website should be modern, formal, visually attractive, easy to understand, responsive, and practical for everyday use. Keep the project manageable for a student portfolio while implementing all essential features properly.

## 2. Preferred Technology Stack

- Frontend: Nextjs and Typescript
- Styling: Tailwind CSS
- Icons: Lucide React
- Authentication: Firebase Authentication with Google Sign-In
- Database: MongoDB
- Backend: Node.js and Express.js
- Document uploads: Firebase Storage or another securely configured file-storage solution
- Notifications and confirmation messages: SweetAlert2 or an equivalent notification library
- Charts: Recharts for simple dashboard reports

If an existing repository uses a different established stack, inspect it first and follow the existing architecture rather than unnecessarily rebuilding everything. Never expose Firebase secrets, service credentials, database credentials, or private API keys in client-side code.

## 3. User Roles and Permissions

Implement four main account roles with clear, separate dashboards and permissions.

### A. Normal User

A normal user can:

- Sign in or register using Google Authentication.
- Browse the public homepage and medical product catalog.
- Search products by name and filter them by category.
- View public product information, such as product name, image, category, and basic description.
- Access the blood donation system.
- Register a blood donor profile and manage its availability.
- Search for potential blood donors by blood group and location.
- Submit or respond to blood donation requests through the platform.
- Submit product suggestions or contact the support team.
- Manage personal profile information and account settings.

Normal users must not access hospital/pharmacy ordering, organization management, or administrative functions without the required approved role.

### B. Pharmacy / Hospital / Clinic User

Organizations must first sign in using Google and complete a separate organization registration form.

Collect appropriate information, including:

- Organization name.
- Organization type: Pharmacy, Hospital, or Clinic.
- Owner or authorized representative's name.
- Contact number and business email.
- Address, city, and area.
- Trade license, pharmacy license, hospital registration, or another relevant supporting document.
- Additional identification or documents when required for verification.

Display a clear verification status: Pending, Approved, or Rejected.

Until an administrator approves the organization, it must not be able to place supply orders.

After approval, the organization dashboard should allow authorized users to:

- Browse and search available products.
- Filter products by category, price, availability, and other useful attributes.
- Add products to the cart.
- Adjust quantities and remove items.
- Submit a supply/restocking order.
- See available stock and clearly identify unavailable products.
- Request a new product if it is missing from the catalog.
- Submit a special supply request with the requested item name, quantity, and explanation.
- View current order status and previous orders.
- Open individual orders to see products, quantities, prices, dates, and status history.
- Download or print an order summary or invoice.
- Update authorized organization information and contact details.
- Receive order updates and relevant low-stock or availability notifications.

Every organization's orders must be associated with its own organization ID. The organization must never be able to access another organization's private order history or documents.

### C. Admin

Administrators manage day-to-day platform operations.

The admin dashboard must provide:

**Product Management**
- Add, edit, activate, deactivate, and remove products.
- Upload product images.
- Assign products to categories.
- Manage product descriptions, SKU, manufacturer, unit, price, and available stock.
- Update stock quantities.
- Store relevant medicine batch and expiry information.
- View low-stock items and near-expiry alerts.
- Prevent accidental ordering of unavailable or insufficient stock.

**Organization Management**
- View all registered pharmacies, hospitals, and clinics.
- Review submitted registration information and supporting documents.
- Approve or reject registration applications with a reason.
- View an organization's complete order history and account status.
- Suspend or reactivate an organization when necessary.

**Order Management**
- View and search all incoming orders.
- Filter orders by organization, order date, order status, and organization type.
- Open any order and inspect its items and quantities.
- Update statuses such as Pending, Confirmed, Processing, Shipped, Delivered, or Cancelled.
- Record rejection or cancellation reasons.
- Keep a consistent order status history.
- Ensure inventory quantities are adjusted safely when orders are confirmed or fulfilled, according to a consistent stock-reservation workflow.

**Product Demand Requests**
- Review new-item requests and special supply requests.
- Approve, reject, or mark requests as under review.
- Convert approved requests into catalog items when appropriate.
- Notify the requesting organization when the request is updated.

**Reports**
- View total orders, pending orders, delivered orders, registered organizations, and products.
- Identify frequently ordered products and low-stock products.
- See organization-wise order summaries.
- Generate simple date-filtered order reports and downloadable CSV reports.

### D. Owner / Super Admin

The Owner has full control over the platform and administrative users.

The Owner can:

- Access every administrative feature.
- View and manage all users, organizations, products, orders, and reports.
- Promote an eligible user to Admin.
- Demote an Admin to a normal user or another permitted role.
- Activate, suspend, or remove administrative access.
- Review administrative activity and important account changes.
- Manage platform settings and categories.
- View an audit log of important administrative actions.

Only the Owner can assign or remove the Admin role. Public registration must never allow anyone to become an Owner or Admin.

Create a secure initial Owner setup using a protected seed process, environment configuration, or another server-controlled mechanism.

## 4. Medical Product Catalog

Create a structured catalog with attractive category cards, product images, search, filters, and detailed product pages.

Include categories such as:

- Cold, Cough and Fever Medicines
- Gastric and Digestive Medicines
- Blood Pressure and Cardiovascular Medicines
- Diabetes Care
- First Aid and Wound Care
- Creams, Ointments and Skin Care
- Syrups and Liquid Medicines
- Tablets and Capsules
- Masks and Protective Equipment
- Thermometers and Temperature Monitoring
- Medical Devices and Equipment
- Syringes, Gloves and Disposable Supplies
- Sanitizers, Disinfectants and Hygiene Products
- Other Medical Supplies

Administrators should be able to create additional categories without changing the application code.

Each product should support appropriate fields such as:

- Product name and image.
- SKU or product code.
- Category and subcategory.
- Brand or manufacturer.
- Basic description and unit of measurement.
- Price and available quantity.
- Availability status.
- Batch number and expiry date for relevant products.
- Prescription-required indicator when applicable.

Search should support partial product names and useful keywords. Filters should include category, brand, availability, and price range where appropriate.

Products organized by condition or symptom must not be presented as personalized medical recommendations. Display suitable prescription warnings and a simple notice advising users to consult qualified healthcare professionals when appropriate.

## 5. Organization-Wise Orders and Purchase History

This is one of the most important parts of the project.

Create a dedicated organization profile page for every approved pharmacy, hospital, and clinic within the admin dashboard.

For example, an administrator should be able to open "ABC Pharmacy" and see:

- Organization information and verification status.
- Total orders placed.
- Pending and completed orders.
- Complete historical order list.
- Items ordered, quantities, dates, prices, and status.
- Most frequently ordered products.
- Previous invoices and order summaries.
- Outstanding or cancelled orders where applicable.

The same information must be available separately for each hospital, pharmacy, or clinic.

Add a global order management table so administrators can quickly identify which organization placed an order today and what it requested.

Support search, sorting, pagination, and date filters.

## 6. Blood Donation and Donor-Finding System

Build a useful blood donation section accessible to normal users.

Users should be able to register as donors and maintain an optional donor profile containing:

- Name or display name.
- Blood group.
- City and area.
- Contact method.
- Last donation date, if provided.
- Availability status.
- Voluntary consent to participate in donor searches.

Implement the following features:

- Browse or search donors by blood group, city, or area.
- Filter results to display available donors.
- Allow donors to update their availability or temporarily hide their profile.
- Create a blood request containing blood group, required date, hospital/location, and contact information.
- Allow donors or registered users to respond to a request.
- Notify the relevant parties about new requests and responses.
- Let users manage, close, or mark their requests as fulfilled.

Protect donor privacy. Do not publicly expose private telephone numbers, precise residential addresses, or sensitive personal information without explicit consent. Use a controlled contact or request mechanism.

Display a clear disclaimer that this platform connects potential donors and recipients; it does not guarantee donor availability, blood compatibility, or medical suitability. Hospitals and qualified professionals must handle medical screening and transfusion decisions.

## 7. Additional Useful Features

Implement these features without making the project unnecessarily complex.

### Low-Stock Alerts
Administrators should receive dashboard alerts when product stock drops below a configurable threshold.

### Medicine Expiry Monitoring
Display relevant batches approaching their expiry dates. Prevent expired batches from being presented as available for ordering.

### Product Demand Suggestions
Organizations can request items that do not exist in the catalog, helping administrators understand real demand.

### Notifications
Display in-app notifications for registration approval/rejection, order status updates, product-request responses, and relevant blood donation activity.

### Order Summary and Invoice
Provide printable order summaries with order number, organization details, item list, quantities, totals, dates, and current status. Keep invoices consistent with recorded order information.

### Dashboard Analytics
Use simple charts and statistic cards to summarize important activity. Do not fill the dashboard with unnecessary graphs.

### Activity Logs
Record important actions such as product creation, stock changes, organization approvals, order status changes, and Admin role changes. Show the relevant logs to authorized administrators and the Owner.

## 8. Required Pages and Navigation

### Public Website

**Navbar:** Logo, Home, Products, Blood Donation, How It Works, About Us, Contact, Login/Profile.

**Homepage:**
- Professional hero section explaining the platform.
- Search bar for medical products.
- Medical supply category cards.
- Featured or frequently requested products.
- A section explaining how hospitals and pharmacies restock.
- Steps for registering and getting organization approval.
- Blood donation call-to-action.
- Benefits for healthcare organizations.
- Contact/help section.
- Professional footer with useful links and privacy information.

**Additional public pages:**
- Product catalog.
- Product details.
- Blood donor search.
- Blood donation request details.
- Organization registration and verification application.
- About Us.
- Contact and Support.
- Login and authentication callback.
- Privacy Policy and Terms pages.

### Normal User Dashboard

Create a simple dashboard with profile settings, blood donor profile, donation requests, request history, notifications, and account management.

### Organization Dashboard

Use a consistent sidebar with:

- Overview.
- Browse Products.
- Categories.
- Shopping Cart.
- Place Order.
- My Orders.
- Order History.
- Request a New Product.
- Notifications.
- Organization Profile and Verification Status.
- Help and Support.

### Admin Dashboard

Provide the following sections:

- Overview.
- Product and Category Management.
- Inventory and Expiry Alerts.
- Orders.
- Organization Verification.
- Organization Directory.
- Product Demand Requests.
- Users.
- Blood Donation Moderation where needed.
- Reports.
- Activity Logs.
- Profile and Settings.

### Owner Dashboard

Provide:

- Platform Overview.
- Users and Role Management.
- Admin Management.
- Organizations.
- Products and Inventory.
- Orders.
- Reports and Analytics.
- Audit Logs.
- Platform Settings.

Keep both Admin and Owner dashboards consistent in appearance while enforcing their different permissions.

## 9. UI/UX and Visual Design Requirements

Design the website as a professional healthcare technology product, not as a generic shopping template.

Use a clean, formal visual identity with:

- Deep navy or blue as the primary color.
- Teal or healthcare green as a secondary accent.
- White and light-neutral backgrounds.
- Carefully used colorful category icons and status indicators.
- Lucide icons across navigation, cards, tables, buttons, and empty states.
- Clear typography and consistent spacing.
- Soft shadows, subtle borders, and moderately rounded cards.
- Subtle hover effects and tasteful animations.
- Attractive charts and well-designed data tables.
- Consistent loading, error, success, and empty states.

Avoid excessive gradients, giant decorative elements, unnecessary animations, and overly colorful dashboard layouts.

Use a professional sidebar for desktop dashboards. On mobile, provide a compact responsive menu and appropriately adapted tables, filters, and product cards.

Make the main actions obvious. For example, an admin should quickly find "Add Product," an organization should easily find "Place Order," and the Owner should quickly find "Manage Admins."

Use confirmation dialogs for destructive actions. Clearly show verification badges and order statuses without relying on color alone.

Every page must be responsive and usable on desktop, tablet, and mobile devices.

## 10. Authentication, Data Security, and Authorization

Use Firebase Google Authentication for user sign-in.

After authentication, create or retrieve the corresponding user profile in MongoDB. Store a stable Firebase UID as the account identifier.

Use secure backend authentication and verify Firebase ID tokens on protected API requests.

Implement role-based access control on both the frontend and backend. Hiding a button or dashboard link is not sufficient security.

Required rules:

- Normal users cannot call admin-only APIs.
- Organizations can access only their own private organization data and orders.
- Pending or rejected organizations cannot place orders.
- Only approved administrative permissions allow product and inventory management.
- Only the Owner can change Admin permissions.
- No public user can assign their own role.
- Only authorized users can access uploaded organization documents.
- Donor profiles and blood requests must follow consent and privacy rules.
- Validate all inputs on the server.
- Protect against unauthorized document access, duplicate orders, and concurrent stock updates.
- Store secrets in environment variables.
- Use safe error messages and secure file-upload validation.

Maintain a clear separation between public catalog information, private organization information, donor information, and restricted administrative data.

## 11. Suggested Database Collections

Use well-structured MongoDB collections with appropriate references and validation.

**users:** Firebase UID, name, email, profile image, role, account status, created date.

**organizations:** Organization ID, owner/user references, organization name, type, address, contact information, submitted document references, verification status, reviewer, and approval history.

**categories:** Name, description, icon, image, active status.

**products:** Name, SKU, category, manufacturer, description, image, price, unit, prescription-required flag, active status, and relevant inventory references.

**inventoryBatches:** Product ID, batch number, available quantity, expiry date, and stock update information where batch tracking applies.

**carts:** User/organization reference and selected items with quantities.

**orders:** Order number, organization ID, items, price snapshots, total, status, timestamps, status history, and invoice reference.

**productRequests:** Organization ID, requested item, requested quantity, message, review status, and admin response.

**donorProfiles:** User ID, blood group, area, availability, contact preferences, donation information, and consent settings.

**bloodRequests:** Request creator, blood group, required date, location, contact method, status, and responses.

**notifications:** Recipient ID, type, message, read status, and timestamp.

**activityLogs:** Actor, action, affected record, timestamp, and relevant audit information.

Adapt the schema when necessary. Avoid duplicating sensitive data and use proper references between collections.

## 12. Order and Inventory Rules

Implement a reliable order workflow:

1. An approved organization browses the catalog and adds items to its cart.
2. The backend validates current prices, product availability, and quantities.
3. The organization submits the order.
4. The order appears in the administrator's order management dashboard.
5. The administrator confirms, processes, or rejects the order.
6. Inventory is updated through a consistent, concurrency-safe stock-reservation or fulfillment process.
7. The organization can track order status and review its order history.
8. After delivery, the order is marked Delivered and retained in the historical records.

Prevent duplicate submissions and negative inventory. Ensure stock reservation and release rules are consistent when an order is cancelled or rejected. Never trust prices or stock quantities supplied by the frontend.

Keep payment integration optional. For the first version, support order confirmation, recorded totals, and printable invoices without requiring an online payment gateway.

## 13. Development and Implementation Instructions

Before writing code:

1. Inspect the existing project structure and dependencies.
2. Identify the current frontend, backend, routes, authentication, database configuration, and existing reusable components.
3. Preserve working functionality and avoid unnecessary rewrites.
4. Create a clear, maintainable folder structure and reusable UI components.

Then implement the full working project rather than only generating a design or static mockup.

Requirements:

- All important buttons and forms must work.
- All CRUD operations must connect to the backend and database.
- Authentication and permissions must be enforced.
- Search, filters, pagination, and status updates must function correctly.
- All dashboards must display data relevant to their role.
- Add suitable loading indicators, validation messages, success notifications, error handling, and empty states.
- Provide realistic seed/demo data for development, clearly distinguishable from production data.
- Include an example environment file without real secrets.
- Provide database initialization or seed instructions.
- Include setup instructions for Firebase Authentication, document storage, MongoDB, and the backend.
- Ensure the project starts without missing dependencies, broken imports, or console errors.
- Test the main user flows and access-control boundaries.
- Do not leave essential features as non-functional placeholder buttons.

If an external service requires credentials, document the required configuration and handle the unconfigured state gracefully. Never pretend that a real notification, email, payment, or upload succeeded when it did not.

## 14. Final Expected Result

Deliver a complete, professional, responsive healthcare supply and inventory management platform with:

- Public product browsing and search.
- Google login.
- Organization registration and document verification.
- Role-specific dashboards.
- Owner-controlled Admin permissions.
- Product and category management.
- Inventory, expiry, and low-stock monitoring.
- Pharmacy/hospital ordering and organization-wise order history.
- Product demand requests.
- Order tracking and printable invoices.
- Public blood donor search and donation requests.
- Notifications, reporting, and activity logs.
- Secure backend APIs and proper data separation.

**Final priority:** Make the project practical, visually polished, easy for non-technical users, and reliable. Implement every core requirement, but avoid unnecessary enterprise-level complexity. Prioritize clean workflows, clear navigation, secure permissions, and a complete working experience over adding too many advanced features.