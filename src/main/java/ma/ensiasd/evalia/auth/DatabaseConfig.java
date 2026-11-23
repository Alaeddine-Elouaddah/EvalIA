package ma.ensiasd.evalia.auth;

import java.io.File;
import java.io.FileInputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;

public class DatabaseConfig {

    private static String url;
    private static String user;
    private static String password;

    static {
        loadConfig();
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("PostgreSQL driver not found", e);
        }
    }

    private static void loadConfig() {
        Properties props = new Properties();

        // Charger depuis le fichier .env
        File envFile = new File(".env");
        if (!envFile.exists()) {
            envFile = new File("../.env");
        }
        if (envFile.exists()) {
            try (FileInputStream fis = new FileInputStream(envFile)) {
                props.load(fis);
            } catch (Exception ignored) {}
        }

        url = System.getenv("DB_URL");
        if (url == null) url = props.getProperty("DB_URL", "jdbc:postgresql://localhost:5432/evalia");

        user = System.getenv("DB_USER");
        if (user == null) user = props.getProperty("DB_USER", "postgres");

        password = System.getenv("DB_PASSWORD");
        if (password == null) password = props.getProperty("DB_PASSWORD", "alae");
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, user, password);
    }

    public static void initDatabase() {
        String sql = """
            CREATE TABLE IF NOT EXISTS evalia_users (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT', 'TEACHER')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """;
        try (Connection conn = getConnection(); Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
            stmt.execute("ALTER TABLE evalia_users ADD COLUMN IF NOT EXISTS profile_photo TEXT");
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS exams (
                    id BIGSERIAL PRIMARY KEY,
                    title VARCHAR(200) NOT NULL,
                    description TEXT,
                    teacher_id BIGINT NOT NULL REFERENCES evalia_users(id),
                    teacher_name VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """);
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS exam_questions (
                    id BIGSERIAL PRIMARY KEY,
                    exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
                    question TEXT NOT NULL,
                    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('SINGLE', 'MULTIPLE')),
                    explanation TEXT,
                    order_index INTEGER NOT NULL
                )
                """);
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS question_options (
                    id BIGSERIAL PRIMARY KEY,
                    question_id BIGINT NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
                    option_text TEXT NOT NULL,
                    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
                    order_index INTEGER NOT NULL
                )
                """);
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS exam_attempts (
                    id BIGSERIAL PRIMARY KEY,
                    exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
                    student_id BIGINT NOT NULL REFERENCES evalia_users(id) ON DELETE CASCADE,
                    correct_count INTEGER NOT NULL,
                    total_questions INTEGER NOT NULL,
                    score NUMERIC(5, 2) NOT NULL,
                    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    integrity_score INTEGER DEFAULT 100,
                    violation_count INTEGER DEFAULT 0,
                    violation_log TEXT
                )
                """);
            stmt.execute("CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_student ON exam_attempts(exam_id, student_id)");
            stmt.execute("CREATE INDEX IF NOT EXISTS idx_exam_attempts_submitted_at ON exam_attempts(submitted_at)");
            stmt.execute("ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
            stmt.execute("ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS integrity_score INTEGER DEFAULT 100");
            stmt.execute("ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS violation_count INTEGER DEFAULT 0");
            stmt.execute("ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS violation_log TEXT");
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS exam_violations (
                    id BIGSERIAL PRIMARY KEY,
                    exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
                    student_id BIGINT NOT NULL REFERENCES evalia_users(id) ON DELETE CASCADE,
                    reason TEXT NOT NULL,
                    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """);
            stmt.execute("CREATE INDEX IF NOT EXISTS idx_exam_violations_exam_student ON exam_violations(exam_id, student_id)");

            // ------------------------------------------------------------------
            // Migration additive et non destructive : métadonnées produit des examens.
            // Chaque instruction est idempotente (ADD COLUMN IF NOT EXISTS) et
            // n'écrase ni ne supprime aucune colonne ni aucune donnée existante.
            // ------------------------------------------------------------------
            stmt.execute("ALTER TABLE exams ADD COLUMN IF NOT EXISTS subject VARCHAR(120)");
            stmt.execute("ALTER TABLE exams ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'published'");
            stmt.execute("ALTER TABLE exams ADD COLUMN IF NOT EXISTS access_code VARCHAR(6)");
            stmt.execute("ALTER TABLE exams ADD COLUMN IF NOT EXISTS access_enabled BOOLEAN NOT NULL DEFAULT TRUE");
            stmt.execute("ALTER TABLE exams ADD COLUMN IF NOT EXISTS duration_minutes INTEGER");
            stmt.execute("ALTER TABLE exams ADD COLUMN IF NOT EXISTS opens_at TIMESTAMP");
            stmt.execute("ALTER TABLE exams ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'fr'");
            stmt.execute("ALTER TABLE exams ADD COLUMN IF NOT EXISTS mode VARCHAR(10) DEFAULT 'manual'");
            stmt.execute("ALTER TABLE exams ADD COLUMN IF NOT EXISTS targets TEXT[]");
            stmt.execute("ALTER TABLE exams ADD COLUMN IF NOT EXISTS reveal_results BOOLEAN DEFAULT TRUE");
            stmt.execute("ALTER TABLE exams ADD COLUMN IF NOT EXISTS randomize_questions BOOLEAN DEFAULT FALSE");
            stmt.execute("ALTER TABLE exam_questions ADD COLUMN IF NOT EXISTS points NUMERIC(4,1) DEFAULT 1");
            stmt.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS idx_exams_access_code
                    ON exams(access_code) WHERE access_code IS NOT NULL
                """);
        } catch (SQLException e) {
            System.err.println("Database auto-init failed or skipped: " + e.getMessage());
        }
    }
}
