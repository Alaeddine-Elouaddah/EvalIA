-- Script de création de la table users pour PostgreSQL
-- La base EvalIA crée automatiquement la table au premier démarrage si elle n'existe pas.

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'TEACHER')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
