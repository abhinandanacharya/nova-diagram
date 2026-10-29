// Compact Mermaid syntax references, returned by the `diagram_cheatsheet` tool.
export const CHEATSHEETS = {
  flowchart: `flowchart TD            %% TD top-down, LR left-right
  A([Start]) --> B{Valid input?}
  B -->|Yes| C[Process request]
  B -->|No| D[/Show error/]
  C --> E[(Database)]
  subgraph Backend
    C
    E
  end
  D --> F((End))
Shapes: [rect] (round) ([stadium]) {decision} [(db)] ((circle)) [/parallelogram/]
Links: --> solid, -.-> dotted, ==> thick, -->|label| labelled
Quote labels with special chars: A["Check (JWT)"]`,

  sequence: `sequenceDiagram
  autonumber
  participant U as User
  participant API
  participant DB
  U->>API: POST /login
  activate API
  API->>DB: find user
  DB-->>API: user row
  alt valid password
    API-->>U: 200 + token
  else invalid
    API-->>U: 401
  end
  deactivate API
  Note over U,API: Token expires in 1h
Arrows: ->> solid, -->> dashed reply, -x lost. Blocks: alt/else, opt, loop, par, critical.`,

  class: `classDiagram
  class Order {
    +int id
    +Date createdAt
    +total() float
  }
  class Customer { +string email }
  Customer "1" --> "0..*" Order : places
  Order <|-- RushOrder
Relations: <|-- inheritance, *-- composition, o-- aggregation, --> association, ..> dependency`,

  state: `stateDiagram-v2
  [*] --> Draft
  Draft --> Submitted : submit
  Submitted --> Approved : approve
  Submitted --> Rejected : reject
  Rejected --> Draft : revise
  Approved --> [*]
  state Submitted {
    [*] --> InReview
    InReview --> Escalated
  }`,

  er: `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ ORDER_ITEM : contains
  PRODUCT ||--o{ ORDER_ITEM : "listed in"
  CUSTOMER {
    int id PK
    string email UK
  }
  ORDER {
    int id PK
    int customer_id FK
  }
Cardinality: ||  exactly one, o|  zero or one, }|  one or many, }o  zero or many`,

  gantt: `gantt
  title Launch plan
  dateFormat YYYY-MM-DD
  section Build
  API            :a1, 2026-11-02, 10d
  Frontend       :a2, after a1, 12d
  section Ship
  QA             :a3, after a2, 5d
  Release        :milestone, after a3, 0d`,

  mindmap: `mindmap
  root((Product launch))
    Marketing
      Landing page
      Email list
    Engineering
      API
      Monitoring
    Support
      Docs`,

  journey: `journey
  title Checkout experience
  section Browse
    Find product: 5: Customer
  section Pay
    Enter card: 2: Customer
    Get confirmation: 4: Customer, System`,

  gitgraph: `gitGraph
  commit
  branch feature
  checkout feature
  commit
  checkout main
  merge feature
  commit tag: "v1.0"`,

  architecture: `architecture-beta
  group cloud(cloud)[Cloud]
  service web(server)[Web App] in cloud
  service api(server)[API] in cloud
  service db(database)[Postgres] in cloud
  web:R --> L:api
  api:R --> L:db
Icons: cloud, database, disk, internet, server. For wider compatibility prefer flowchart + subgraph.`,
};

export const DIAGRAM_TYPES = Object.keys(CHEATSHEETS);
