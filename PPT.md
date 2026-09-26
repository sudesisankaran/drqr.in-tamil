---
marp: true
theme: default
paginate: true
size: 16:9
title: Smart Health Portal
description: PPT content for MCA project presentation
---

# Smart Health Portal
## A Secure Patient-Doctor Medical Record Management System

**Presented by:** Prashant Srivastav  
**Course:** MCA IV Semester  
**University:** BBDU  
**Session:** April 2026

---

# Abstract

Smart Health Portal is a full-stack healthcare web application designed to digitize patient records and provide secure access to patients, doctors, and administrators.

The system combines:

- role-based authentication
- digital health and medical records
- appointment booking and status tracking
- real-time doctor-patient communication
- emergency QR-based medical access

This project reduces dependency on paper records and improves healthcare accessibility, coordination, and safety.

---

# Problem Statement

Traditional healthcare workflows still face major operational issues:

- records are scattered across paper files and isolated systems
- patients struggle to carry complete medical history during emergencies
- doctors and patients lack a centralized communication channel
- appointment handling is often manual and inefficient
- sensitive data may be duplicated, lost, or accessed insecurely

These problems increase delay, inconsistency, and risk in patient care.

---

# Proposed Solution

The Smart Health Portal provides a centralized and secure web platform where:

- patients manage profiles, health data, and appointments
- doctors access authorized patient information and update records
- admins supervise users and platform operations
- emergency responders can view limited critical patient data through QR-based access

The solution integrates REST APIs, real-time messaging, and role-based protection in one system.

---

# Objectives

- Digitize healthcare records in a structured format
- Provide secure access using JWT-based authentication
- Enable patient-doctor communication through chat
- Simplify appointment booking and tracking
- Support emergency access using QR-linked patient profiles
- Improve transparency, speed, and reliability of healthcare data management

---

# Scope and User Roles

## In Scope

- authentication and authorization
- profile and health record management
- medical file upload and access
- appointments, notifications, and messaging
- emergency QR-based access

## User Roles

- **Patient:** manages profile, books appointments, chats, maintains emergency info
- **Doctor:** views patient data, adds records, updates appointment status, chats
- **Admin:** manages users and protected system functions
- **Public Emergency Viewer:** sees limited life-saving details through QR access

---

# Technology Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Ant Design
- Socket.IO Client

## Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Multer for uploads
- Socket.IO

---

# Development Approach

## Software Engineering Model: Prototype Model

This model was suitable because healthcare workflows require repeated feedback and refinement.

### Why it fits this project

- early interface and workflow validation
- easier correction of user-role requirements
- iterative improvement of modules like chat and emergency access
- reduced mismatch between expected and actual functionality

### Major phases

Requirement Analysis -> Design -> Backend -> Frontend -> Integration -> Testing -> Documentation

---

# High-Level Architecture

```mermaid
flowchart LR
    U[Users: Patient / Doctor / Admin / Public Viewer]
    F[React Frontend]
    A[Express REST API]
    S[Socket.IO Server]
    D[(MongoDB)]
    FS[Uploads Folder]

    U --> F
    F --> A
    F --> S
    A --> D
    A --> FS
    S --> D
```

**Architecture style:** 3-tier web architecture with REST + WebSocket communication.

---

# Major System Modules

- **Authentication Module:** registration, login, JWT session handling
- **User Module:** profile view, profile update, role-aware data access
- **Health Record Module:** height, weight, BMI, blood pressure, core health metrics
- **Medical Record Module:** allergies, diseases, medications, notes, emergency data
- **Uploaded Records Module:** report and prescription file storage
- **Appointment Module:** booking, status updates, cancellation, slot flow
- **Chat Module:** doctor-patient messaging using Socket.IO
- **Notification Module:** appointment and system notifications
- **Emergency Module:** QR-linked emergency patient access
- **Admin Module:** manage patients, doctors, and role-based controls

---

# Use Case View

```mermaid
flowchart LR
    P[Patient]
    D[Doctor]
    A[Admin]
    E[Emergency Viewer]

    UC1[Register / Login]
    UC2[Manage Profile]
    UC3[Book Appointment]
    UC4[View or Add Records]
    UC5[Chat and Notifications]
    UC6[Generate Emergency QR]
    UC7[Access Emergency Profile]
    UC8[Manage Users]

    P --> UC1
    P --> UC2
    P --> UC3
    P --> UC5
    P --> UC6

    D --> UC1
    D --> UC4
    D --> UC3
    D --> UC5
    D --> UC7

    A --> UC1
    A --> UC8
    A --> UC7

    E --> UC7
```

---

# Data Flow Diagram - Level 0

```mermaid
flowchart LR
    P[Patient]
    D[Doctor]
    A[Admin]
    E[Emergency Viewer]
    SYS[Smart Health Portal]
    DB[(MongoDB)]

    P --> SYS
    D --> SYS
    A --> SYS
    E --> SYS
    SYS --> DB
    DB --> SYS
```

This shows the portal as a centralized data-processing system serving all user types.

---

# Database Design - ER Diagram

```mermaid
erDiagram
    USER ||--o| HEALTH_RECORD : owns
    USER ||--o| MEDICAL_RECORD : owns
    USER ||--o{ UPLOADED_RECORD : uploads_for_patient
    USER ||--o{ APPOINTMENT : books
    USER ||--o{ APPOINTMENT : attends_as_doctor
    USER ||--o| EMERGENCY_ACCESS : generates
    USER ||--o{ MESSAGE : sends
    USER ||--o{ MESSAGE : receives
    USER ||--o{ NOTIFICATION : receives

    USER {
        string _id
        string fullName
        string email
        string role
        string patientId
    }

    HEALTH_RECORD {
        string userId
        number weight
        number height
        number bmi
    }

    MEDICAL_RECORD {
        string userId
        string doctorId
        string bloodGroup
        string doctorNotes
    }

    APPOINTMENT {
        string patientId
        string doctorId
        date date
        string time
        string status
    }

    EMERGENCY_ACCESS {
        string patientId
        string qrCodeId
        boolean active
    }
```

---

# Appointment Booking Workflow

```mermaid
flowchart TD
    A[Patient logs in] --> B[Views doctor list]
    B --> C[Chooses date and slot]
    C --> D[Submits appointment request]
    D --> E[System validates input]
    E --> F[Appointment saved in database]
    F --> G[Doctor views request]
    G --> H[Doctor confirms or completes]
    H --> I[Patient receives status update]
```

This flow reduces manual coordination and keeps appointment status transparent for both sides.

---

# Emergency QR Access Sequence

```mermaid
sequenceDiagram
    participant P as Patient
    participant W as Web App
    participant API as Backend API
    participant DB as MongoDB
    participant V as Viewer / Doctor / Admin

    P->>W: Create or update emergency profile
    W->>API: Save emergency details
    API->>DB: Store qrCodeId and emergency data
    DB-->>API: Saved
    API-->>W: Emergency link ready

    V->>W: Open /emergency/:qrCodeId
    W->>API: Request emergency profile
    API->>DB: Validate qrCodeId
    DB-->>API: Return matching profile
    API-->>W: Limited or full data based on role
```

---

# Security Design

- JWT-based authentication for protected APIs
- role-based authorization for patient, doctor, and admin routes
- protected admin-only operations
- optional authentication for emergency access
- limited public emergency view and broader doctor/admin clinical view
- MongoDB-based centralized data storage with structured model validation
- file uploads handled through server middleware
- Socket.IO communication protected through authenticated sessions

**Security goal:** provide access on a need-to-know basis without blocking emergency use cases.

---

# Testing Strategy

## Testing Focus

- authentication testing
- role-based access testing
- appointment workflow testing
- record upload and retrieval testing
- chat and notification testing
- emergency QR lookup testing

## Sample Test Cases

| Test Case | Input | Expected Result |
| --- | --- | --- |
| Login | Valid credentials | User redirected to dashboard |
| Login | Invalid password | Error message shown |
| Book appointment | Valid date and doctor | Appointment created |
| Update appointment | Doctor confirms status | Patient sees updated status |
| Upload record | Valid file and metadata | File stored successfully |
| Emergency lookup | Valid QR URL | Emergency profile displayed |

---

# Key Outcomes

- centralized patient data management
- better communication between doctor and patient
- quick access to critical emergency information
- reduced dependency on paper-based workflows
- modular architecture that supports future expansion

This project demonstrates practical use of full-stack development, REST APIs, database design, authentication, and real-time systems in healthcare.

---

# Sample Interface

![Home Page Screenshot](assets/images/home-page.png)

**Screens demonstrated in the system**

- home page and role-based entry flow
- dashboard pages
- appointment management
- patient-doctor chat
- emergency patient profile access

---

# Advantages

- Paperless and centralized healthcare workflow
- Faster access to medical information
- Better patient-doctor coordination
- Emergency-friendly design using QR access
- Secure and scalable module separation
- Useful as both an academic project and a practical prototype

---

# Limitations

- no hospital ERP or laboratory system integration yet
- no payment gateway or billing module
- uploaded files are stored locally instead of cloud storage
- advanced analytics and decision support are not included
- public emergency access is intentionally limited to essential data only

---

# Future Scope

- mobile application for Android/iOS
- cloud storage for uploaded reports
- AI-based health recommendations or triage support
- QR code image generation and printable cards
- hospital and pharmacy integration
- video consultation and e-prescription support
- audit logs and advanced security monitoring

---

# Conclusion

Smart Health Portal successfully addresses major problems in conventional healthcare record handling by offering a secure, centralized, and user-friendly web solution.

The system integrates authentication, appointments, digital medical records, messaging, notifications, and emergency QR access into one platform, making it a strong MCA project with real-world relevance.

---

# Thank You
## Questions and Discussion

