-- Asignar rol de super_admin al usuario con email gvargasrub@gmail.com
-- Primero obtenemos el user_id del auth.users basado en el email
UPDATE user_roles 
SET role = 'super_admin'
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'gvargasrub@gmail.com'
);