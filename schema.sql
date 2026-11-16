-- Script de création de la table evalia_users pour PostgreSQL
-- La base EvalIA crée automatiquement la table au premier démarrage si elle n'existe pas.

CREATE TABLE IF NOT EXISTS evalia_users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'TEACHER')),
    profile_photo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exams (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    teacher_id BIGINT NOT NULL REFERENCES evalia_users(id),
    teacher_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migration additive (Phase 1) : métadonnées produit des examens.
-- Idempotente et non destructive : aucune colonne ni donnée n'est supprimée.
ALTER TABLE exams ADD COLUMN IF NOT EXISTS subject VARCHAR(120);
ALTER TABLE exams ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'published';
ALTER TABLE exams ADD COLUMN IF NOT EXISTS access_code VARCHAR(6);
ALTER TABLE exams ADD COLUMN IF NOT EXISTS access_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS opens_at TIMESTAMP;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'fr';
ALTER TABLE exams ADD COLUMN IF NOT EXISTS mode VARCHAR(10) DEFAULT 'manual';
ALTER TABLE exams ADD COLUMN IF NOT EXISTS targets TEXT[];
ALTER TABLE exams ADD COLUMN IF NOT EXISTS reveal_results BOOLEAN DEFAULT TRUE;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS randomize_questions BOOLEAN DEFAULT FALSE;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS access_mode VARCHAR(10) DEFAULT 'code' CHECK (access_mode IN ('code', 'direct'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_exams_access_code
    ON exams(access_code) WHERE access_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS exam_questions (
    id BIGSERIAL PRIMARY KEY,
    exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('SINGLE', 'MULTIPLE')),
    explanation TEXT,
    order_index INTEGER NOT NULL
);

-- Migration additive (Phase 1) : barème par question.
ALTER TABLE exam_questions ADD COLUMN IF NOT EXISTS points NUMERIC(4,1) DEFAULT 1;

CREATE TABLE IF NOT EXISTS question_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_attempts (
    id BIGSERIAL PRIMARY KEY,
    exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES evalia_users(id) ON DELETE CASCADE,
    correct_count INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    score NUMERIC(5, 2) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_student ON exam_attempts(exam_id, student_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_submitted_at ON exam_attempts(submitted_at);
