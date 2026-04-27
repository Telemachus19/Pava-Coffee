# Pava-Coffee

## Current Database ERD

```mermaid
erDiagram
  USERS {
    int id PK
    string name
    string email
    string password_hash
    string profile_picture
    int room_id FK
    string ext
    boolean is_admin
    string reset_token
    timestamp reset_token_expires_at
    timestamp created_at
  }
  ROOMS {
    int id PK
    string room_number
  }
  CATEGORIES {
    int id PK
    string name
  }
  PRODUCTS {
    int id PK
    string name
    decimal price
    string image
    boolean is_available
    int category_id FK
  }
  ORDERS {
    int id PK
    int user_id FK
    int created_by FK
    int delivery_room_id FK
    string notes
    enum status
    decimal total_amount
    timestamp ordered_at
  }
  ORDER_ITEMS {
    int id PK
    int order_id FK
    int product_id FK
    int quantity
    decimal unit_price
  }

  ROOMS ||--o{ USERS : "has default"
  ROOMS ||--o{ ORDERS : "delivered to"
  USERS ||--o{ ORDERS : "places"
  USERS ||--o{ ORDERS : "creates (admin)"
  CATEGORIES ||--o{ PRODUCTS : "contains"
  ORDERS ||--|{ ORDER_ITEMS : "includes"
  PRODUCTS ||--o{ ORDER_ITEMS : "referenced in"
```

## Possible Changes or rather A lot of changes

```mermaid
erDiagram
  ROOM_TYPES {
    int id PK
    string name
    decimal hourly_rate
    int free_base_minutes
    boolean is_deleted
  }

  ROOMS {
    int id PK
    string room_number
    int room_type_id FK
    int max_capacity
    boolean is_deleted
  }

  CATEGORIES {
    int id PK
    string name
    boolean is_deleted
  }

  PRODUCTS {
    int id PK
    string name
    decimal price
    string image
    boolean is_available
    int category_id FK
    boolean is_deleted
  }

  USERS {
    int id PK
    string name
    string email
    string password_hash
    string profile_picture
    string ext
    boolean is_admin
    string reset_token
    timestamp reset_token_expires_at
    timestamp created_at
  }

  SESSIONS {
    int id PK
    int room_id FK
    int host_id FK
    timestamp start_time
    timestamp base_end_time
    string status
  }

  SESSION_GUESTS {
    int id PK
    int session_id FK
    int user_id FK
    timestamp join_time
    timestamp leave_time
  }

  ORDERS {
    int id PK
    int session_id FK
    int user_id FK
    string status
    timestamp ordered_at
  }

  ORDER_ITEMS {
    int id PK
    int order_id FK
    int product_id FK
    int quantity
    decimal unit_price
  }

  %% Relationships
  ROOM_TYPES ||--|{ ROOMS : "defines"
  ROOMS ||--o{ SESSIONS : "hosts"
  USERS ||--o{ SESSIONS : "owns (host)"

  SESSIONS ||--o{ SESSION_GUESTS : "includes"
  USERS ||--o{ SESSION_GUESTS : "attends as"

  SESSIONS ||--o{ ORDERS : "generates"
  USERS ||--o{ ORDERS : "pays for (split tab)"

  ORDERS ||--|{ ORDER_ITEMS : "contains"
  PRODUCTS ||--o{ ORDER_ITEMS : "sold as"
  CATEGORIES ||--|{ PRODUCTS : "groups"
```
