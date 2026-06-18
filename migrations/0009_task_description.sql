-- Add description field to tasks for more detail below the task name
ALTER TABLE tasks ADD COLUMN description TEXT NOT NULL DEFAULT '';
