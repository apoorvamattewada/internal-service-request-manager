// mongo-init.js — Seeds initial admin user on first run
// This script runs automatically when MongoDB container first starts

db = db.getSiblingDB('isrm_db');

// Create application-level user
db.createUser({
  user: 'isrm_app',
  pwd: 'isrm_app_password',
  roles: [{ role: 'readWrite', db: 'isrm_db' }],
});

print('MongoDB initialized: isrm_db created with app user.');
