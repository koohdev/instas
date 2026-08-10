# Database Architecture & Performance Trade-offs

This document outlines structural trade-offs across relational, document, and graph database engines.

## 1. Storage Layout and Locality
*   **Relational Model (Postgres, MySQL):** Highly normalized. Enforces a strict *schema-on-write* system. Minimizes data redundancy by referencing isolated tables through foreign keys. However, fetching deeply nested data (e.g., a complex profile) requires multiple joins or independent disk reads to fetch data scattered across pages, raising latency under high volume.
*   **Document Model (MongoDB):** Standardizes on *schema-on-read*. Offers deep *data locality*—storing nested relationships (emails, past employment, credentials) directly in a single sequential JSON-like document. This allows the database to retrieve an entire aggregated entity in a single sequential disk I/O, though it introduces substantial data duplication.

## 2. Graph Databases (Neo4j)
*   For heavily connected data networks (e.g., social graphs or tracing deep lineage patterns), relational models are poorly optimized. Quering many-to-many paths in SQL requires highly verbose, hard-to-maintain recursive Common Table Expressions (CTEs). Graph databases represent relationships natively as first-class edges, enabling rapid path traversals with minimal query lines.

## 3. High-Performance Latency Budgets
*   **Averages are Deceptive:** Never measure database health or user experience using raw average P50 latency.
*   **Tail Latency Auditing:** Always monitor P90, P99, and P99.9 metrics. Even with a fast P50, a slow P99.9 suggests system-blocking processes (such as full-table scans) that trigger slow responses for thousands of concurrent users executing point-lookups.
