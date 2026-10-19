# Dairy Farm Management System – Overall Feature Specification

## 1. Document Purpose

This document defines the functional requirements for a Dairy Farm Management System covering:

- Customer registration and OTP verification
- Customer milk subscriptions
- Daily milk delivery tracking
- Monthly billing and invoices
- Payment collection and outstanding management
- Dairy product sales
- Cow/farm management
- Cow breeding, mating and calving records
- Daily cow-wise milk production
- Customer, milk, cow and financial analytics
- Notifications and operational administration
- Historical data management for previous and current months

The system should support two primary application experiences:

1. **Customer Application** – customers manage their profile, milk requirement, deliveries, bills and payments.
2. **Admin Application** – farm administrators manage customers, subscriptions, delivery, cows, production, billing, collections and reports.

---

# 2. Product Goals

## 2.1 Business Goals

- Maintain a single source of truth for customer and farm records.
- Replace manual notebooks/spreadsheets for daily milk and billing operations.
- Maintain complete historical records.
- Accurately calculate monthly bills from actual deliveries.
- Track payment collection and outstanding balances.
- Monitor cow health, breeding, calving and milk production.
- Analyze production, sales, collection and customer consumption.
- Reduce billing disputes by showing daily delivery details.
- Prevent unauthorized changes to historical financial records.

## 2.2 Customer Goals

Customers should be able to:

- Register using their mobile number.
- Verify their mobile number through SMS OTP.
- Maintain their personal and delivery information.
- Request a milk subscription.
- Select daily milk quantity and delivery preferences.
- View actual daily deliveries.
- View monthly bills and invoices.
- View previous months.
- View payment history and outstanding balance.
- Request quantity changes.
- Pause and resume delivery.
- Purchase other dairy products.
- Receive important notifications.

---

# 3. User Roles

## 3.1 Customer

Customer can manage only their own:

- Profile
- Delivery address
- Milk subscription
- Delivery history
- Bills
- Invoices
- Payments
- Product orders
- Delivery pause/resume requests
- Complaints/requests

Customers must not be able to modify admin-controlled delivery, invoice or payment records directly.

## 3.2 Admin

Admin can:

- Manage customers
- Approve milk subscriptions
- Manage milk rates
- Manage daily deliveries
- Manage delivery routes/persons
- Manage products
- Manage cows
- Record cow production
- Manage breeding and calving
- Generate invoices
- Record payments
- Manage outstanding balances
- Run reports and analytics
- Manage users and permissions
- Review audit history

## 3.3 Optional Future Roles

- Delivery Person
- Farm Manager
- Accountant
- Veterinarian
- Super Admin

Role-based access control should be designed so these roles can be added later.

---

# 4. Customer Registration and Onboarding

## 4.1 Registration Flow

Recommended flow:

Customer opens application
→ Enters mobile number
→ Receives SMS OTP
→ Verifies OTP
→ Completes profile
→ Enters milk requirement
→ Provides delivery address
→ Submits milk request
→ Admin reviews
→ Admin approves
→ Subscription becomes active
→ Delivery starts

## 4.2 Mobile Verification

Required fields:

- Mobile number

Features:

- Send OTP
- Verify OTP
- Resend OTP
- OTP expiry
- Maximum verification attempts
- Change mobile number
- Rate limiting for OTP requests
- Verified mobile status

Mobile number should be the primary login/account identifier.

## 4.3 Customer Profile

### Mandatory

- Full name
- Verified mobile number
- Email address
- Address
- Area/City
- Pincode

### Optional

- Alternate mobile number
- Landmark
- Profile photo
- Delivery instructions

## 4.4 Delivery Address

Keep registered address and delivery address as separate concepts.

Fields:

- House/Flat number
- Street
- Area
- City
- State
- Pincode
- Landmark
- Delivery instructions

Option:

- Same as registered address

Customers should be able to update delivery information, subject to admin/business rules.

---

# 5. Milk Subscription

## 5.1 Customer Milk Requirement

Customer selects:

- Milk type
- Morning quantity
- Evening quantity
- Total daily quantity
- Delivery days
- Start date
- Preferred delivery period
- Delivery address

Example:

Morning: 1 L
Evening: 1 L
Total: 2 L/day

## 5.2 Milk Type

Support configurable milk types:

- Cow milk
- Buffalo milk
- Mixed milk
- Other farm-defined types

If the farm sells only one milk type, the selection can be hidden.

## 5.3 Quantity

Allow common quantities:

- 0.5 L
- 1 L
- 1.5 L
- 2 L
- 3 L
- 4 L
- Custom quantity

The system should support decimal quantities.

## 5.4 Delivery Days

Customer can select:

- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday
- Sunday

Default: all days.

## 5.5 Estimated Monthly Bill

Display an estimated amount before submitting the subscription.

Formula:

Estimated Monthly Amount =
Estimated Delivery Days × Daily Quantity × Applicable Rate

The UI must clearly state that this is an estimate and actual billing is based on actual delivered quantity and applicable transactions.

---

# 6. Subscription Approval Workflow

Milk subscription should not automatically become active after registration.

Statuses:

- Draft
- Submitted
- Pending Approval
- Approved
- Rejected
- Active
- Paused
- Suspended
- Cancelled
- Completed

Workflow:

Customer submits request
→ Pending Approval
→ Admin reviews
→ Approved
→ Active

If rejected, admin should provide a reason.

Customer should see:

"Your milk subscription request has been submitted and is waiting for farm confirmation."

---

# 7. Subscription History

Never overwrite historical subscription values.

Example:

01-Aug: 2 L/day
10-Sep: 1 L/day
01-Oct: 2 L/day

Each change should create a new effective-dated record.

Store:

- Subscription ID
- Customer ID
- Milk type
- Morning quantity
- Evening quantity
- Total quantity
- Rate
- Effective from
- Effective to
- Delivery days
- Status
- Change reason
- Created by
- Created date

This is required for accurate historical billing.

---

# 8. Milk Rate Management

Admin manages rates separately.

Fields:

- Milk type
- Rate per litre
- Effective from
- Effective to
- Status
- Notes

Example:

Cow Milk:
01-Sep-2026 → ₹60/L
01-Oct-2026 → ₹62/L

Historical deliveries must retain the rate applicable on the delivery date.

Changing today's rate must never recalculate previous invoices.

---

# 9. Daily Milk Delivery

This is a core business module.

## 9.1 Delivery Record

Each delivery should store:

- Delivery ID
- Customer ID
- Subscription ID
- Date
- Morning quantity
- Evening quantity
- Total quantity
- Rate
- Amount
- Delivery status
- Delivery person
- Route
- Remarks
- Created by
- Created date
- Last modified by
- Last modified date

## 9.2 Delivery Status

Support:

- Scheduled
- Delivered
- Partial
- Missed
- Customer unavailable
- Holiday
- Cancelled
- Extra delivery

## 9.3 Actual vs Requested Quantity

The subscription quantity is the expected quantity.

The delivery transaction stores the actual quantity.

Example:

Requested: 2 L
Actual: 1 L

Billing should use the actual delivered quantity according to the farm's billing rules.

## 9.4 Bulk Daily Entry

Admin should be able to enter/update deliveries for multiple customers in one screen.

Example:

Customer | Required | Delivered | Status

Support:

- Bulk save
- Search
- Filter by route
- Filter by delivery person
- Filter by status
- Edit
- Exception handling

---

# 10. Customer Delivery History

Customer can view:

- Current month
- Previous month
- Custom date range

Daily display:

Date | Morning | Evening | Total | Status | Amount

Customer should be able to verify exactly what was delivered before the monthly invoice is generated.

---

# 11. Delivery Pause and Resume

Customers can temporarily pause delivery.

Fields:

- From date
- To date
- Reason
- Remarks

Reasons:

- Vacation
- Out of station
- Personal reason
- Other

Workflow:

Customer requests pause
→ Admin/business rules validate
→ Subscription becomes paused
→ Delivery schedule excludes paused period
→ Subscription resumes automatically or manually

---

# 12. Change Milk Quantity

Customer can request:

- Increase quantity
- Decrease quantity
- Change morning quantity
- Change evening quantity
- Change milk type

Changes must have:

- New quantity
- Effective date
- Request date
- Reason
- Approval status

Do not modify old delivery records.

---

# 13. Dairy Product Management

The farm can sell products in addition to milk.

Examples:

- Milk
- Curd
- Buttermilk
- Paneer
- Ghee
- Other dairy products

Product fields:

- Product ID
- Product name
- Description
- Unit
- Selling price
- Production cost
- Stock quantity
- Minimum stock level
- Active/inactive
- Tax configuration if applicable
- Product image

---

# 14. Product Sales / Orders

Customer can:

- Browse products
- View price
- Select quantity
- Place order
- View order status
- View order history

Admin can:

- Create/update products
- Manage stock
- View orders
- Update order status
- Add product charges to customer billing
- Cancel orders
- Track product sales

Order statuses:

- Pending
- Confirmed
- Preparing
- Out for delivery
- Delivered
- Cancelled

---

# 15. Monthly Billing

Monthly billing must be generated from transaction-level data.

## 15.1 Bill Components

A customer bill can contain:

- Current month milk charges
- Other dairy product charges
- Discounts
- Adjustments
- Previous outstanding
- Previous credit
- Payments/credits applicable to the period

Example:

Milk: ₹3,480
Curd: ₹200
Other products: ₹300
Subtotal: ₹3,980
Previous balance: ₹500
Total due: ₹4,480
Payment received: ₹3,000
Outstanding: ₹1,480

## 15.2 Billing Status

- Draft
- Generated
- Sent
- Partially Paid
- Paid
- Overdue
- Cancelled
- Adjusted

## 15.3 Month Closing

Admin workflow:

Generate bills
→ Review exceptions
→ Resolve corrections
→ Finalize invoices
→ Close month

Closed months should be read-only for normal operations.

Corrections after closing require authorized admin action and must create an audit record.

---

# 16. Invoice Management

Invoice fields:

- Invoice number
- Customer ID
- Billing period
- Invoice date
- Due date
- Invoice items
- Subtotal
- Discount
- Previous balance
- Total
- Amount paid
- Balance
- Status

Customer can:

- View invoice
- Download invoice
- View invoice details

Admin can:

- Generate
- Regenerate where permitted
- Cancel
- View
- Download
- Send invoice
- Search invoice
- Filter invoices

---

# 17. Payment and Collection Management

## 17.1 Payment Methods

Support:

- Cash
- UPI
- Bank transfer
- Card
- Online payment
- Other

## 17.2 Payment Record

Store:

- Payment ID
- Customer ID
- Invoice ID
- Amount
- Payment date
- Payment method
- Transaction/reference number
- Collected by
- Notes
- Status
- Created date

Customers should not be allowed to directly mark cash payments as paid.

Admin confirms cash collection.

## 17.3 Payment Status

- Pending
- Successful
- Failed
- Reversed
- Cancelled
- Awaiting confirmation

---

# 18. Customer Outstanding Management

For each customer:

Current invoice
+ Previous outstanding
- Payments
- Credits
= Current balance

Customer should see:

- Current bill
- Previous balance
- Total payable
- Paid amount
- Outstanding amount

Admin should see:

- Customer-wise outstanding
- Overdue amount
- Aging
- Last payment date
- Last payment method

---

# 19. Collection Analysis

Admin dashboard/report should show:

Cash collection
UPI collection
Bank transfer
Online payment
Other

Example:

Cash: ₹45,000
UPI: ₹62,000
Bank Transfer: ₹15,000
Online Payment: ₹10,000
Total: ₹1,32,000

Reports:

- Daily collection
- Weekly collection
- Monthly collection
- Payment method analysis
- Customer-wise collection
- Collector-wise collection
- Outstanding
- Overdue

---

# 20. Customer Dashboard

Customer dashboard should be simple.

Display:

- Today's milk delivery
- Current subscription
- Current month litres
- Current month bill
- Amount paid
- Outstanding amount
- Recent payment
- Recent delivery

Primary navigation:

- Home
- My Milk
- Deliveries
- Bills
- Payments
- Products
- Profile

---

# 21. Cow Management

Each cow requires an independent permanent record.

## 21.1 Basic Cow Information

- Cow ID
- Tag/ear tag number
- Name
- Breed
- Gender
- Date of birth
- Color
- Photo
- Purchase date
- Purchase price
- Supplier/source
- Current status
- Location/section
- Remarks

## 21.2 Cow Status

- Active
- Lactating
- Dry
- Pregnant
- Sold
- Deceased
- Under treatment
- Other

---

# 22. Cow Breeding / Mating

Maintain complete breeding history.

Fields:

- Cow ID
- Mating date
- Mating method
- Bull/semen reference
- Heat date
- Pregnancy status
- Pregnancy confirmation date
- Expected calving date
- Actual calving date
- Veterinarian
- Remarks

A cow can have multiple breeding records.

Do not overwrite previous mating history.

---

# 23. Pregnancy Tracking

Statuses:

- Not confirmed
- Suspected
- Confirmed
- Not pregnant
- Delivered
- Lost pregnancy

Admin dashboard should highlight:

- Pregnant cows
- Expected calving this month
- Expected calving next month
- Overdue calving

---

# 24. Calving / Birth Records

When a cow gives birth:

Store:

- Mother cow ID
- Calving date
- Calving type
- Number of calves
- Calf ID
- Calf gender
- Birth weight
- Health status
- Veterinary notes
- Remarks

Each calf should be capable of becoming its own animal record.

---

# 25. Calf Management

Calf record:

- Calf ID
- Mother ID
- Father/bull reference
- Birth date
- Gender
- Birth weight
- Breed
- Health status
- Vaccination history
- Current status
- Remarks

This supports future farm genealogy.

---

# 26. Cow Milk Production

Daily cow-wise production record:

- Cow ID
- Date
- Morning milk
- Evening milk
- Total milk
- Feed information if maintained
- Health status
- Remarks

Formula:

Total milk = Morning milk + Evening milk

Reports:

- Cow-wise daily production
- Weekly production
- Monthly production
- Average litres/day
- Highest producing cows
- Lowest producing cows
- Production trend

---

# 27. Cow Health Management

Health records:

- Cow ID
- Date
- Health status
- Symptoms
- Disease
- Veterinary visit
- Treatment
- Medicine
- Treatment cost
- Vaccination
- Next check-up
- Remarks

Admin should be able to see upcoming health activities.

---

# 28. Farm Milk Production

Farm-level daily production:

- Date
- Total cow production
- Milk available
- Customer milk requirement
- Milk delivered
- Milk used internally
- Milk wastage
- Remaining milk

Example:

Production: 85 L
Customer requirement: 72 L
Delivered: 68 L
Internal use: 5 L
Wastage: 2 L
Remaining: 10 L

The exact business formula should be configurable.

---

# 29. Admin Dashboard

Dashboard KPIs:

## Customers

- Total customers
- Active customers
- New customers
- Pending registration/subscription requests
- Paused customers
- Inactive customers

## Milk

- Today's production
- Today's scheduled delivery
- Today's delivered quantity
- Current month production
- Current month sales
- Average daily production

## Billing

- Current month billing
- Amount collected
- Outstanding
- Overdue
- Paid invoices
- Pending invoices

## Cows

- Total cows
- Lactating cows
- Dry cows
- Pregnant cows
- Upcoming calving
- Cows under treatment
- Average milk per cow

## Products

- Product sales
- Low stock products
- Top-selling products

---

# 30. Reports and Analytics

## 30.1 Customer Reports

- Customer list
- New customers
- Active customers
- Paused customers
- Customer-wise milk consumption
- Customer-wise monthly billing
- Customer payment history
- Customer outstanding
- Top customers

## 30.2 Milk Reports

- Daily production
- Monthly production
- Customer milk delivered
- Milk sold
- Milk remaining
- Milk wastage
- Milk consumption trend

## 30.3 Cow Reports

- Cow register
- Cow-wise production
- Average production
- Highest production
- Lowest production
- Lactating cows
- Dry cows
- Pregnant cows
- Upcoming calving
- Breeding history
- Health history

## 30.4 Financial Reports

- Daily sales
- Monthly sales
- Milk sales
- Product sales
- Daily collection
- Monthly collection
- Outstanding
- Overdue
- Payment method analysis
- Customer-wise collection
- Revenue trend
- Expense analysis
- Profit/loss if farm expenses are maintained

---

# 31. Notifications

## Customer Notifications

SMS/push/email as appropriate:

- OTP
- Registration confirmation
- Subscription submitted
- Subscription approved/rejected
- Delivery reminder
- Delivery completed
- Delivery missed/changed
- Subscription pause/resume
- Quantity change confirmation
- Invoice generated
- Payment received
- Payment failed
- Payment reminder
- Outstanding reminder

## Admin Notifications

- New customer registration
- New milk request
- Quantity change request
- Pause request
- Failed payment
- Overdue payment
- Low product stock
- Upcoming calving
- Cow health follow-up
- Important delivery exceptions

Notification preferences should be configurable.

---

# 32. Search and Filtering

Admin needs global search/filtering for:

- Customer ID
- Customer name
- Mobile
- Invoice number
- Payment ID
- Cow ID
- Tag number
- Product
- Date range
- Area
- Route
- Delivery status
- Payment status
- Subscription status

---

# 33. Audit Trail

Important records must have audit history.

Audit changes for:

- Customer profile
- Subscription
- Milk rate
- Delivery
- Invoice
- Payment
- Cow
- Breeding
- Calving
- Milk production
- Product
- Stock

Audit record:

- Entity
- Entity ID
- Action
- Old value
- New value
- Changed by
- Changed date/time
- Reason where required

Financial records should never be silently overwritten.

---

# 34. Historical Data Management

The system must preserve daily and monthly history.

Do not store only:

"September total = ₹3,500"

Instead retain:

Customer
→ Daily deliveries
→ Product sales
→ Invoice items
→ Payments

This enables:

- Previous month reports
- Yearly reports
- Customer trends
- Billing verification
- Dispute resolution
- Payment analysis

Historical records should remain accessible.

---

# 35. Data Rules

## Customer

- Mobile number must be unique.
- Mobile must be verified before account activation.
- Email format must be validated.
- Required profile fields must be completed before milk request.
- Duplicate customers should be detected.

## Milk Delivery

- Delivery quantity cannot be negative.
- Actual delivery can differ from subscription quantity.
- Delivery date cannot be invalid.
- Historical finalized records require authorization to modify.

## Billing

- Invoice number must be unique.
- Invoice should reference delivery/product transactions.
- Historical rate must be retained.
- Paid invoices should not be silently changed.

## Payment

- Payment amount must be positive.
- Payment reference should be unique where provided.
- Cash collection requires admin confirmation.
- Reversal/refund must retain the original payment record.

## Cow

- Cow ID/tag must be unique.
- Birth date cannot be in the future.
- Actual calving date cannot precede mating date without an exceptional/manual correction.
- Production quantity cannot be negative.

---

# 36. Recommended Core Data Entities

Customer
CustomerAddress
CustomerSubscription
SubscriptionHistory
MilkRate
MilkDelivery
Product
ProductPriceHistory
ProductOrder
ProductOrderItem
Invoice
InvoiceItem
Payment
PaymentAllocation
Cow
CowBreeding
CowPregnancy
CowCalving
Calf
CowMilkProduction
CowHealthRecord
Vaccination
FarmMilkProduction
DeliveryRoute
DeliveryPerson
Notification
AuditLog
User
Role
Permission

---

# 37. Recommended Business Flow

## Customer Flow

Register
→ OTP verification
→ Profile
→ Delivery address
→ Milk requirement
→ Subscription request
→ Admin approval
→ Active subscription
→ Daily delivery
→ Monthly invoice
→ Payment
→ Receipt
→ Historical records

## Farm Flow

Cow
→ Breeding
→ Pregnancy
→ Calving
→ Milk production
→ Farm milk availability
→ Customer delivery
→ Billing
→ Collection
→ Analytics

---

# 38. MVP – Phase 1

The first release should focus on the business-critical workflow.

### Customer

- Mobile OTP registration
- Profile
- Delivery address
- Milk requirement
- Subscription request
- Subscription status
- Daily delivery history
- Monthly bill
- Invoice
- Payment history
- Outstanding balance
- Pause/resume request

### Admin

- Login/RBAC
- Dashboard
- Customer management
- Subscription approval
- Milk rate management
- Daily delivery
- Monthly billing
- Invoice
- Payment collection
- Outstanding report
- Basic customer/milk reports

### Cow

- Cow registration
- Basic cow details
- Daily milk production
- Basic breeding/mating
- Calving record

---

# 39. Phase 2

- Online payment gateway
- Product ordering
- Product stock
- Advanced cow health
- Vaccination
- Calf genealogy
- Delivery route optimization
- Delivery person application
- Push notifications
- Advanced analytics
- Profit/loss
- Expense management
- Automated monthly billing
- Automated payment reminders

---

# 40. Phase 3 / Advanced Features

Potential future capabilities:

- WhatsApp notifications
- WhatsApp invoice delivery
- Automated SMS
- QR/customer ID
- Milk collection device integration
- Digital weighing integration
- IoT milk measurement
- Cow health/device integration
- Predictive milk production analysis
- AI-based production forecasting
- Customer churn prediction
- Demand forecasting
- Automated collection reminders

---

# 41. Security Requirements

- OTP-based authentication
- Secure session/token management
- Role-based authorization
- API authorization
- HTTPS
- Input validation
- Rate limiting for OTP
- Audit logging
- Secure password/PIN handling if used
- Sensitive data protection
- Backup and recovery
- Database transaction integrity

---

# 42. Important Design Principles

1. Never overwrite historical transaction data.
2. Maintain daily delivery records instead of only monthly totals.
3. Maintain effective-dated milk prices.
4. Maintain subscription history.
5. Generate invoices from transactions.
6. Record every payment independently.
7. Do not allow customers to fake cash payment confirmation.
8. Lock finalized billing periods.
9. Audit changes to financial and farm records.
10. Keep customer, cow and transaction history permanently available according to the farm's retention policy.

---

# 43. Suggested Main Navigation

## Customer App

Home
My Subscription
Today's Delivery
Delivery History
Bills & Invoices
Payments
Products
Notifications
Profile
Support

## Admin App

Dashboard
Customers
Milk Delivery
Milk Production
Cows
Breeding & Calving
Products
Orders
Billing
Payments
Collections
Reports
Notifications
Users & Roles
Settings
Audit Log

---

# 44. Success Criteria

The system should allow the farm administrator to answer at any time:

- How many active customers do we have?
- How much milk does each customer require?
- How much milk was actually delivered today?
- How much milk was delivered last month?
- What is each customer's current outstanding amount?
- Which customers have not paid?
- How much was collected through cash, UPI and bank transfer?
- What was the total monthly revenue?
- Which cows produced the most milk?
- How much milk did each cow produce?
- Which cows are pregnant?
- Which cows are due for calving?
- When was each cow last mated?
- When did each cow give birth?
- How much milk was produced versus sold?
- What are the farm's current product sales?
- What changed in a customer, invoice, payment or cow record?

If these questions can be answered reliably from the system, the core dairy management requirements are covered.
