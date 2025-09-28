INSERT INTO "User" ("name", "email", "password_hash", "system_role", "created_at", "updated_at")
VALUES (
           'Dummy User',
           'dummy@example.com',
           '$2b$10$CwTycUXWue0Thq9StjUM0uJ8CjK9H8s0uJtV.yoOjF5UzvY3mI/5C', -- jelszó: "password"
           'SYSTEM_ADMIN',
           NOW(),
           NOW()
       );

