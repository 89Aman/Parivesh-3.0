# Parivesh 3.0

Parivesh 3.0 is a sophisticated Environmental Clearance (EC) workflow management system designed to streamline the application, scrutiny, and meeting minutes generation process for environmental projects. Built with a modern tech stack and a decoupled architecture, Parivesh 3.0 ensures data integrity, process transparency, and automated AI-driven documentation via a strict Role-Based Access Control (RBAC) foundation.

## 🏗️ Architecture & Tech Stack

Parivesh 3.0 leverages a completely decoupled Client-Server architecture:
- **Frontend**: React + Vite + Tailwind CSS + Lucide Icons. Features an elegant "Parivesh Green" nature-themed UI with role-isolated dashboards.
- **Backend**: Python FastAPI.
- **Database**: PostgreSQL hosted on Supabase.
- **ORM**: SQLAlchemy 2.0 (Async) + asyncpg.
- **Authentication**: Custom JWT-based authentication system enforcing strict role boundaries.

### 💡 Strategic Technology Choices: Why This Stack?

The technology stack for Parivesh 3.0 was systematically selected to guarantee **blazing performance, unbreakable type-safety, long-term maintainability, and enterprise-grade scalability**:

* **React + Vite (Frontend)**
  * **Optimized DX & Build Speeds**: Vite completely sidesteps the sluggishness of traditional Webpack bundling. It enables near-instantaneous Hot Module Replacement (HMR) during developer iteration and leverages highly optimized Rollup configurations for lightweight production builds.
  * **Component-Driven Architecture**: The complex, multi-role dashboard ecosystem (Admin, PP, Scrutiny, MoM) demands high reusability of logic-heavy UI components. React allows us to build stateful, isolated widgets that maintain visual and functional consistency across interfaces without massive code duplication.
  * **Robust Ecosystem Compatibility**: Seamless, native integration with modern layout libraries (Tailwind for utility-first styling, Lucide for iconography) drastically accelerates UI/UX delivery timelines compared to heavier frameworks.

* **Python FastAPI (Backend)**
  * **Asynchronous Execution by Default**: FastAPI leverages Python's `asyncio`, making it exceptionally fast for I/O bound operations. This is critical for Parivesh, which heavily relies on concurrent non-blocking database queries and external asynchronous AI API calls for generating complex Gist documents dynamically.
  * **Native Validation with Pydantic**: Every single incoming and outgoing API payload is strictly validated using Pydantic schemas. This eliminates vast classes of data corruption bugs and malicious injection attempts before they even touch the controller logic—an absolute non-negotiable for a secure government-grade workflow engine.
  * **Self-Documenting API Contracts**: OpenAPI (Swagger) specifications are automatically generated on the fly. This provides living, interactive documentation that guarantees frontend engineers and backend architects are never out of sync regarding payload contracts.

* **PostgreSQL + SQLAlchemy 2.0 + Supabase (Database)**
  * **ACID Compliance**: Ensuring bulletproof data integrity across complex concurrent transactions (e.g., verifying payments simultaneously while allocating committee meetings in the FSM).
  * **Asynchronous-First ORM**: SQLAlchemy 2.0's asyncio capabilities map perfectly with FastAPI. It handles complex table joins (like eager loading dynamic sector parameters using `joinedload`) cleanly via asyncio sessions, avoiding the synchronous-blocking traps associated with older frameworks like Django.
  * **Managed Scalability**: Utilizing Supabase allows us to leverage enterprise-level PostgreSQL infrastructure with built-in connection pooling, reducing devops overhead while maximizing reliability.

## 🚀 Core Features

- **Role-Based Portals (React UI)**: Tailored dashboards and API endpoints for different stakeholders:
  - **Admin**: System configuration, role mapping, and CMS management.
  - **Project Proponent (PP/RQP)**: Interactive application wizards, dynamic sector forms, and EDS resolution.
  - **Scrutiny Team**: Application review queues, payment verification, and committee meeting referrals.
  - **MoM Team**: Editing, reviewing, and finalizing Minutes of Meetings (MoM).
- **Automated Workflow Engine**: A centralized Finite State Machine (FSM) managing status transitions to strictly enforce the EC lifecycle.
- **Dynamic CMS-Driven Forms**: Sector-specific parameters (e.g., "Mining Capacity") configured via the Admin CMS, which dynamically generate forms on the frontend and store via JSON structures.
- **AI Auto-Gist Generation**: Intelligent generation of structured project summaries (Gists) automatically synthesized using Google's Generative AI based on submitted data and sector templates.
- **Payment Processing**: Full simulation endpoints for PP UPI/QR payments and secure verification checkpoints for Scrutiny officers.
- **Essential Details Sought (EDS)**: Robust multi-cycle feedback loop between Scrutiny officers and Project Proponents.
- **Audit Logging**: Comprehensive internal tracking of every status change and entity operation for total transparency.

## 🔄 The Master Workflow (FSM)

The application lifecycle follows a strict linear progression enforced by the backend workflow engine (`app/core/workflow.py`). It is impossible to bypass logical steps:

1. 🟢 **`DRAFT`**: PP creates a draft, completes the dynamic wizard, uploads documents, and simulates payment.
2. 🔵 **`SUBMITTED`**: PP formally submits the application. The system locks the application from further PP edits.
3. 🟡 **`UNDER_SCRUTINY`**: The Scrutiny team accepts the application for review.
   - *Feedback Loop* 🟠 **`EDS`**: Scrutiny can raise an EDS if documents are insufficient. PP must resolve and update, pushing the status back to `UNDER_SCRUTINY`.
4. 🟣 **`REFERRED`**: Scrutiny legally verifies the simulated payment transaction and refers the application to an Expert Appraisal Committee (EAC) meeting.
5. 🟤 **`MOM_GENERATED`**: The system leverages AI to read the application parameters, EDS history, and observations to automatically generate the Briefing Gist document.
6. 🟢 **`FINALIZED`**: The MoM team evaluates the meeting results, edits the AI-generated Gist into a finalized Minutes of Meeting (MoM) report, securely closing the lifecycle.

## 🛡️ Security & RBAC

- **JWT Authentication**: Secure token-based API access.
- **Strict Endpoint Fencing**: FastAPI dependencies (`@require_role`) ensure users can only ever trigger actions designated to their specific role (e.g., MoM cannot skip ahead and verify payments).
- **Row-Level Data Isolation**: Repository layers ensure proponents (PP) can only view and mutate their own applications.


Role	Email Address	Password
Administrator	admin@parivesh.gov.in	Admin@123
Project Proponent (PP)	pp@parivesh.gov.in	PP@123
Scrutiny Officer	scrutiny@parivesh.gov.in	Scrutiny@123
Minutes of Meeting (MoM)	mom@parivesh.gov.in	Mom@123