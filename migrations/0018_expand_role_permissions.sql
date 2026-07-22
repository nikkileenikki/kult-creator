-- Backfill existing users with the new projects.manage / reports.manage permissions
-- introduced alongside Project Management and Custom Reports permission gating.
UPDATE users SET permissions = json_insert(permissions, '$[#]', 'projects.manage')
WHERE role IN ('admin', 'manager', 'pic') AND permissions NOT LIKE '%"projects.manage"%';

UPDATE users SET permissions = json_insert(permissions, '$[#]', 'reports.manage')
WHERE role IN ('admin', 'manager') AND permissions NOT LIKE '%"reports.manage"%';
