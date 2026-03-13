# Parivesh 3.0

Parivesh is a sophisticated Environmental Clearance (EC) workflow management system designed to streamline the application, scrutiny, and meeting minutes generation process for environmental projects. Built with a modern tech stack and a robust role-based access control (RBAC) system, Parivesh 3.0 ensures data integrity, process transparency, and automated documentation.

## 🚀 Core Features

- **Role-Based Portals**: Tailored interfaces and API endpoints for different stakeholders:
  - **Admin**: System configuration, role management, and template provisioning.
  - **Project Proponent (PP/RQP)**: Application submission, document management, and EDS resolution.
  - **Scrutiny Team**: Application review, payment verification, and meeting referrals.
  - **MoM Team**: Editing and finalizing Minutes of Meetings (MoM).
- **Automated Workflow Engine**: A centralized Finite State Machine (FSM) managing status transitions (DRAFT → SUBMITTED → UNDER_SCRUTINY → EDS → REFERRED → MOM_GENERATED → FINALIZED).
- **Dynamic CMS-Driven Forms**: Sector-specific parameters and application forms configured via the Admin CMS.
- **Auto-Gist Generation**: Intelligent generation of project summaries (Gists) from application data using sector-specific templates.
- **Essential Details Sought (EDS) Cycle**: Robust multi-cycle feedback loop between scrutiny officers and project proponents.
- **Audit Logging**: Comprehensive tracking of all critical actions for transparency and accountability.



## 🔄 Workflow Overview

The application lifecycle follows a strict linear progression enforced by the workflow engine:

1. **Application Phase**: PP creates a `DRAFT`, uploads documents, and simulates payment.
2. **Submission**: PP transitions the status to `SUBMITTED`.
3. **Scrutiny Phase**: Scrutiny team reviews the application (`UNDER_SCRUTINY`). They can raise an `EDS` (Essential Details Sought) if information is missing.
4. **Referral**: Once verified, the application is `REFERRED` to a committee meeting.
5. **Documentation**: Scrutiny generates a `Gist`. MoM team edits and finalizes the `MoM`.
6. **Finalization**: Status set to `FINALIZED`.

## 🛡 Security & RBAC

- **JWT Authentication**: Secure token-based access.
- **Role-Based Access**: Specialized dependencies ensure that users can only access endpoints relevant to their assigned roles (e.g., `@require_role("PP")`).
- **Data Isolation**: Row-level filtering ensures that proponents can only access their own applications.

