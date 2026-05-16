-- Demo data for BarinBil
INSERT INTO users (telegram_id, first_name, last_name, username, xp, level, direction, skill_level, onboarding_completed, role)
VALUES
  (123456789, 'Demo', 'User', 'demo_user', 50, 'beginner', 'Frontend', 'beginner', true, 'student'),
  (987654321, 'Admin', 'Organizer', 'admin_org', 300, 'pro', 'Full-stack', 'pro', true, 'organizer')
ON CONFLICT (telegram_id) DO NOTHING;

INSERT INTO events (title, description, tags, beginner_friendly, organizer_id, registration_count)
VALUES
  ('AI Hackathon 2026', 'Create innovative AI solutions in 48 hours. Prizes for best projects!', '{AI,Python,Data Science}', true, 987654321, 42),
  ('React Meetup Almaty', 'Monthly React meetup with talks and networking.', '{React,Frontend,Networking}', true, 987654321, 28),
  ('Web3 Workshop', 'Learn basics of blockchain development and smart contracts.', '{Web3,Blockchain,Solidity}', false, 987654321, 15),
  ('DevOps Conference', 'CI/CD pipelines, Kubernetes, and cloud infrastructure.', '{DevOps,Kubernetes,Cloud}', false, 987654321, 67),
  ('Career Day IT', 'Meet top companies and find your dream job.', '{Career,Networking,Interview}', true, 987654321, 120);
