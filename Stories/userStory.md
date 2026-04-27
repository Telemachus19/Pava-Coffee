# User (Client or Customer) Story

## Authenticaion

_Usesr Story:_ As a _Customer_, I want to securely log into the cafeteria system and rest my passowrd if forgotten, so that i can acces the reservation and ordering platform.

### Acceptance Criteria:

- Sign Up: The system should allow new users to create an account by providing their email and password. The email must be unique and follow standard formatting rules. Passwords must meet minimum complexity requirements (e.g., at least 8 characters, including a mix of letters, numbers, and special characters).
- Login Form: Must contain fields for "Email" and "Password", with a "Login" button.
- Validation (FE/BE): Email must match standard format (e.g. user@domain.com).
  - Password can't be empty. Backend must sanitize inputs to prevent SQL injection and verify the hashed password against the stored hash in the database.
- Forget Password Flow: clicking "forget password" must redirect the user to a dedicated reset page.
- Reset Page: must contain "new password" and "confirm password" fields, with a "Reset Password" button.
  - Validation (FE/BE): Both fields msut match exactly before submission is allowed. Passowrd must meet minimum complext requireements
- Session Management: Upon successful login, genearte a secure session token (e.g., JWT) that expires after a set period of inactivity (e.g., 30 minutes). The token should be stored securely (e.g., HttpOnly cookies) to prevent XSS attacks. Implement logout functionality that invalidates the session token.

### Edge Cases:

- a user submits the loing form with an email that deosn't exist in the system: The system should display a generic error message like "Invalid email or password" without revealing whether the email is registered.
- a user bypasses the forntend matching login on the reset page (bakcend must catch th emismatch and rject the update).

## Location & Room Reservation (The Host)

**User Story:** As a **Customer (Host)**, I want to select a store location and book an available room for a free 1-hour base session, so that my group has a secure space.

### Acceptance Criteria:

- **Store Selection:** Dropdown list of active Store Locations.
- **Room Selection:** Dependent dropdown that populates with available rooms for the selected store.
- **Capacity UI:** Display `Max Capacity` and current availability next to each room.
- **Session Creation (BE):** Upon confirmation, the backend generates a unique `Session_ID` with a `Start_Time` and a `Base_End_Time` (Start + 60 minutes).
- **Availability Lock:** The room is instantly marked "Occupied" for that 1-hour block to prevent other users from booking it.

### Edge Cases:

- Two users attempt to book the exact same room at the exact same millisecond (Database transactions must lock the row; first request wins, second receives a "Room no longer available" error).

## Guest Management & Privacy (The Host)

**User Story:** As a **Customer (Host)**, I want to set room privacy and invite specific users, so that I control who can enter my reserved space.

### Acceptance Criteria:

- **Privacy Toggle:** Radio buttons for "Private (No Guests)" or "Shared".
- **Guest Selection:** Multi-select dropdown, searchable by username or email.
- **Capacity Limit:** The UI must maintain a running tally (`Selected Guests + 1 Host`). It must disable further selections once the room's maximum physical capacity is reached.
- **Notification System:** Once the Host finalizes the list, the system sends an in-app "Pending Invitation" to the selected guests.

### Edge Cases:

- The Host attempts to invite a user who is currently checked into a different active room session (System flags user as "Busy/Unavailable").

## **4. Guest Check-In & Synchronization**

**User Story:** As an **Invited Guest**, I want to accept a room invitation to check in, so that I can join the session and start my billing timer.

### Acceptance Criteria:

- **Invitation Dashboard:** Guests can view a list of "Pending Invitations" featuring the Host's name, Store Location, and Room Name.
- **Check-In Action:** Guest clicks "Join Room" to officially enter the session.
- **Timestamping (BE):** The backend immediately records an exact `Join_Time` timestamp for that specific `User_ID`.
- **Redirection:** The guest is routed to the ordering menu specifically tied to that `Session_ID`.

### Edge Cases:

- A guest waits too long to accept, and the Host's 1-hour session naturally expires before they join (Invitation automatically voids).

## Independent Ordering Flow (Room-Bound)

**User Story:** As a **Checked-in Customer (Host or Guest)**, I want to place a food order tied to my current room, so that my food is delivered to me and billed exclusively to my personal tab.

### Acceptance Criteria:

- **Menu Interaction:** Clickable product images add items to a personal cart. Users can adjust quantities using "+" and "-" buttons.
- **Data Tagging:** The frontend automatically attaches the active `Session_ID` and `Location_ID` to the order payload.
- **Independent Carts:** Guest A cannot see or edit Guest B's cart. Every user has their own tab.
- **Total Calculation:** Real-time dynamic total updates in the UI. Backend recalculates final prices against the database to prevent client-side tampering.

### Edge Cases:

- A user submits an order, but their session time expires while the request is in transit (Backend rejects the order and triggers the check-out flow).

## Room Extension (The Host)

**User Story:** As a **Customer (Host)**, I want to request additional time for the room, so that my group can stay longer without being interrupted.

### Acceptance Criteria:

- **Timer UI:** Host dashboard displays a live countdown timer of the current session.
- **Extension Request:** An "Extend Time" button allows requests in fixed increments (e.g., +30 minutes).
- **Availability Check (BE):** Backend verifies if the room is unbooked by other users for the requested extension block.
- **Session Update:** If approved, the backend updates the `Base_End_Time` for the `Session_ID`.

### Edge Cases:

- Host attempts to extend the time, but another user has already reserved the room for the next hour (UI displays an error: "Room unavailable for extension. Please check out by [Time]").

## Individual Check-Out & Metered Billing

**User Story:** As a **Customer (Host or Guest)**, I want to check out of the room to view my final split bill, so that I only pay for my food and my specific share of extra time.

### Acceptance Criteria:

- **Check-Out Action:** A permanent "Check-Out / Pay" button is visible in the session UI.
- **Time Calculation (BE):** Captures `Leave_Time` upon click.
  - Formula: `Total Time = Leave_Time - Join_Time`
  - Formula: `Billable Time = Total Time - 60 minutes` (If $\le$ 0, Time Cost = 0).
- **Proration:** Backend calculates the cost of the _Billable Time_ based on the room's hourly rate.
- **Invoice Display:** UI renders the final receipt: `(Food Total) + (Extra Time Total) = Final Amount Due`.
- **Host Override:** The Host has a master "End Session for All" button that forces a `Leave_Time` timestamp on all remaining guests to close the room.

### Edge Cases:

- A guest leaves under 60 minutes (System calculates extra time cost strictly as 0; they only pay for food).

---

## Order Dashboard (Current & Historical)

**User Story:** As a **Customer**, I want to view my active orders alongside my historical session data, so that I can track current deliveries and review my past spending.

### Acceptance Criteria:

- **UI Split:** Clear visual separation between "Active Orders" (Processing, Out for Delivery) and "Historical Orders" (Done, Cancelled).
- **Active Tracking:** Shows current order status and the specific Store/Room it is being routed to.
- **Historical Filtering:** Features "Date From" and "Date To" filters to search past receipts.
- **Cancellation:** Users can strictly cancel an active order _only_ if the status is "Processing".

### Edge Cases:

- An admin permanently deletes a Store Location, and the user searches for a historical receipt linked to that store (Database must use soft-deletes or nullable foreign keys so the UI doesn't crash trying to render a missing location).
