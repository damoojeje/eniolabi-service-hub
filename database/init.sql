-- Eniolabi Service Hub Database Initialization
-- This file initializes the database with essential data for the service hub

-- Note: Prisma migrations handle the schema creation
-- This file is for initial data seeding if needed

-- Example: Insert default admin user (commented out - handled by seed script)
-- INSERT INTO users (id, username, email, name, role, "passwordHash", "isActive", "createdAt", "updatedAt")
-- VALUES ("admin-user-id", "admin", "admin@eniolabi.com", "Administrator", "ADMIN", "", true, NOW(), NOW());

-- Example services could be inserted here
-- But these are typically handled by the application or seed scripts

-- This file ensures the database initialization step completes successfully
SELECT 1 as init_complete;
