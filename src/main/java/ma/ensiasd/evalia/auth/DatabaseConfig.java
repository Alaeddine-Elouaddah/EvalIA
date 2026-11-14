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
                    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """);
            stmt.execute("CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_student ON exam_attempts(exam_id, student_id)");
            stmt.execute("CREATE INDEX IF NOT EXISTS idx_exam_attempts_submitted_at ON exam_attempts(submitted_at)");
        } catch (SQLException e) {
            System.err.println("Database auto-init failed or skipped: " + e.getMessage());
        }
    }
}
