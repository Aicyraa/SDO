# Student Discipline Office Management System

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-Enabled-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Platform-Progressive%20Web%20App-5A0FC8?logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/Deployment-Vercel-000000?logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Status-Deployed-success" alt="Deployed" />
</p>

<p align="center">
  A Progressive Web App designed to streamline student disciplinary case management, sanction monitoring, appointment scheduling, and notifications for National University – Fairview.
</p>

<p align="center">
  <a href="https://sdo-ten.vercel.app/"><strong>View Live Application</strong></a>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Project Objectives](#project-objectives)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [System Workflow](#system-workflow)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Security and Privacy](#security-and-privacy)

## Overview

The **Student Discipline Office Management System** is a mobile-responsive Progressive Web App (PWA) developed to digitalize and organize disciplinary processes at National University – Fairview.

The system provides a centralized platform for managing student violations, reviewing disciplinary cases, assigning sanctions, monitoring sanction progress, and coordinating appointments between students and the Student Discipline Office.

By providing separate interfaces for students and administrators, the system aims to improve record organization, accessibility, and communication.

| Project Information | Details |
|---|---|
| Project Name | Student Discipline Office Management System |
| Institution | National University – Fairview |
| Application Type | Progressive Web App (PWA) |
| Target Users | Students and Discipline Office Administrators |
| Frontend | React 19 and TypeScript |
| Hosting Platform | Vercel |
| Live Application | [sdo-ten.vercel.app](https://sdo-ten.vercel.app/) |

## Project Objectives

- Digitalize student disciplinary record management.
- Improve the organization and accessibility of violation records.
- Simplify the monitoring of assigned sanctions and required submissions.
- Streamline appointment scheduling between students and administrators.
- Provide timely notifications for relevant disciplinary updates.
- Deliver a responsive interface for supported mobile and desktop browsers.

## Key Features

| Feature | Description |
|---|---|
| User Authentication | Provides a login interface and role-based access to the system. |
| Student Dashboard | Allows students to view their disciplinary records, case statuses, and assigned sanctions. |
| Case Management | Enables administrators to record violations, review cases, and manage case statuses. |
| Sanction Management | Supports sanction assignment, progress monitoring, and document submissions. |
| Digital Student Handbook | Provides searchable violation descriptions and corresponding sanctions. |
| Appointment Scheduling | Allows administrators to assign appointments and students to view their schedules. |
| Notifications | Communicates relevant case updates, sanction changes, and appointment information. |
| Responsive Interface | Adapts the user interface to different supported screen sizes. |

## User Roles

### Student

Students have access to features that help them monitor their disciplinary records and comply with assigned requirements.

| Functionality | Description |
|---|---|
| View Records | Review accessible disciplinary records and case statuses. |
| Monitor Sanctions | Track the progress of assigned sanctions. |
| Submit Documents | Upload required files for applicable sanctions. |
| Access Handbook | Search and review disciplinary violations and sanctions. |
| View Appointments | Check appointments assigned by administrators. |
| Receive Notifications | View relevant disciplinary updates and appointment notices. |

### Administrator

Administrators manage official disciplinary records and coordinate case-related activities.

| Functionality | Description |
|---|---|
| Manage Cases | Record violations and review reported cases. |
| Update Case Status | Maintain disciplinary case progress and related remarks. |
| Assign Sanctions | Assign sanctions based on applicable school policies. |
| Review Submissions | Check documents submitted for assigned sanctions. |
| Manage Appointments | Assign students appointment dates, times, and reasons. |
| Manage Notifications | Handle relevant updates and important notices. |

## Technology Stack

| Technology | Purpose |
|---|---|
| React 19 | Builds the user interface using reusable components. |
| TypeScript | Provides static typing to help identify errors and improve maintainability. |
| Progressive Web App (PWA) | Supports an app-like experience through compatible browsers and devices. |
| Vercel | Hosts and deploys the application. |

> Additional libraries, database services, and backend technologies should be listed here if they are part of the actual implementation.

## System Workflow

The general disciplinary case management process follows these stages:

| Stage | Description |
|---|---|
| 1. Reported | A student violation is recorded in the system. |
| 2. Validated | The administrator reviews the reported violation. |
| 3. For Sanction | An appropriate sanction is assigned, and the student completes the required actions. |
| 4. Resolved | The case is marked as resolved after the applicable requirements have been completed and reviewed. |

This workflow provides a structured way to track disciplinary cases from initial reporting through resolution.

## Getting Started

### Access the Live Application

The deployed application is available at:

**[https://sdo-ten.vercel.app/](https://sdo-ten.vercel.app/)**

Sign in using the appropriate account credentials if authentication is required.

### Run the Project Locally

To run the project locally, ensure that you have the following installed:

- [Node.js](https://nodejs.org/)
- npm, which is included with Node.js
- The project's source code

**1. Clone the repository**

```bash
git clone <repository-url>
```

**2. Navigate to the project directory**

```bash
cd <project-folder>
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

**5. Open the local application**

Visit the local URL displayed in your terminal, commonly `http://localhost:5173` for Vite-based projects.

> Replace `<repository-url>` and `<project-folder>` with the actual values. These commands assume the project uses npm and a compatible development setup.

## Deployment

The application is deployed through Vercel.

| Item | Details |
|---|---|
| Hosting Platform | Vercel |
| Production URL | [https://sdo-ten.vercel.app/](https://sdo-ten.vercel.app/) |
| Deployment Type | Web application deployment |

## Security and Privacy

Because the system handles student disciplinary information, access to records should be restricted to authorized users.

Recommended security practices include:

- Enforcing appropriate role-based permissions.
- Protecting student information and uploaded documents.
- Validating user inputs and file uploads.
- Avoiding the exposure of sensitive information in public repositories.
- Using environment variables for private configuration values.
- Following the institution's applicable data privacy policies.

## Academic Project

This project is developed for academic purposes in the context of National University – Fairview.

**Live Demo:** [Student Discipline Office Management System](https://sdo-ten.vercel.app/)

---

<p align="center">
  <sub>Built to improve the organization and management of student disciplinary processes.</sub>
</p>