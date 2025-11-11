-- ============================================================
-- WORDPRESS DATABASE FIX FOR "Could not insert post into the database" ERROR
-- Run this in your WordPress database (phpMyAdmin or MySQL command line)
-- ============================================================

-- 1. Fix the character set and collation for the posts table
ALTER TABLE wp_posts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Fix the post_content column specifically
ALTER TABLE wp_posts MODIFY post_content LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Fix the post_title column
ALTER TABLE wp_posts MODIFY post_title TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. Fix the post_excerpt column
ALTER TABLE wp_posts MODIFY post_excerpt TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 5. Fix the entire database character set
ALTER DATABASE `your_database_name_here` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- After running this SQL:
-- 1. Go to your WordPress wp-config.php file
-- 2. Find this line: define('DB_CHARSET', 'utf8');
-- 3. Change it to: define('DB_CHARSET', 'utf8mb4');
-- 4. Find this line: define('DB_COLLATE', '');
-- 5. Change it to: define('DB_COLLATE', 'utf8mb4_unicode_ci');
-- ============================================================
