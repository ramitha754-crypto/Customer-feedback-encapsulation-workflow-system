# Problem Statement: Customer Feedback & Escalation Workflow System

## 1. Title
**Customer Feedback & Escalation Workflow System**

## 2. Domain
**Customer Service / Customer Relationship Management (CRM)**

## 3. Who is the User?
The system has two primary user types:
- **Customer**: Submits feedback, complaints, or service-related issues and tracks their status.
- **Admin / Support Staff**: Reviews customer feedback, assigns issues, updates their status, and handles escalations.

---

## 4. What Problem Are We Solving?
Organizations receive a large number of customer complaints and feedback through different channels, making it difficult to track and resolve issues efficiently. Some complaints may be delayed, overlooked, or assigned to the wrong support personnel, resulting in poor customer satisfaction. Customers may also lack visibility into the progress of their complaints.

Therefore, a centralized system is required to record, prioritize, track, and escalate customer issues until they are resolved.

> [!NOTE]
> **Real-life example:** If a customer submits a complaint about a delayed service, the issue can be recorded in the system, assigned to a support staff member, tracked through different statuses, and automatically escalated to an administrator if it is not resolved within the expected SLA time frame.

---

## 5. Proposed Solution
The proposed system provides a centralized platform for managing customer feedback and complaints.

### Key Features
- Customer registration and login
- Submit feedback or complaints
- Generate a unique ticket for each complaint
- View complaint / ticket status
- Categorize and prioritize complaints
- Assign tickets to support staff
- Update ticket status
- Escalate unresolved or overdue complaints
- Admin dashboard for monitoring tickets
- Search and filter complaints
- Maintain complaint and resolution history
- Generate basic feedback and complaint reports

---

## 6. Core Entities / Database Tables
The major database entities are:
- `User`
- `Customer`
- `Admin / Support Staff`
- `Feedback`
- `Ticket`
- `Category`
- `Escalation`
- `Resolution`
- `Notification`

---

## 7. User Roles & Permissions

| Role | Permissions |
| :--- | :--- |
| **Customer** | Register / login, submit feedback, create complaints, view ticket status, track resolution, provide additional information |
| **Admin / Support Staff** | View complaints, assign tickets, update status, change priority, resolve issues, escalate overdue tickets, manage categories, view reports |

---

## 8. Success Criteria
The system will be considered successful when:
1. A customer can submit a complaint and receive a ticket within **1 minute**.
2. Customers can easily track the current status of their complaints.
3. Support staff can assign and update tickets efficiently.
4. Unresolved tickets can be identified and escalated automatically or manually.
5. Administrators can monitor pending, resolved, and escalated complaints.
6. Complete complaint and resolution history is maintained.
7. Unauthorized users cannot access restricted administrative functions.

---

## 9. Out of Scope
The following features will **not** be included in the initial version:
- Online payment processing
- Voice-based customer support
- Physical call-center management
- Integration with external CRM platforms
- Advanced AI chatbot implementation
- Social media complaint monitoring
- Real-time video customer support

---

## 10. Technology Stack & Track
**Chosen Track: Java – Spring Boot**

| Component | Technology |
| :--- | :--- |
| **Backend** | Java + Spring Boot |
| **Database** | MySQL |
| **API Architecture** | REST API |
| **Frontend** | React / HTML, CSS, JavaScript |
| **Security & Auth** | Spring Security |


