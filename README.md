# TradeVault – Full-Stack Enterprise Banking & Trade Finance Platform

TradeVault is a production-style, enterprise-grade Corporate Banking & Trade Finance platform built using a modern, multi-tier architecture. It allows commercial banks, corporate clients, relationship managers, compliance departments, and treasury teams to fully manage complex trade finance pipelines.

---

## 🚀 Key Modules & Features

1. **Identity & Access Management (RBAC)**: Secure Spring Security JWT-based authentication supporting six distinct enterprise roles:
   * **Corporate Client**: Applies for LCs/BGs, presents drawings, registers exports.
   * **Trade Operations Officer**: Audits documentation presentations, resolves discrepant draw requests.
   * **Relationship Manager**: Reviews credit limit allocations and handles onboarding.
   * **Treasury Manager**: Inspects bank-wide exposure trends and liquidity indices.
   * **Compliance Officer**: Resolves sanctions screenings watchlist matches (e.g., OFAC list alerts).
   * **Trade Finance Admin**: Audits system logs chronological ledger, checks server/connection nodes.
2. **Letters of Credit (LC) Core**: Support for sight/usance LCs with automated lifecycle trackers, amendment history, discrepant drawing checkers, and facility limit bounds.
3. **Bank Guarantees (BG) Core**: Bond request workflows (Bid Bond, Performance, etc.) with covenant checks, expiry warnings, and partial default breach claim registries.
4. **Export Bills & Collections Registry**: Dual documentary collection workspace supporting sight/usance instructions with remittance courier dispatch flows.
5. **Compliance watchlist Screening (SDN)**: Instant transaction matching with match metrics (OFAC, UN lists) and case investigator clearing boards.
6. **Executive Analytics Dashboard**: Custom role-based analytics grids and charts showing limits utilization and exposure trajectories using **Recharts** and **Framer Motion**.
7. ** Chronological Audit Ledger**: Complete trace record auditing transaction commits, authentication logs, and compliance edits.
8. **Axios Dual-Mode Resiliency**: Fully integrated REST APIs that automatically trigger **High-Fidelity Mock Fallback Mode** if the backend database or Spring Boot server is offline, enabling complete standalone client demonstrations without crashing.

---

## 🛠️ Technology Stack

* **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, Recharts, Axios, React Router DOM, React Hook Form, Lucide React icons.
* **Backend**: Java Spring Boot, Spring Security, Spring Data JPA, Hibernate, MySQL, OpenAPI/Swagger doc.
* **Database**: MySQL 8.0+.

---

## 📁 Repository Structure & separation of Concerns

```
TRADE-VAULT/
│
├── schema.sql                        # Complete MySQL schema & mock database seeds
│
├── backend/                          # Spring Boot Service Layer
│   ├── pom.xml                       # Maven dependencies & starter plugins
│   └── src/main/java/com/tradevault/
│       ├── TradeVaultApplication.java # Spring Boot Application Main
│       ├── config/                   # JWT provider, security chains, OpenApi swagger
│       ├── controller/               # REST API endpoints (Auth, LC, BG, Compliance, etc)
│       ├── service/                  # Business logics, analytics aggregation, screenings
│       ├── repository/               # JpaRepositories (Users, LCs, BGs, cases)
│       ├── dto/                      # Data Transfer Objects (AuthResponse, LoginRequest)
│       ├── entity/                   # Hibernate database models mapping relational keys
│       └── exception/                # Global exception handling mapping errors
│
└── frontend/                         # Vite React Client Portal
    ├── tailwind.config.js            # Tailwind brand & glassmorphism theme keys
    ├── src/
    │   ├── main.jsx                  # React Virtual DOM mounting
    │   ├── App.jsx                   # Central routing & Protected RBAC routes
    │   ├── index.css                 # Custom scrollbars, glowing animations, glass styling
    │   ├── components/
    │   │   ├── Layout.jsx            # Premium executive sidebar layout & alerts drawers
    │   │   └── ProtectedRoute.jsx    # Client router RBAC checker
    │   ├── context/
    │   │   └── AuthContext.jsx       # Global login, register state provider
    │   ├── services/
    │   │   └── api.js                # Axios REST interceptors & Mock Resilient Fallbacks
    │   └── pages/                    # Core modules pages
    │       ├── Login.jsx             # Credentials gate with sandbox autofill drawers
    │       ├── Register.jsx          # Client onboarding form
    │       ├── ForgotPassword.jsx    # Credentials recovery
    │       ├── Dashboard.jsx         # Executive adaptive analytics
    │       ├── LCManagement.jsx      # Letters of Credit multi-step workspaces
    │       ├── BGManagement.jsx      # Bank Guarantees covenants & claims
    │       ├── BillsCollections.jsx  # Collections tracking grids
    │       ├── ComplianceCases.jsx   # Match cases investigator panel
    │       ├── Reports.jsx           # Recharts visualizer & CSV/PDF exporter
    │       └── AuditLedger.jsx       # Event trails feed console
```

---

## ⚙️ Quick Installation & Running Guide

### 1. Database Setup
* Ensure MySQL is running on port `3306`.
* Create the database and import seed records by importing the [schema.sql](file:///d:/TRADE-VAULT/schema.sql) file:
  ```bash
  mysql -u root -p < schema.sql
  ```

### 2. Run the Spring Boot Backend
* Navigate to `backend/` and configure database username/password inside `src/main/resources/application.properties` if needed.
* Run compilation and compile Spring Boot:
  ```bash
  mvn clean spring-boot:run
  ```
* Once running, interactive **Swagger / OpenAPI Documentation** is available at: [http://localhost:8080/api/swagger-ui.html](http://localhost:8080/api/swagger-ui.html)

### 3. Run the Vite Client Portal
* Navigate to `frontend/` and install node packages:
  ```bash
  npm install
  ```
* Launch the local development node:
  ```bash
  npm run dev
  ```
* Open the browser and visit: [http://localhost:5173/](http://localhost:5173/)

---

## ⚡ Quick Testing Credentials (Autofill-enabled)
For seamless platform review, click the **Autofill Sandbox buttons** on the Login screen to log in immediately as:
* **Corporate Client**: `client` / `password`
* **Trade Operations**: `ops` / `password`
* **Relationship Manager**: `relationship` / `password`
* **Treasury Manager**: `treasury` / `password`
* **Compliance Officer**: `compliance` / `password`
* **System Admin**: `admin` / `password`
