/**
 * Idempotent SQL Server schema migration.
 * Usage: npm run db:migrate
 */
require('dotenv').config();
const { getPool } = require('./db');
const { ROLE_LABELS, PERMISSIONS, ROLE_PERMISSIONS } = require('../config/rbac');
const { EXPENSE_CATEGORIES, INCOME_CATEGORIES } = require('../config/finance');

const sqlText = (value) => String(value).replace(/'/g, "''");

const statements = [
  `
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Users (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    GoogleId NVARCHAR(128) NULL,
    Name NVARCHAR(150) NOT NULL,
    Email NVARCHAR(200) NULL,
    Mobile NVARCHAR(20) NULL,
    Role NVARCHAR(50) NOT NULL,
    PasswordHash NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT(1),
    PushToken NVARCHAR(300) NULL,
    LastLogin NVARCHAR(20) NULL,
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NULL
  );
END
`,
  `
IF OBJECT_ID('dbo.Roles', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Roles (
    Id NVARCHAR(50) NOT NULL PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(300) NULL,
    IsSystem BIT NOT NULL DEFAULT(1),
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NOT NULL
  );
END
`,
  `
IF OBJECT_ID('dbo.Permissions', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Permissions (
    Id NVARCHAR(100) NOT NULL PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    Module NVARCHAR(50) NOT NULL,
    CreatedAt NVARCHAR(20) NOT NULL
  );
END
`,
  `
IF OBJECT_ID('dbo.RolePermissions', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.RolePermissions (
    RoleId NVARCHAR(50) NOT NULL,
    PermissionId NVARCHAR(100) NOT NULL,
    CreatedAt NVARCHAR(20) NOT NULL,
    CONSTRAINT PK_RolePermissions PRIMARY KEY (RoleId, PermissionId),
    CONSTRAINT FK_RolePermissions_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Roles(Id),
    CONSTRAINT FK_RolePermissions_Permissions FOREIGN KEY (PermissionId) REFERENCES dbo.Permissions(Id)
  );
END
`,
  `
IF OBJECT_ID('dbo.UserRoles', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.UserRoles (
    UserId NVARCHAR(36) NOT NULL,
    RoleId NVARCHAR(50) NOT NULL,
    CreatedAt NVARCHAR(20) NOT NULL,
    CONSTRAINT PK_UserRoles PRIMARY KEY (UserId, RoleId),
    CONSTRAINT FK_UserRoles_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id),
    CONSTRAINT FK_UserRoles_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Roles(Id)
  );
END
`,
  `
IF OBJECT_ID('dbo.Customers', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Customers (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    Mobile NVARCHAR(20) NULL,
    Email NVARCHAR(200) NULL,
    Address NVARCHAR(500) NULL,
    DailyQuantity DECIMAL(8,2) NOT NULL DEFAULT(0),
    MorningQuantity DECIMAL(8,2) NOT NULL DEFAULT(0),
    EveningQuantity DECIMAL(8,2) NOT NULL DEFAULT(0),
    MilkType NVARCHAR(50) NULL,
    RatePerLiter DECIMAL(8,2) NOT NULL DEFAULT(0),
    BillingMode NVARCHAR(50) NULL,
    IsActive BIT NOT NULL DEFAULT(1),
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NOT NULL
  );
END
`,
  `
IF OBJECT_ID('dbo.CustomerUserAccess', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.CustomerUserAccess (
    UserId NVARCHAR(36) NOT NULL,
    CustomerId NVARCHAR(36) NOT NULL,
    IsPrimary BIT NOT NULL DEFAULT(1),
    CreatedAt NVARCHAR(20) NOT NULL,
    CONSTRAINT PK_CustomerUserAccess PRIMARY KEY (UserId, CustomerId),
    CONSTRAINT FK_CustomerUserAccess_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id),
    CONSTRAINT FK_CustomerUserAccess_Customers FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(Id)
  );
END
`,
  `
IF OBJECT_ID('dbo.CustomerDeliveryRequests', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.CustomerDeliveryRequests (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    CustomerId NVARCHAR(36) NOT NULL,
    UserId NVARCHAR(36) NULL,
    RequestDate NVARCHAR(20) NOT NULL,
    RequestType NVARCHAR(30) NOT NULL,
    ExtraQuantity DECIMAL(8,2) NOT NULL DEFAULT(0),
    ClaimedStatus NVARCHAR(30) NULL,
    Reason NVARCHAR(200) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT('Pending'),
    ActionReason NVARCHAR(300) NULL,
    ActionBy NVARCHAR(36) NULL,
    ActionAt NVARCHAR(30) NULL,
    CreatedAt NVARCHAR(30) NOT NULL,
    UpdatedAt NVARCHAR(30) NOT NULL,
    CONSTRAINT FK_CustomerDeliveryRequests_Customers FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(Id)
  );
END
`,
  `
IF OBJECT_ID('dbo.CowMaster', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.CowMaster (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    TagNumber NVARCHAR(50) NULL,
    Breed NVARCHAR(100) NULL,
    Color NVARCHAR(50) NULL,
    DateOfBirth NVARCHAR(20) NULL,
    PurchaseDate NVARCHAR(20) NULL,
    PurchaseCost DECIMAL(10,2) NOT NULL DEFAULT(0),
    CurrentStatus NVARCHAR(50) NOT NULL DEFAULT('Active'),
    PhotoUrl NVARCHAR(500) NULL,
    Notes NVARCHAR(MAX) NULL,
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NOT NULL
  );
END
`,
  `
IF OBJECT_ID('dbo.HealthRecords', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.HealthRecords (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    CowId NVARCHAR(36) NOT NULL,
    RecordType NVARCHAR(100) NULL,
    RecordDate NVARCHAR(20) NULL,
    Description NVARCHAR(MAX) NULL,
    Veterinarian NVARCHAR(150) NULL,
    NextDueDate NVARCHAR(20) NULL,
    Documents NVARCHAR(500) NULL,
    Notes NVARCHAR(MAX) NULL,
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NOT NULL,
    CONSTRAINT FK_HealthRecords_CowMaster FOREIGN KEY (CowId) REFERENCES dbo.CowMaster(Id)
  );
END
`,
  `
IF OBJECT_ID('dbo.BreedingRecords', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.BreedingRecords (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    CowId NVARCHAR(36) NOT NULL,
    MatingDate NVARCHAR(20) NOT NULL,
    BullName NVARCHAR(150) NULL,
    BreedingMethod NVARCHAR(50) NULL,
    TechnicianName NVARCHAR(150) NULL,
    Notes NVARCHAR(MAX) NULL,
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NOT NULL,
    CONSTRAINT FK_BreedingRecords_CowMaster FOREIGN KEY (CowId) REFERENCES dbo.CowMaster(Id)
  );
END
`,
  `
IF OBJECT_ID('dbo.PregnancyRecords', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.PregnancyRecords (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    CowId NVARCHAR(36) NOT NULL,
    BreedingId NVARCHAR(36) NOT NULL,
    IsConfirmed BIT NOT NULL DEFAULT(0),
    ConfirmationDate NVARCHAR(20) NULL,
    Veterinarian NVARCHAR(150) NULL,
    ExpectedCalvingDate NVARCHAR(20) NULL,
    ActualCalvingDate NVARCHAR(20) NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT('Pregnant'),
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NOT NULL,
    CONSTRAINT FK_PregnancyRecords_CowMaster FOREIGN KEY (CowId) REFERENCES dbo.CowMaster(Id),
    CONSTRAINT FK_PregnancyRecords_BreedingRecords FOREIGN KEY (BreedingId) REFERENCES dbo.BreedingRecords(Id)
  );
END
`,
  `
IF OBJECT_ID('dbo.CalvingRecords', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.CalvingRecords (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    CowId NVARCHAR(36) NOT NULL,
    PregnancyId NVARCHAR(36) NULL,
    DeliveryDate NVARCHAR(20) NOT NULL,
    DeliveryType NVARCHAR(50) NULL,
    NumberOfCalves TINYINT NOT NULL DEFAULT(1),
    Complications NVARCHAR(MAX) NULL,
    Notes NVARCHAR(MAX) NULL,
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NOT NULL,
    CONSTRAINT FK_CalvingRecords_CowMaster FOREIGN KEY (CowId) REFERENCES dbo.CowMaster(Id)
  );
END
`,
  `
IF OBJECT_ID('dbo.CalfRecords', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.CalfRecords (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    CalvingId NVARCHAR(36) NOT NULL,
    MotherCowId NVARCHAR(36) NOT NULL,
    Name NVARCHAR(100) NULL,
    Gender NVARCHAR(20) NULL,
    BirthDate NVARCHAR(20) NULL,
    BirthWeight DECIMAL(6,2) NULL,
    HealthStatus NVARCHAR(100) NULL,
    Notes NVARCHAR(MAX) NULL,
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NOT NULL,
    CONSTRAINT FK_CalfRecords_CalvingRecords FOREIGN KEY (CalvingId) REFERENCES dbo.CalvingRecords(Id),
    CONSTRAINT FK_CalfRecords_CowMaster FOREIGN KEY (MotherCowId) REFERENCES dbo.CowMaster(Id)
  );
END
`,
  `
IF OBJECT_ID('dbo.Deliveries', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Deliveries (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    CustomerId NVARCHAR(36) NOT NULL,
    [Year] SMALLINT NOT NULL,
    [Month] TINYINT NOT NULL,
    DeliveryData NVARCHAR(MAX) NOT NULL,
    DeliveredDays SMALLINT NOT NULL DEFAULT(0),
    MissedDays SMALLINT NOT NULL DEFAULT(0),
    TotalQuantity DECIMAL(10,2) NOT NULL DEFAULT(0),
    TotalAmount DECIMAL(12,2) NOT NULL DEFAULT(0),
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NOT NULL,
    CONSTRAINT FK_Deliveries_Customers FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(Id)
  );
END
`,
  `
IF OBJECT_ID('dbo.Invoices', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Invoices (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    InvoiceNumber NVARCHAR(50) NOT NULL,
    CustomerId NVARCHAR(36) NOT NULL,
    CustomerName NVARCHAR(150) NOT NULL,
    [Year] SMALLINT NOT NULL,
    [Month] TINYINT NOT NULL,
    DailyQuantity DECIMAL(8,2) NOT NULL DEFAULT(0),
    RatePerLiter DECIMAL(8,2) NOT NULL DEFAULT(0),
    DeliveredDays SMALLINT NOT NULL DEFAULT(0),
    MissedDays SMALLINT NOT NULL DEFAULT(0),
    TotalQuantity DECIMAL(10,2) NOT NULL DEFAULT(0),
    Amount DECIMAL(12,2) NOT NULL DEFAULT(0),
    PaymentStatus NVARCHAR(20) NOT NULL DEFAULT('Pending'),
    MissedDetails NVARCHAR(MAX) NULL,
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NOT NULL,
    CONSTRAINT FK_Invoices_Customers FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(Id)
  );
END
`,
  `
IF OBJECT_ID('dbo.Payments', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Payments (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    InvoiceId NVARCHAR(36) NOT NULL,
    CustomerId NVARCHAR(36) NOT NULL,
    InvoiceNumber NVARCHAR(50) NOT NULL,
    AmountDue DECIMAL(12,2) NOT NULL DEFAULT(0),
    AmountPaid DECIMAL(12,2) NOT NULL DEFAULT(0),
    Balance DECIMAL(12,2) NOT NULL DEFAULT(0),
    PaymentDate NVARCHAR(20) NULL,
    PaymentMode NVARCHAR(50) NULL,
    Notes NVARCHAR(500) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT('Partial'),
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NOT NULL,
    CONSTRAINT FK_Payments_Invoices FOREIGN KEY (InvoiceId) REFERENCES dbo.Invoices(Id),
    CONSTRAINT FK_Payments_Customers FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(Id)
  );
END
`,
  `
IF OBJECT_ID('dbo.MilkProduction', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.MilkProduction (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    CowId NVARCHAR(36) NOT NULL,
    ProductionDate NVARCHAR(20) NOT NULL,
    MorningMilk DECIMAL(6,2) NOT NULL DEFAULT(0),
    EveningMilk DECIMAL(6,2) NOT NULL DEFAULT(0),
    TotalMilk DECIMAL(6,2) NOT NULL DEFAULT(0),
    Notes NVARCHAR(500) NULL,
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NOT NULL,
    CONSTRAINT FK_MilkProduction_CowMaster FOREIGN KEY (CowId) REFERENCES dbo.CowMaster(Id)
  );
END
`,
  `
IF OBJECT_ID('dbo.AuditLog', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.AuditLog (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    UserId NVARCHAR(36) NULL,
    Action NVARCHAR(50) NOT NULL,
    Module NVARCHAR(50) NOT NULL,
    EntityId NVARCHAR(36) NULL,
    PreviousValue NVARCHAR(200) NULL,
    NewValue NVARCHAR(200) NULL,
    Reason NVARCHAR(200) NULL,
    Comments NVARCHAR(500) NULL,
    IpAddress NVARCHAR(50) NULL,
    CreatedAt NVARCHAR(30) NOT NULL
  );
END
`,
  `
IF OBJECT_ID('dbo.Settings', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Settings (
    [Key] NVARCHAR(100) NOT NULL PRIMARY KEY,
    [Value] NVARCHAR(4000) NULL,
    UpdatedAt NVARCHAR(20) NOT NULL
  );
END
`,
  `
IF OBJECT_ID('dbo.Products', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Products (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Unit NVARCHAR(20) NOT NULL DEFAULT('liter'),
    Rate DECIMAL(10,2) NOT NULL DEFAULT(0),
    IsActive BIT NOT NULL DEFAULT(1),
    SortOrder INT NOT NULL DEFAULT(0),
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NULL
  );
END
`,
  `
IF OBJECT_ID('dbo.ProductOrders', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ProductOrders (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    CustomerId NVARCHAR(36) NOT NULL,
    OrderDate NVARCHAR(20) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT('Pending'),
    TotalAmount DECIMAL(12,2) NOT NULL DEFAULT(0),
    Notes NVARCHAR(500) NULL,
    ActionReason NVARCHAR(300) NULL,
    CreatedBy NVARCHAR(36) NULL,
    CreatedAt NVARCHAR(30) NOT NULL,
    UpdatedAt NVARCHAR(30) NULL
  );
END
`,
  `
IF OBJECT_ID('dbo.ProductOrderItems', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ProductOrderItems (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    OrderId NVARCHAR(36) NOT NULL,
    ProductId NVARCHAR(36) NOT NULL,
    ProductName NVARCHAR(100) NOT NULL,
    Unit NVARCHAR(20) NOT NULL DEFAULT('liter'),
    Quantity DECIMAL(10,2) NOT NULL DEFAULT(0),
    Rate DECIMAL(10,2) NOT NULL DEFAULT(0),
    Amount DECIMAL(12,2) NOT NULL DEFAULT(0),
    CreatedAt NVARCHAR(30) NOT NULL
  );
END
`,
  `
IF OBJECT_ID('dbo.CustomerSubscriptions', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.CustomerSubscriptions (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    CustomerId NVARCHAR(36) NOT NULL,
    MilkType NVARCHAR(50) NOT NULL DEFAULT('Cow Milk'),
    MorningQuantity DECIMAL(6,2) NOT NULL DEFAULT(0),
    EveningQuantity DECIMAL(6,2) NOT NULL DEFAULT(0),
    TotalQuantity DECIMAL(6,2) NOT NULL DEFAULT(0),
    Rate DECIMAL(10,2) NOT NULL DEFAULT(0),
    DeliveryDays NVARCHAR(50) NOT NULL DEFAULT('All'),
    StartDate NVARCHAR(20) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT('PendingApproval'),
    EstimatedMonthlyAmount DECIMAL(12,2) NOT NULL DEFAULT(0),
    Notes NVARCHAR(500) NULL,
    ActionReason NVARCHAR(300) NULL,
    ActionBy NVARCHAR(36) NULL,
    ActionAt NVARCHAR(30) NULL,
    PauseFrom NVARCHAR(20) NULL,
    PauseTo NVARCHAR(20) NULL,
    CreatedBy NVARCHAR(36) NULL,
    CreatedAt NVARCHAR(30) NOT NULL,
    UpdatedAt NVARCHAR(30) NULL
  );
END
`,
  `
IF OBJECT_ID('dbo.SubscriptionHistory', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.SubscriptionHistory (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    SubscriptionId NVARCHAR(36) NOT NULL,
    CustomerId NVARCHAR(36) NOT NULL,
    MilkType NVARCHAR(50) NULL,
    MorningQuantity DECIMAL(6,2) NOT NULL DEFAULT(0),
    EveningQuantity DECIMAL(6,2) NOT NULL DEFAULT(0),
    TotalQuantity DECIMAL(6,2) NOT NULL DEFAULT(0),
    Rate DECIMAL(10,2) NOT NULL DEFAULT(0),
    DeliveryDays NVARCHAR(50) NULL,
    Status NVARCHAR(20) NOT NULL,
    EffectiveFrom NVARCHAR(20) NULL,
    EffectiveTo NVARCHAR(20) NULL,
    ChangeReason NVARCHAR(300) NULL,
    CreatedBy NVARCHAR(36) NULL,
    CreatedAt NVARCHAR(30) NOT NULL
  );
END
`,

  `
IF OBJECT_ID('dbo.MilkRates', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.MilkRates (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    MilkType NVARCHAR(50) NOT NULL,
    RatePerLiter DECIMAL(10,2) NOT NULL DEFAULT(0),
    EffectiveFrom NVARCHAR(20) NOT NULL,
    EffectiveTo NVARCHAR(20) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT('Active'),
    Notes NVARCHAR(300) NULL,
    CreatedBy NVARCHAR(36) NULL,
    CreatedAt NVARCHAR(30) NOT NULL,
    UpdatedAt NVARCHAR(30) NULL
  );
END
`,

  `
IF OBJECT_ID('dbo.MonthClosures', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.MonthClosures (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    [Year] SMALLINT NOT NULL,
    [Month] TINYINT NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT('Closed'),
    Notes NVARCHAR(300) NULL,
    ClosedBy NVARCHAR(36) NULL,
    ClosedAt NVARCHAR(30) NULL,
    ReopenedBy NVARCHAR(36) NULL,
    ReopenedAt NVARCHAR(30) NULL,
    CreatedAt NVARCHAR(30) NOT NULL,
    UpdatedAt NVARCHAR(30) NULL
  );
END
`,

  `
IF OBJECT_ID('dbo.MedicineMaster', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.MedicineMaster (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    DosageMg DECIMAL(10,2) NULL,
    Purpose NVARCHAR(300) NULL,
    Comments NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT(1),
    CreatedAt NVARCHAR(30) NOT NULL,
    UpdatedAt NVARCHAR(30) NULL
  );
END
`,
  `
IF OBJECT_ID('dbo.Expenses', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Expenses (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    Category NVARCHAR(30) NOT NULL,
    AccountName NVARCHAR(150) NULL,
    ItemName NVARCHAR(150) NULL,
    Vendor NVARCHAR(150) NULL,
    Quantity DECIMAL(10,2) NULL,
    Unit NVARCHAR(20) NULL,
    Amount DECIMAL(12,2) NOT NULL DEFAULT(0),
    ExpenseDate NVARCHAR(20) NOT NULL,
    PaymentMode NVARCHAR(50) NULL,
    Notes NVARCHAR(500) NULL,
    CreatedBy NVARCHAR(36) NULL,
    CreatedAt NVARCHAR(30) NOT NULL,
    UpdatedAt NVARCHAR(30) NULL
  );
END
`,
  `
IF OBJECT_ID('dbo.OtpVerifications', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.OtpVerifications (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    Mobile NVARCHAR(20) NOT NULL,
    CodeHash NVARCHAR(200) NOT NULL,
    Purpose NVARCHAR(30) NOT NULL DEFAULT('registration'),
    ExpiresAt NVARCHAR(30) NOT NULL,
    Attempts INT NOT NULL DEFAULT(0),
    Verified BIT NOT NULL DEFAULT(0),
    ConsumedAt NVARCHAR(30) NULL,
    CreatedAt NVARCHAR(30) NOT NULL,
    UpdatedAt NVARCHAR(30) NULL
  );
END
`,

  // Legacy compatibility: add missing columns on already-existing tables.
  `IF OBJECT_ID('dbo.HealthRecords', 'U') IS NOT NULL AND COL_LENGTH('dbo.HealthRecords', 'UpdatedAt') IS NULL ALTER TABLE dbo.HealthRecords ADD UpdatedAt NVARCHAR(20) NULL;`,
  `IF OBJECT_ID('dbo.BreedingRecords', 'U') IS NOT NULL AND COL_LENGTH('dbo.BreedingRecords', 'NextCheckDate') IS NULL ALTER TABLE dbo.BreedingRecords ADD NextCheckDate NVARCHAR(20) NULL;`,
  `IF OBJECT_ID('dbo.BreedingRecords', 'U') IS NOT NULL AND COL_LENGTH('dbo.BreedingRecords', 'ConceptionStatus') IS NULL ALTER TABLE dbo.BreedingRecords ADD ConceptionStatus NVARCHAR(20) NOT NULL DEFAULT('Pending');`,
  `IF OBJECT_ID('dbo.BreedingRecords', 'U') IS NOT NULL AND COL_LENGTH('dbo.BreedingRecords', 'CycleNumber') IS NULL ALTER TABLE dbo.BreedingRecords ADD CycleNumber INT NOT NULL DEFAULT(1);`,
  `IF OBJECT_ID('dbo.BreedingRecords', 'U') IS NOT NULL AND COL_LENGTH('dbo.BreedingRecords', 'ReminderSent') IS NULL ALTER TABLE dbo.BreedingRecords ADD ReminderSent BIT NOT NULL DEFAULT(0);`,
  `IF OBJECT_ID('dbo.BreedingRecords', 'U') IS NOT NULL AND COL_LENGTH('dbo.BreedingRecords', 'UpdatedAt') IS NULL ALTER TABLE dbo.BreedingRecords ADD UpdatedAt NVARCHAR(20) NULL;`,
  `IF OBJECT_ID('dbo.CalvingRecords', 'U') IS NOT NULL AND COL_LENGTH('dbo.CalvingRecords', 'UpdatedAt') IS NULL ALTER TABLE dbo.CalvingRecords ADD UpdatedAt NVARCHAR(20) NULL;`,
  `IF OBJECT_ID('dbo.CalfRecords', 'U') IS NOT NULL AND COL_LENGTH('dbo.CalfRecords', 'UpdatedAt') IS NULL ALTER TABLE dbo.CalfRecords ADD UpdatedAt NVARCHAR(20) NULL;`,
  `IF OBJECT_ID('dbo.MilkProduction', 'U') IS NOT NULL AND COL_LENGTH('dbo.MilkProduction', 'UpdatedAt') IS NULL ALTER TABLE dbo.MilkProduction ADD UpdatedAt NVARCHAR(20) NULL;`,
  `IF OBJECT_ID('dbo.AuditLog', 'U') IS NOT NULL AND COL_LENGTH('dbo.AuditLog', 'UpdatedAt') IS NULL ALTER TABLE dbo.AuditLog ADD UpdatedAt NVARCHAR(20) NULL;`,
  `IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL AND COL_LENGTH('dbo.Users', 'UpdatedAt') IS NULL ALTER TABLE dbo.Users ADD UpdatedAt NVARCHAR(20) NULL;`,

  // Morning/Evening milk split for Customers (DailyQuantity kept as the derived total for billing)
  `IF OBJECT_ID('dbo.Customers', 'U') IS NOT NULL AND COL_LENGTH('dbo.Customers', 'MorningQuantity') IS NULL ALTER TABLE dbo.Customers ADD MorningQuantity DECIMAL(8,2) NOT NULL DEFAULT(0);`,
  `IF OBJECT_ID('dbo.Customers', 'U') IS NOT NULL AND COL_LENGTH('dbo.Customers', 'EveningQuantity') IS NULL ALTER TABLE dbo.Customers ADD EveningQuantity DECIMAL(8,2) NOT NULL DEFAULT(0);`,
  `IF OBJECT_ID('dbo.Customers', 'U') IS NOT NULL UPDATE dbo.Customers SET MorningQuantity = DailyQuantity WHERE MorningQuantity = 0 AND EveningQuantity = 0 AND DailyQuantity > 0;`,

  // Monthly delivery charge captured on each invoice
  `IF OBJECT_ID('dbo.Invoices', 'U') IS NOT NULL AND COL_LENGTH('dbo.Invoices', 'DeliveryCharge') IS NULL ALTER TABLE dbo.Invoices ADD DeliveryCharge DECIMAL(10,2) NOT NULL DEFAULT(0);`,

  // Rich per-day delivery status (§9.2) and actual per-day quantity (§9.3) as JSON maps keyed by date
  `IF OBJECT_ID('dbo.Deliveries', 'U') IS NOT NULL AND COL_LENGTH('dbo.Deliveries', 'StatusData') IS NULL ALTER TABLE dbo.Deliveries ADD StatusData NVARCHAR(MAX) NULL;`,
  `IF OBJECT_ID('dbo.Deliveries', 'U') IS NOT NULL AND COL_LENGTH('dbo.Deliveries', 'QuantityData') IS NULL ALTER TABLE dbo.Deliveries ADD QuantityData NVARCHAR(MAX) NULL;`,

  // Extended product master fields (§13): description, cost, stock, min stock, tax, image
  `IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL AND COL_LENGTH('dbo.Products', 'Description') IS NULL ALTER TABLE dbo.Products ADD Description NVARCHAR(500) NULL;`,
  `IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL AND COL_LENGTH('dbo.Products', 'Cost') IS NULL ALTER TABLE dbo.Products ADD Cost DECIMAL(10,2) NOT NULL DEFAULT(0);`,
  `IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL AND COL_LENGTH('dbo.Products', 'Stock') IS NULL ALTER TABLE dbo.Products ADD Stock DECIMAL(12,2) NOT NULL DEFAULT(0);`,
  `IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL AND COL_LENGTH('dbo.Products', 'MinStock') IS NULL ALTER TABLE dbo.Products ADD MinStock DECIMAL(12,2) NOT NULL DEFAULT(0);`,
  `IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL AND COL_LENGTH('dbo.Products', 'TaxPercent') IS NULL ALTER TABLE dbo.Products ADD TaxPercent DECIMAL(5,2) NOT NULL DEFAULT(0);`,
  `IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL AND COL_LENGTH('dbo.Products', 'ImageUrl') IS NULL ALTER TABLE dbo.Products ADD ImageUrl NVARCHAR(500) NULL;`,

  // Cow gender (§ Female = milk-producing/breedable, Male = bull, mating only). Default Female.
  `IF OBJECT_ID('dbo.CowMaster', 'U') IS NOT NULL AND COL_LENGTH('dbo.CowMaster', 'Gender') IS NULL ALTER TABLE dbo.CowMaster ADD Gender NVARCHAR(10) NOT NULL DEFAULT('Female');`,

  // Animal type within CowMaster: Cow or Buffalo only — both are dairy animals that share the
  // same breeding/pregnancy/calving/milk-production pipeline (BreedingRecords etc. all key off
  // CowId). Goat/Hen/Duck live in their own master tables below since they don't use that pipeline.
  `IF OBJECT_ID('dbo.CowMaster', 'U') IS NOT NULL AND COL_LENGTH('dbo.CowMaster', 'AnimalType') IS NULL ALTER TABLE dbo.CowMaster ADD AnimalType NVARCHAR(20) NOT NULL DEFAULT('Cow');`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CowMaster_AnimalType' AND object_id = OBJECT_ID('dbo.CowMaster')) CREATE INDEX IX_CowMaster_AnimalType ON dbo.CowMaster(AnimalType);`,
  // Backfill: existing rows whose free-text Breed literally says "Buffalo" are reclassified;
  // everything else keeps the 'Cow' default and can be corrected manually via Edit Cow.
  `IF OBJECT_ID('dbo.CowMaster', 'U') IS NOT NULL UPDATE dbo.CowMaster SET AnimalType='Buffalo' WHERE AnimalType='Cow' AND Breed LIKE '%Buffalo%';`,

  // Goat / Hen / Duck: simple standalone herd/flock inventory — no breeding/pregnancy/milk
  // pipeline wired up (unlike Cow/Buffalo above). Same shape as CowMaster minus Gender/AnimalType.
  `
IF OBJECT_ID('dbo.GoatMaster', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.GoatMaster (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    TagNumber NVARCHAR(50) NULL,
    Breed NVARCHAR(100) NULL,
    Color NVARCHAR(50) NULL,
    DateOfBirth NVARCHAR(20) NULL,
    PurchaseDate NVARCHAR(20) NULL,
    PurchaseCost DECIMAL(10,2) NOT NULL DEFAULT(0),
    CurrentStatus NVARCHAR(50) NOT NULL DEFAULT('Active'),
    PhotoUrl NVARCHAR(500) NULL,
    Notes NVARCHAR(MAX) NULL,
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NOT NULL
  );
END
`,
  `
IF OBJECT_ID('dbo.HenMaster', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.HenMaster (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    TagNumber NVARCHAR(50) NULL,
    Breed NVARCHAR(100) NULL,
    Color NVARCHAR(50) NULL,
    DateOfBirth NVARCHAR(20) NULL,
    PurchaseDate NVARCHAR(20) NULL,
    PurchaseCost DECIMAL(10,2) NOT NULL DEFAULT(0),
    CurrentStatus NVARCHAR(50) NOT NULL DEFAULT('Active'),
    PhotoUrl NVARCHAR(500) NULL,
    Notes NVARCHAR(MAX) NULL,
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NOT NULL
  );
END
`,
  `
IF OBJECT_ID('dbo.DuckMaster', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.DuckMaster (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    TagNumber NVARCHAR(50) NULL,
    Breed NVARCHAR(100) NULL,
    Color NVARCHAR(50) NULL,
    DateOfBirth NVARCHAR(20) NULL,
    PurchaseDate NVARCHAR(20) NULL,
    PurchaseCost DECIMAL(10,2) NOT NULL DEFAULT(0),
    CurrentStatus NVARCHAR(50) NOT NULL DEFAULT('Active'),
    PhotoUrl NVARCHAR(500) NULL,
    Notes NVARCHAR(MAX) NULL,
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NOT NULL
  );
END
`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_GoatMaster_TagNumber' AND object_id = OBJECT_ID('dbo.GoatMaster')) CREATE UNIQUE INDEX UX_GoatMaster_TagNumber ON dbo.GoatMaster(TagNumber) WHERE TagNumber IS NOT NULL AND TagNumber <> '';`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_HenMaster_TagNumber' AND object_id = OBJECT_ID('dbo.HenMaster')) CREATE UNIQUE INDEX UX_HenMaster_TagNumber ON dbo.HenMaster(TagNumber) WHERE TagNumber IS NOT NULL AND TagNumber <> '';`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_DuckMaster_TagNumber' AND object_id = OBJECT_ID('dbo.DuckMaster')) CREATE UNIQUE INDEX UX_DuckMaster_TagNumber ON dbo.DuckMaster(TagNumber) WHERE TagNumber IS NOT NULL AND TagNumber <> '';`,

  // Goat breeding: goats get a Gender column (like CowMaster) so does/bucks can be told apart,
  // and BreedingRecords/PregnancyRecords/CalvingRecords gain a Species column so the same
  // pipeline can key off either CowMaster.Id (Cow/Buffalo) or GoatMaster.Id (Goat). The old
  // FK constraints only allowed CowMaster, so they're dropped in favor of app-level lookups.
  `IF OBJECT_ID('dbo.GoatMaster', 'U') IS NOT NULL AND COL_LENGTH('dbo.GoatMaster', 'Gender') IS NULL ALTER TABLE dbo.GoatMaster ADD Gender NVARCHAR(10) NOT NULL DEFAULT('Female');`,

  `IF OBJECT_ID('dbo.BreedingRecords', 'U') IS NOT NULL AND COL_LENGTH('dbo.BreedingRecords', 'Species') IS NULL ALTER TABLE dbo.BreedingRecords ADD Species NVARCHAR(20) NOT NULL DEFAULT('Cow');`,
  `IF OBJECT_ID('dbo.PregnancyRecords', 'U') IS NOT NULL AND COL_LENGTH('dbo.PregnancyRecords', 'Species') IS NULL ALTER TABLE dbo.PregnancyRecords ADD Species NVARCHAR(20) NOT NULL DEFAULT('Cow');`,
  `IF OBJECT_ID('dbo.CalvingRecords', 'U') IS NOT NULL AND COL_LENGTH('dbo.CalvingRecords', 'Species') IS NULL ALTER TABLE dbo.CalvingRecords ADD Species NVARCHAR(20) NOT NULL DEFAULT('Cow');`,

  // Some environments created these tables with SQL Server's auto-generated FK names rather
  // than the explicit ones above, so look the constraint up by column instead of guessing a name.
  `
DECLARE @fk1 NVARCHAR(200);
SELECT @fk1 = fk.name
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
JOIN sys.columns c ON c.object_id = fkc.parent_object_id AND c.column_id = fkc.parent_column_id
WHERE fk.parent_object_id = OBJECT_ID('dbo.BreedingRecords') AND c.name = 'CowId' AND fk.referenced_object_id = OBJECT_ID('dbo.CowMaster');
IF @fk1 IS NOT NULL EXEC('ALTER TABLE dbo.BreedingRecords DROP CONSTRAINT [' + @fk1 + ']');
`,
  `
DECLARE @fk2 NVARCHAR(200);
SELECT @fk2 = fk.name
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
JOIN sys.columns c ON c.object_id = fkc.parent_object_id AND c.column_id = fkc.parent_column_id
WHERE fk.parent_object_id = OBJECT_ID('dbo.PregnancyRecords') AND c.name = 'CowId' AND fk.referenced_object_id = OBJECT_ID('dbo.CowMaster');
IF @fk2 IS NOT NULL EXEC('ALTER TABLE dbo.PregnancyRecords DROP CONSTRAINT [' + @fk2 + ']');
`,
  `
DECLARE @fk3 NVARCHAR(200);
SELECT @fk3 = fk.name
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
JOIN sys.columns c ON c.object_id = fkc.parent_object_id AND c.column_id = fkc.parent_column_id
WHERE fk.parent_object_id = OBJECT_ID('dbo.CalvingRecords') AND c.name = 'CowId' AND fk.referenced_object_id = OBJECT_ID('dbo.CowMaster');
IF @fk3 IS NOT NULL EXEC('ALTER TABLE dbo.CalvingRecords DROP CONSTRAINT [' + @fk3 + ']');
`,
  `
DECLARE @fk4 NVARCHAR(200);
SELECT @fk4 = fk.name
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
JOIN sys.columns c ON c.object_id = fkc.parent_object_id AND c.column_id = fkc.parent_column_id
WHERE fk.parent_object_id = OBJECT_ID('dbo.CalfRecords') AND c.name = 'MotherCowId' AND fk.referenced_object_id = OBJECT_ID('dbo.CowMaster');
IF @fk4 IS NOT NULL EXEC('ALTER TABLE dbo.CalfRecords DROP CONSTRAINT [' + @fk4 + ']');
`,

  // Per-species breeding parameters (heat cycle / heat duration / gestation range). Cow/Buffalo
  // keep the app's existing hardcoded values (21-day cycle, 283-day/"9mo10d" gestation) so
  // behavior for them is unchanged; Goat gets its own realistic timeline.
  `
IF OBJECT_ID('dbo.SpeciesBreedingConfig', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.SpeciesBreedingConfig (
    Species NVARCHAR(20) NOT NULL PRIMARY KEY,
    HeatCycleDays INT NOT NULL,
    HeatDurationHoursMin INT NOT NULL,
    HeatDurationHoursMax INT NOT NULL,
    GestationDaysMin INT NOT NULL,
    GestationDaysMax INT NOT NULL,
    Notes NVARCHAR(300) NULL,
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NOT NULL
  );
END
`,
  `IF NOT EXISTS (SELECT 1 FROM dbo.SpeciesBreedingConfig WHERE Species='Cow') INSERT INTO dbo.SpeciesBreedingConfig (Species,HeatCycleDays,HeatDurationHoursMin,HeatDurationHoursMax,GestationDaysMin,GestationDaysMax,Notes,CreatedAt,UpdatedAt) VALUES ('Cow',21,12,18,283,283,'Standard 9 months 10 days gestation.',CONVERT(NVARCHAR(20), GETDATE(), 23),CONVERT(NVARCHAR(20), GETDATE(), 23));`,
  `IF NOT EXISTS (SELECT 1 FROM dbo.SpeciesBreedingConfig WHERE Species='Buffalo') INSERT INTO dbo.SpeciesBreedingConfig (Species,HeatCycleDays,HeatDurationHoursMin,HeatDurationHoursMax,GestationDaysMin,GestationDaysMax,Notes,CreatedAt,UpdatedAt) VALUES ('Buffalo',21,12,18,283,283,'Using cow default pending a buffalo-specific figure.',CONVERT(NVARCHAR(20), GETDATE(), 23),CONVERT(NVARCHAR(20), GETDATE(), 23));`,
  `IF NOT EXISTS (SELECT 1 FROM dbo.SpeciesBreedingConfig WHERE Species='Goat') INSERT INTO dbo.SpeciesBreedingConfig (Species,HeatCycleDays,HeatDurationHoursMin,HeatDurationHoursMax,GestationDaysMin,GestationDaysMax,Notes,CreatedAt,UpdatedAt) VALUES ('Goat',19,24,38,145,155,'Miniature breeds trend toward ~145 days; 150 is the standard average.',CONVERT(NVARCHAR(20), GETDATE(), 23),CONVERT(NVARCHAR(20), GETDATE(), 23));`,

  `IF OBJECT_ID('dbo.HealthRecords', 'U') IS NOT NULL UPDATE dbo.HealthRecords SET UpdatedAt = ISNULL(UpdatedAt, CreatedAt) WHERE UpdatedAt IS NULL;`,
  `IF OBJECT_ID('dbo.BreedingRecords', 'U') IS NOT NULL UPDATE dbo.BreedingRecords SET UpdatedAt = ISNULL(UpdatedAt, CreatedAt) WHERE UpdatedAt IS NULL;`,
  `IF OBJECT_ID('dbo.CalvingRecords', 'U') IS NOT NULL UPDATE dbo.CalvingRecords SET UpdatedAt = ISNULL(UpdatedAt, CreatedAt) WHERE UpdatedAt IS NULL;`,
  `IF OBJECT_ID('dbo.CalfRecords', 'U') IS NOT NULL UPDATE dbo.CalfRecords SET UpdatedAt = ISNULL(UpdatedAt, CreatedAt) WHERE UpdatedAt IS NULL;`,
  `IF OBJECT_ID('dbo.MilkProduction', 'U') IS NOT NULL UPDATE dbo.MilkProduction SET UpdatedAt = ISNULL(UpdatedAt, CreatedAt) WHERE UpdatedAt IS NULL;`,
  `IF OBJECT_ID('dbo.AuditLog', 'U') IS NOT NULL UPDATE dbo.AuditLog SET UpdatedAt = ISNULL(UpdatedAt, CreatedAt) WHERE UpdatedAt IS NULL;`,
  `IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL UPDATE dbo.Users SET UpdatedAt = ISNULL(UpdatedAt, CreatedAt) WHERE UpdatedAt IS NULL;`,

  // Indexes and uniqueness constraints
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_CowMaster_TagNumber' AND object_id = OBJECT_ID('dbo.CowMaster')) CREATE UNIQUE INDEX UX_CowMaster_TagNumber ON dbo.CowMaster(TagNumber) WHERE TagNumber IS NOT NULL AND TagNumber <> '';`,
  `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Deliveries') AND name = 'ReasonData') 
   BEGIN 
     ALTER TABLE dbo.Deliveries ADD ReasonData NVARCHAR(MAX) NULL;
   END`,
  `IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL AND COL_LENGTH('dbo.Users', 'Mobile') IS NULL 
   BEGIN 
     ALTER TABLE dbo.Users ADD Mobile NVARCHAR(20) NULL;
   END`,
  `IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL AND COL_LENGTH('dbo.Users', 'PasswordHash') IS NULL 
   BEGIN 
     ALTER TABLE dbo.Users ADD PasswordHash NVARCHAR(500) NULL;
   END`,
  `IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL AND COL_LENGTH('dbo.Users', 'Role') IS NOT NULL ALTER TABLE dbo.Users ALTER COLUMN Role NVARCHAR(50) NOT NULL;`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CowMaster_CurrentStatus' AND object_id = OBJECT_ID('dbo.CowMaster')) CREATE INDEX IX_CowMaster_CurrentStatus ON dbo.CowMaster(CurrentStatus);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Customers_IsActive_Name' AND object_id = OBJECT_ID('dbo.Customers')) CREATE INDEX IX_Customers_IsActive_Name ON dbo.Customers(IsActive, Name);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_Users_GoogleId' AND object_id = OBJECT_ID('dbo.Users')) CREATE UNIQUE INDEX UX_Users_GoogleId ON dbo.Users(GoogleId) WHERE GoogleId IS NOT NULL AND GoogleId <> '';`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_Users_Mobile' AND object_id = OBJECT_ID('dbo.Users')) CREATE UNIQUE INDEX UX_Users_Mobile ON dbo.Users(Mobile) WHERE Mobile IS NOT NULL AND Mobile <> '';`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Users_Role' AND object_id = OBJECT_ID('dbo.Users')) CREATE INDEX IX_Users_Role ON dbo.Users(Role);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Users_IsActive' AND object_id = OBJECT_ID('dbo.Users')) CREATE INDEX IX_Users_IsActive ON dbo.Users(IsActive);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CustomerUserAccess_CustomerId' AND object_id = OBJECT_ID('dbo.CustomerUserAccess')) CREATE INDEX IX_CustomerUserAccess_CustomerId ON dbo.CustomerUserAccess(CustomerId);`,
  `IF OBJECT_ID('dbo.CustomerDeliveryRequests', 'U') IS NOT NULL AND COL_LENGTH('dbo.CustomerDeliveryRequests', 'ActionReason') IS NULL ALTER TABLE dbo.CustomerDeliveryRequests ADD ActionReason NVARCHAR(300) NULL;`,
  `IF OBJECT_ID('dbo.CustomerDeliveryRequests', 'U') IS NOT NULL AND COL_LENGTH('dbo.CustomerDeliveryRequests', 'ActionBy') IS NULL ALTER TABLE dbo.CustomerDeliveryRequests ADD ActionBy NVARCHAR(36) NULL;`,
  `IF OBJECT_ID('dbo.CustomerDeliveryRequests', 'U') IS NOT NULL AND COL_LENGTH('dbo.CustomerDeliveryRequests', 'ActionAt') IS NULL ALTER TABLE dbo.CustomerDeliveryRequests ADD ActionAt NVARCHAR(30) NULL;`,
  `IF OBJECT_ID('dbo.CustomerDeliveryRequests', 'U') IS NOT NULL AND COL_LENGTH('dbo.CustomerDeliveryRequests', 'ClaimedStatus') IS NULL ALTER TABLE dbo.CustomerDeliveryRequests ADD ClaimedStatus NVARCHAR(30) NULL;`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_CustomerDeliveryRequests_Customer_Date_Type' AND object_id = OBJECT_ID('dbo.CustomerDeliveryRequests')) CREATE UNIQUE INDEX UX_CustomerDeliveryRequests_Customer_Date_Type ON dbo.CustomerDeliveryRequests(CustomerId, RequestDate, RequestType);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CustomerDeliveryRequests_Date_Status' AND object_id = OBJECT_ID('dbo.CustomerDeliveryRequests')) CREATE INDEX IX_CustomerDeliveryRequests_Date_Status ON dbo.CustomerDeliveryRequests(RequestDate, Status);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_Deliveries_Customer_Year_Month' AND object_id = OBJECT_ID('dbo.Deliveries')) CREATE UNIQUE INDEX UX_Deliveries_Customer_Year_Month ON dbo.Deliveries(CustomerId, [Year], [Month]);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Deliveries_Year_Month' AND object_id = OBJECT_ID('dbo.Deliveries')) CREATE INDEX IX_Deliveries_Year_Month ON dbo.Deliveries([Year], [Month]);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_Invoices_InvoiceNumber' AND object_id = OBJECT_ID('dbo.Invoices')) CREATE UNIQUE INDEX UX_Invoices_InvoiceNumber ON dbo.Invoices(InvoiceNumber);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_Invoices_Customer_Year_Month' AND object_id = OBJECT_ID('dbo.Invoices')) CREATE UNIQUE INDEX UX_Invoices_Customer_Year_Month ON dbo.Invoices(CustomerId, [Year], [Month]);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Invoices_Year_Month_Status' AND object_id = OBJECT_ID('dbo.Invoices')) CREATE INDEX IX_Invoices_Year_Month_Status ON dbo.Invoices([Year], [Month], PaymentStatus);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_MilkProduction_Cow_Date' AND object_id = OBJECT_ID('dbo.MilkProduction')) CREATE UNIQUE INDEX UX_MilkProduction_Cow_Date ON dbo.MilkProduction(CowId, ProductionDate);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Pregnancy_Status_Expected' AND object_id = OBJECT_ID('dbo.PregnancyRecords')) CREATE INDEX IX_Pregnancy_Status_Expected ON dbo.PregnancyRecords(Status, ExpectedCalvingDate);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HealthRecords_NextDueDate' AND object_id = OBJECT_ID('dbo.HealthRecords')) CREATE INDEX IX_HealthRecords_NextDueDate ON dbo.HealthRecords(NextDueDate);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Breeding_Conception_NextCheck' AND object_id = OBJECT_ID('dbo.BreedingRecords')) CREATE INDEX IX_Breeding_Conception_NextCheck ON dbo.BreedingRecords(ConceptionStatus, NextCheckDate);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_Products_Name' AND object_id = OBJECT_ID('dbo.Products')) CREATE UNIQUE INDEX UX_Products_Name ON dbo.Products(Name);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ProductOrders_Customer_Status' AND object_id = OBJECT_ID('dbo.ProductOrders')) CREATE INDEX IX_ProductOrders_Customer_Status ON dbo.ProductOrders(CustomerId, Status);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ProductOrders_OrderDate' AND object_id = OBJECT_ID('dbo.ProductOrders')) CREATE INDEX IX_ProductOrders_OrderDate ON dbo.ProductOrders(OrderDate);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ProductOrderItems_OrderId' AND object_id = OBJECT_ID('dbo.ProductOrderItems')) CREATE INDEX IX_ProductOrderItems_OrderId ON dbo.ProductOrderItems(OrderId);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CustomerSubscriptions_Customer_Status' AND object_id = OBJECT_ID('dbo.CustomerSubscriptions')) CREATE INDEX IX_CustomerSubscriptions_Customer_Status ON dbo.CustomerSubscriptions(CustomerId, Status);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SubscriptionHistory_SubId' AND object_id = OBJECT_ID('dbo.SubscriptionHistory')) CREATE INDEX IX_SubscriptionHistory_SubId ON dbo.SubscriptionHistory(SubscriptionId);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_MilkRates_Type_EffectiveFrom' AND object_id = OBJECT_ID('dbo.MilkRates')) CREATE INDEX IX_MilkRates_Type_EffectiveFrom ON dbo.MilkRates(MilkType, EffectiveFrom);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_MonthClosures_Year_Month' AND object_id = OBJECT_ID('dbo.MonthClosures')) CREATE UNIQUE INDEX UX_MonthClosures_Year_Month ON dbo.MonthClosures([Year], [Month]);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_OtpVerifications_Mobile_Purpose' AND object_id = OBJECT_ID('dbo.OtpVerifications')) CREATE INDEX IX_OtpVerifications_Mobile_Purpose ON dbo.OtpVerifications(Mobile, Purpose, CreatedAt);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Expenses_Date_Category' AND object_id = OBJECT_ID('dbo.Expenses')) CREATE INDEX IX_Expenses_Date_Category ON dbo.Expenses(ExpenseDate, Category);`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_MedicineMaster_Name' AND object_id = OBJECT_ID('dbo.MedicineMaster')) CREATE UNIQUE INDEX UX_MedicineMaster_Name ON dbo.MedicineMaster(Name);`,
  // Which animal types (Cow, Goat, Hen, Duck) this medicine applies to — comma-separated, e.g. "Cow,Goat".
  `IF OBJECT_ID('dbo.MedicineMaster', 'U') IS NOT NULL AND COL_LENGTH('dbo.MedicineMaster', 'AnimalTypes') IS NULL ALTER TABLE dbo.MedicineMaster ADD AnimalTypes NVARCHAR(100) NULL;`,

  // Goat weight tracking — logged every ~2 weeks. Goat-only (not polymorphic), so a normal FK is fine.
  `
IF OBJECT_ID('dbo.GoatWeightRecords', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.GoatWeightRecords (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    GoatId NVARCHAR(36) NOT NULL,
    WeighedDate NVARCHAR(20) NOT NULL,
    WeightKg DECIMAL(6,2) NOT NULL,
    Notes NVARCHAR(300) NULL,
    CreatedAt NVARCHAR(20) NOT NULL,
    UpdatedAt NVARCHAR(20) NOT NULL,
    CONSTRAINT FK_GoatWeightRecords_GoatMaster FOREIGN KEY (GoatId) REFERENCES dbo.GoatMaster(Id)
  );
END
`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_GoatWeightRecords_Goat_Date' AND object_id = OBJECT_ID('dbo.GoatWeightRecords')) CREATE INDEX IX_GoatWeightRecords_Goat_Date ON dbo.GoatWeightRecords(GoatId, WeighedDate);`,
  // Income ledger — manual income entries (cattle/calf/manure sales, subsidies, direct milk sales, other).
  // Same shape as dbo.Expenses; Source = who paid us (counterpart of Expenses.Vendor).
  `
IF OBJECT_ID('dbo.Income', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Income (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    Category NVARCHAR(30) NOT NULL,
    AccountName NVARCHAR(150) NULL,
    ItemName NVARCHAR(150) NULL,
    Source NVARCHAR(150) NULL,
    Quantity DECIMAL(10,2) NULL,
    Unit NVARCHAR(20) NULL,
    Amount DECIMAL(12,2) NOT NULL DEFAULT(0),
    IncomeDate NVARCHAR(20) NOT NULL,
    PaymentMode NVARCHAR(50) NULL,
    Notes NVARCHAR(500) NULL,
    CreatedBy NVARCHAR(36) NULL,
    CreatedAt NVARCHAR(30) NOT NULL,
    UpdatedAt NVARCHAR(30) NULL
  );
END
`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Income_Date_Category' AND object_id = OBJECT_ID('dbo.Income')) CREATE INDEX IX_Income_Date_Category ON dbo.Income(IncomeDate, Category);`,
  // Expense / Income types. System rows are seeded from config/finance.js; users add their own
  // (e.g. "Machinery", "Pump") from the app. Soft-deleted via IsActive=0.
  `
IF OBJECT_ID('dbo.LedgerCategories', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.LedgerCategories (
    Id NVARCHAR(36) NOT NULL PRIMARY KEY,
    Ledger NVARCHAR(10) NOT NULL,
    Name NVARCHAR(60) NOT NULL,
    IsSystem BIT NOT NULL DEFAULT(0),
    IsActive BIT NOT NULL DEFAULT(1),
    SortOrder INT NOT NULL DEFAULT(100),
    CreatedAt NVARCHAR(30) NOT NULL
  );
END
`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_LedgerCategories_Ledger_Name' AND object_id = OBJECT_ID('dbo.LedgerCategories')) CREATE UNIQUE INDEX UX_LedgerCategories_Ledger_Name ON dbo.LedgerCategories(Ledger, Name);`,
  // Custom category names can be longer than the original 30-char column (COL_LENGTH is bytes: 30 chars = 60).
  `IF OBJECT_ID('dbo.Expenses', 'U') IS NOT NULL AND COL_LENGTH('dbo.Expenses', 'Category') < 120 BEGIN DROP INDEX IF EXISTS IX_Expenses_Date_Category ON dbo.Expenses; ALTER TABLE dbo.Expenses ALTER COLUMN Category NVARCHAR(60) NOT NULL; CREATE INDEX IX_Expenses_Date_Category ON dbo.Expenses(ExpenseDate, Category); END`,
  `IF OBJECT_ID('dbo.Income', 'U') IS NOT NULL AND COL_LENGTH('dbo.Income', 'Category') < 120 BEGIN DROP INDEX IF EXISTS IX_Income_Date_Category ON dbo.Income; ALTER TABLE dbo.Income ALTER COLUMN Category NVARCHAR(60) NOT NULL; CREATE INDEX IX_Income_Date_Category ON dbo.Income(IncomeDate, Category); END`,
];

// Seed system ledger categories (idempotent by Ledger + Name).
[['expense', EXPENSE_CATEGORIES], ['income', INCOME_CATEGORIES]].forEach(([ledger, names]) => {
  names.forEach((name, i) => {
    statements.push(`IF NOT EXISTS (SELECT 1 FROM dbo.LedgerCategories WHERE Ledger='${ledger}' AND Name='${sqlText(name)}') INSERT INTO dbo.LedgerCategories (Id,Ledger,Name,IsSystem,IsActive,SortOrder,CreatedAt) VALUES (LOWER(CONVERT(NVARCHAR(36), NEWID())),'${ledger}','${sqlText(name)}',1,1,${(i + 1) * 10},CONVERT(NVARCHAR(30), GETDATE(), 126));`);
  });
});

const titleCasePermission = (permission) => permission
  .replace(/[:_]/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());


Object.entries(ROLE_LABELS).forEach(([roleId, label]) => {
  statements.push(`IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Id='${sqlText(roleId)}') INSERT INTO dbo.Roles (Id,Name,Description,IsSystem,CreatedAt,UpdatedAt) VALUES ('${sqlText(roleId)}','${sqlText(label)}','System role for ${sqlText(label)} access',1,CONVERT(NVARCHAR(20), GETDATE(), 23),CONVERT(NVARCHAR(20), GETDATE(), 23));`);
});

Object.values(PERMISSIONS).forEach((permission) => {
  const [moduleName] = permission.split(':');
  statements.push(`IF NOT EXISTS (SELECT 1 FROM dbo.Permissions WHERE Id='${sqlText(permission)}') INSERT INTO dbo.Permissions (Id,Name,Module,CreatedAt) VALUES ('${sqlText(permission)}','${sqlText(titleCasePermission(permission))}','${sqlText(moduleName)}',CONVERT(NVARCHAR(20), GETDATE(), 23));`);
});

Object.entries(ROLE_PERMISSIONS).forEach(([roleId, permissions]) => {
  permissions.forEach((permission) => {
    statements.push(`IF NOT EXISTS (SELECT 1 FROM dbo.RolePermissions WHERE RoleId='${sqlText(roleId)}' AND PermissionId='${sqlText(permission)}') INSERT INTO dbo.RolePermissions (RoleId,PermissionId,CreatedAt) VALUES ('${sqlText(roleId)}','${sqlText(permission)}',CONVERT(NVARCHAR(20), GETDATE(), 23));`);
  });
});

statements.push(`UPDATE dbo.Users SET Role='supervisor' WHERE LOWER(Role)='staff';`);
statements.push(`INSERT INTO dbo.UserRoles (UserId,RoleId,CreatedAt) SELECT Id, Role, CONVERT(NVARCHAR(20), GETDATE(), 23) FROM dbo.Users u WHERE Role IS NOT NULL AND EXISTS (SELECT 1 FROM dbo.Roles r WHERE r.Id = u.Role) AND NOT EXISTS (SELECT 1 FROM dbo.UserRoles ur WHERE ur.UserId = u.Id AND ur.RoleId = u.Role);`);

// Seed default products (idempotent by Name). Future products can be added from the app.
const DEFAULT_PRODUCTS = [
  { name: 'Milk', unit: 'liter', rate: 60, sort: 1 },
  { name: 'Curd', unit: 'kg', rate: 80, sort: 2 },
  { name: 'Buttermilk', unit: 'liter', rate: 40, sort: 3 },
  { name: 'Butter', unit: 'kg', rate: 500, sort: 4 },
  { name: 'Ghee', unit: 'kg', rate: 700, sort: 5 },
  { name: 'Paneer', unit: 'kg', rate: 350, sort: 6 },
];
DEFAULT_PRODUCTS.forEach((product) => {
  statements.push(`IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Name='${sqlText(product.name)}') INSERT INTO dbo.Products (Id,Name,Unit,Rate,IsActive,SortOrder,CreatedAt,UpdatedAt) VALUES (LOWER(CONVERT(NVARCHAR(36), NEWID())),'${sqlText(product.name)}','${sqlText(product.unit)}',${product.rate},1,${product.sort},CONVERT(NVARCHAR(20), GETDATE(), 23),CONVERT(NVARCHAR(20), GETDATE(), 23));`);
});

// Default monthly delivery charge setting
statements.push(`IF NOT EXISTS (SELECT 1 FROM dbo.Settings WHERE [Key]='monthlyDeliveryCharge') INSERT INTO dbo.Settings ([Key],[Value],UpdatedAt) VALUES ('monthlyDeliveryCharge','0',CONVERT(NVARCHAR(20), GETDATE(), 23));`);

// Seed a default effective milk rate (idempotent - only when the table is empty).
statements.push(`IF NOT EXISTS (SELECT 1 FROM dbo.MilkRates) INSERT INTO dbo.MilkRates (Id,MilkType,RatePerLiter,EffectiveFrom,EffectiveTo,Status,Notes,CreatedAt) VALUES (LOWER(CONVERT(NVARCHAR(36), NEWID())),'Cow Milk',60,'2020-01-01',NULL,'Active','Seed default rate',CONVERT(NVARCHAR(20), GETDATE(), 23));`);

async function migrate() {
  try {
    console.log('Connecting to SQL Server...');
    const pool = await getPool();
    console.log('Connected. Applying schema...');

    for (const stmt of statements) {
      await pool.request().query(stmt);
    }

    console.log('Schema migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
