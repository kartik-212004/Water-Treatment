# Water Treatment System - Water Quality Report Generator

A comprehensive Next.js application that generates detailed water quality
reports for US water systems, helping users understand contaminants in their
local water supply and promoting water filtration solutions.

## Overview

The Water Treatment System is a modern web application that:

- **Analyzes Water Quality**: Generates detailed reports on water contaminants
  by zip code and Public Water System ID (PWSID)

This project is proprietary software. All rights reserved.

---

## Key Features

### **User-Facing Features**

- **Water Quality Form**: Simple form to request water quality reports by zip
  code
- **Interactive Reports**: Detailed contamination analysis with health risk
  assessments
- **Water System Selection**: Choose from available water systems in your area
- **Mobile Responsive**: Optimized for all device sizes
- **Real-time Validation**: Form validation with immediate feedback

### **Admin Features**

- **Secure Admin Panel**: Protected admin dashboard with authentication
- **Lead Management**: View and manage collected user leads
- **Analytics Dashboard**: Monitor system usage and report generation
- **Data Export**: Export leads and analytics data

## System Architecture

```mermaid
graph TB
    subgraph "Client Side"
        A[User Browser] --> B[Next.js Frontend]
        B --> C[React Components]
        C --> D[Form Validation]
    end

    subgraph "Server Side"
        B --> E[Next.js API Routes]
        E --> F[Rate Limiting Middleware]
        F --> G[Form Processing]
        F --> H[Report Generation]
        F --> I[Admin Authentication]
    end

    subgraph "Database Layer"
        G --> J[Prisma ORM]
        H --> J
        I --> J
        J --> K[PostgreSQL Database]
    end

    subgraph "External Services"
        G --> L[Klaviyo API]
        H --> M[EPA Water Data]
        L --> N[Email Marketing]
    end

    subgraph "Data Storage"
        K --> O[Leads Table]
        K --> P[Contaminant Mapping]
        K --> Q[Contaminants Database]
    end
```

## Sequence Diagrams

### Form Submission Flow

```mermaid
sequenceDiagram
  autonumber
  participant U as User Browser
  participant F as Frontend (Next.js)
  participant FA as Form API (POST /api/form)
  participant RL as Rate Limiter
  participant VS as Validation Schema
  participant DB as Prisma Database
  participant K as Klaviyo API
  participant EPA as EPA Water Systems

  U->>F: Fill water quality form { zipCode, email, phone, consent }
  F->>VS: Validate form data (Zod schemas)
  VS-->>F: Validation result

  alt Valid form data
    F->>FA: POST /api/form { email, phoneNumber, zip, pwsid? }
    FA->>RL: Check rate limits for IP
    RL-->>FA: Allow/Deny request

    alt Rate limit passed
      FA->>VS: Parse FormSubmissionSchema
      VS-->>FA: Validated FormSubmission
      FA->>K: formatPhoneNumber() & create profile
      K-->>FA: Profile created/updated

      opt Save lead to database
        FA->>DB: Upsert leads table
        DB-->>FA: Lead record
      end

      FA->>EPA: Fetch water systems by zip code
      EPA-->>FA: WaterSystem[] array
      FA-->>F: { success: true, waterSystems: [...] }
      F->>U: Display water system selection

    else Rate limit exceeded
      FA-->>F: { error: "Rate limit exceeded" }
      F->>U: Show rate limit error toast
    end

  else Invalid form data
    F->>U: Display validation errors
  end
```

### Water Quality Report Generation Flow

```mermaid
sequenceDiagram
  autonumber
  participant U as User Browser
  participant F as Frontend
  participant RA as Report API (GET /api/report)
  participant RL as Rate Limiter
  participant L as Lib Utils
  participant DB as Prisma Database
  participant FS as File System (result.json)
  participant K as Klaviyo Events API
  participant C as Contaminants Database

  U->>F: Select water system & request report
  F->>RA: GET /api/report?pwsid=xxx&email=xxx&zipCode=xxx
  RA->>RL: Check rate limits
  RL-->>RA: Allow/Deny request

  alt Rate limit passed
    RA->>DB: Check existing contaminant_mapping
    DB-->>RA: Existing mapping (optional)

    alt Mapping exists & fresh
      RA->>DB: Return cached report data
      DB-->>RA: Cached StructuredReportData
    else Generate new report
      RA->>L: determineUserEmail(pws_id, providedEmail)
      L->>DB: Query leads table for existing email
      DB-->>L: Lead record (optional)
      L-->>RA: EmailResult { email, source, isValid }

      alt Load contamination data (local)
        RA->>FS: Read result.json file
        FS-->>RA: Raw EPA contamination data
      else Load data (external) [future feature]
        RA--xRA: External EPA API (disabled)
      end

      RA->>C: Load PATRIOTS_CONTAMINANTS
      C-->>RA: Contaminant reference data
      RA->>RA: Transform to StructuredReportData
      RA->>RA: Process contaminants & health risks

      opt Valid email present
        RA->>DB: Upsert lead record
        DB-->>RA: Updated lead
        RA->>DB: Create contaminant_mapping entry
        DB-->>RA: Mapping record
      end

      alt Send Klaviyo tracking event
        RA->>K: Send KlaviyoEventPayload
        K-->>RA: Event acknowledgment
        RA->>DB: Update klaviyo_event_sent = true
        DB-->>RA: Updated mapping
      else Klaviyo error
        RA->>DB: Update klaviyo_event_sent = false
        DB-->>RA: Updated mapping
      end
    end

    RA-->>F: ReportResponse { data, prioritizedContaminants, flags }
    F->>U: Display detailed water quality report

  else Rate limit exceeded
    RA-->>F: Rate limit error response
    F->>U: Show error message
  end
```

### Admin Authentication & Dashboard Flow

```mermaid
sequenceDiagram
  autonumber
  participant U as Admin User
  participant F as Admin Frontend
  participant AA as Admin API (POST /api/admin)
  participant ENV as Environment Variables
  participant JWT as JWT Token Service
  participant DB as Prisma Database
  participant D as Dashboard

  U->>F: Enter admin credentials
  F->>AA: POST /api/admin { admin, password }
  AA->>ENV: Validate ADMIN_USERNAME & ADMIN_PASSWORD

  alt Missing environment config
    AA-->>F: 500 Server configuration error
    F->>U: Show configuration error
  else Valid environment config
    AA->>AA: Compare credentials with env vars

    alt Valid credentials
      AA->>JWT: Generate admin token
      JWT-->>AA: Signed JWT token
      AA-->>F: { success: true, token: "..." }
      F->>F: Store token in localStorage
      F->>D: Navigate to /admin/dashboard

      D->>DB: Fetch leads statistics
      D->>DB: Fetch recent contaminant mappings
      D->>DB: Fetch system analytics
      DB-->>D: Dashboard data
      D->>U: Display admin dashboard

    else Invalid credentials
      AA-->>F: { error: "Invalid credentials" }
      F->>U: Show authentication error
    end
  end
```

### Database Migration & Seeding Flow

```mermaid
sequenceDiagram
  autonumber
  participant DEV as Developer
  participant CLI as Bun CLI
  participant P as Prisma
  participant DB as PostgreSQL
  participant S as Seed Script
  participant C as Contaminants Data

  DEV->>CLI: bun prisma migrate dev
  CLI->>P: Execute migration command
  P->>DB: Check migration status
  DB-->>P: Current schema version

  alt New migrations needed
    P->>DB: Apply pending migrations
    DB-->>P: Schema updated
    P->>P: Generate Prisma Client
    P-->>CLI: Migration completed
  else Schema up to date
    P-->>CLI: No migrations needed
  end

  DEV->>CLI: bun run seed
  CLI->>S: Execute seed-contaminants.ts
  S->>C: Load contaminant reference data
  C-->>S: Contaminant array with health data
  S->>DB: Bulk insert contaminants
  DB-->>S: Seeding completed
  S-->>CLI: Database seeded successfully
```

## Data Flow Architecture

```mermaid
flowchart LR
    subgraph "Data Input"
        A[User Zip Code] --> B[Water System Selection]
        B --> C[PWSID Selection]
    end

    subgraph "Data Processing"
        C --> D[EPA Data Lookup]
        D --> E[Contaminant Analysis]
        E --> F[Health Risk Assessment]
        F --> G[Patriots Filter Analysis]
    end

    subgraph "Data Storage"
        E --> H[Contaminant Mapping Table]
        A --> I[Leads Table]
        G --> J[Patriots Contaminants DB]
    end

    subgraph "Data Output"
        F --> K[PDF Report Generation]
        G --> L[Filter Recommendations]
        H --> M[Analytics Dashboard]
    end

    subgraph "External Integration"
        I --> N[Klaviyo Profiles]
        K --> O[Email Campaigns]
    end
```

## Technology Stack

### **Frontend**

- **Next.js 15.2.4** - React framework with App Router
- **React 19.1.1** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework

### **Backend**

- **Next.js API Routes** - Server-side API
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database

### **External Services**

- **Klaviyo API** - Email marketing automation
- **EPA Water Data** - Water quality information

### **Development Tools**

- **Bun** - JavaScript runtime and package manager
- **Docker & Docker Compose** - Containerization
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting

## Getting Started

### Prerequisites

- **Bun** (recommended) or **Node.js 18+**
- **PostgreSQL** database
- **Docker & Docker Compose** (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Water-Treatment
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/water"
   DIRECT_URL="postgresql://username:password@localhost:5432/water"
   KLAVIYO_API_KEY="your_klaviyo_api_key"
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="secure_password"
   ```

4. **Start the database (using Docker)**

   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**

   ```bash
   bun prisma migrate dev
   ```

6. **Seed the database with contaminants**

   ```bash
   bun run seed
   ```

7. **Start the development server**
   ```bash
   bun dev
   ```

The application will be available at `http://localhost:3000`

## Environment Variables

| Variable          | Description                          | Required |
| ----------------- | ------------------------------------ | -------- |
| `DATABASE_URL`    | PostgreSQL connection string         | ✅       |
| `DIRECT_URL`      | Direct PostgreSQL connection         | ✅       |
| `KLAVIYO_API_KEY` | Klaviyo API key for email automation | ✅       |
| `ADMIN_USERNAME`  | Admin panel username                 | ✅       |
| `ADMIN_PASSWORD`  | Admin panel password                 | ✅       |

## Database Schema

```mermaid
erDiagram
    leads {
        string id PK
        datetime created_at
        string email UK
        bigint phone_number
        string zip_code
        string pwsid
    }

    contaminant_mapping {
        string id PK
        string pws_id
        string zip_code
        string water_system_name
        int detected_patriots_count
        json report_data
        boolean klaviyo_event_sent
        datetime created_at
        string email
    }

    contaminant {
        string id PK
        string name UK
        string removalRate
        string healthRisk
        datetime createdAt
        datetime updatedAt
    }

    leads ||--o{ contaminant_mapping : "pwsid"
```

## Project Structure

```
Water-Treatment/
├── app/
│   ├── (home)/                   # Home page group
│   ├── admin/                    # Admin panel
│   ├── api/                      # API routes
│   └── report/                   # Report display page
├── components/
│   └── ui/                       # Shadcn/ui components
├── lib/                          # Utility libraries
├── prisma/                       # Database schema and migrations
├── public/                       # Static assets
├── script/                       # Database seeding scripts
└── styles/
```

## Usage

### For End Users

1. **Request Water Report**
   - Visit the homepage
   - Enter your zip code
   - Provide email and phone (optional)
   - Consent to communications

2. **Select Water System**
   - Choose from available water systems in your area
   - Each system shows population served and system type

3. **View Detailed Report**
   - See all detected contaminants
   - Understand health risks and sources
   - Get filter recommendations for Patriots water filters

### For Administrators

1. **Access Admin Panel**
   - Navigate to `/admin`
   - Login with admin credentials

## Security Features

- **Rate Limiting**: Prevents API abuse and spam
- **Input Validation**: Server-side validation with Zod schemas
- **Admin Authentication**: Secure admin panel access
- **Environment Variables**: Sensitive data protection
- **SQL Injection Protection**: Prisma ORM query protection
