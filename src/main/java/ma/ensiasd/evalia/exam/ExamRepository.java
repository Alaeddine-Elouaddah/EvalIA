package ma.ensiasd.evalia.exam;

import jakarta.enterprise.context.ApplicationScoped;
import ma.ensiasd.evalia.auth.DatabaseConfig;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ExamRepository {

    /** Résultat d'une tentative de mise à jour d'examen. */
    public enum UpdateStatus { UPDATED, NOT_FOUND, LOCKED_BY_ATTEMPTS }

    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 6;
    private static final SecureRandom CODE_RANDOM = new SecureRandom();
    private static final DateTimeFormatter OPENS_AT_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

    /** Colonnes d'examen + participants calculés (alias de table obligatoire : "e"). */
    private static final String EXAM_SELECT = """
            e.id, e.title, e.description, e.teacher_id, e.teacher_name, e.created_at,
            e.subject, e.status, e.access_code, e.access_enabled, e.duration_minutes, e.opens_at,
            e.language, e.mode, e.targets, e.reveal_results, e.randomize_questions,
            
            (SELECT COUNT(DISTINCT a.student_id) FROM exam_attempts a WHERE a.exam_id = e.id) AS participants
            """;

    // ------------------------------------------------------------------
    // Parcours étudiant (contrats inchangés)
    // ------------------------------------------------------------------

    public List<ExamSummary> findAvailableExams() {
        List<ExamSummary> exams = new ArrayList<>();
        String sql = """
            SELECT e.id, e.title, e.description, e.teacher_name, e.created_at,
                   e.subject, e.status, e.duration_minutes, e.opens_at, e.language,
                   e.access_enabled,
                   (SELECT COUNT(*) FROM exam_questions q WHERE q.exam_id = e.id) AS question_count,
                   (SELECT COUNT(DISTINCT a.student_id) FROM exam_attempts a WHERE a.exam_id = e.id) AS participants
            FROM exams e
            WHERE e.status = 'published'
              AND e.access_enabled = TRUE
            ORDER BY e.id DESC
            """;
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                exams.add(new ExamSummary(
                    rs.getLong("id"),
                    rs.getString("title"),
                    rs.getString("description"),
                    rs.getString("teacher_name"),
                    rs.getString("created_at"),
                    rs.getInt("question_count"),
                    rs.getString("subject"),
                    rs.getString("status"),
                    getNullableInteger(rs, "duration_minutes"),
                    formatOpensAt(rs.getTimestamp("opens_at")),
                    rs.getString("language"),
                    getNullableBoolean(rs, "access_enabled"),
                    rs.getInt("participants")
                ));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erreur lors du chargement des examens disponibles: " + e.getMessage(), e);
        }
        return exams;
    }

    public ExamAttemptDTO createAttempt(
            Long examId,
            Long studentId,
            String studentName,
            String studentEmail,
            int correctCount,
            int totalQuestions,
            double score,
            String examTitle) {
        String sql = """
            INSERT INTO exam_attempts (exam_id, student_id, correct_count, total_questions, score)
            VALUES (?, ?, ?, ?, ?)
            RETURNING id, submitted_at
            """;
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, examId);
            ps.setLong(2, studentId);
            ps.setInt(3, correctCount);
            ps.setInt(4, totalQuestions);
            ps.setBigDecimal(5, BigDecimal.valueOf(score));
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new ExamAttemptDTO(
                        rs.getLong("id"),
                        examId,
                        examTitle,
                        studentName,
                        studentEmail,
                        correctCount,
                        totalQuestions,
                        score,
                        rs.getString("submitted_at")
                    );
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement de la note: " + e.getMessage(), e);
        }
        throw new RuntimeException("La tentative n'a pas pu être enregistrée");
    }

    public List<ExamAttemptDTO> findStudentAttempts(Long studentId) {
        String sql = """
            SELECT a.id, a.exam_id, e.title AS exam_title, u.name AS student_name, u.email AS student_email,
                   a.correct_count, a.total_questions, a.score, a.submitted_at
            FROM exam_attempts a
            JOIN exams e ON e.id = a.exam_id
            JOIN evalia_users u ON u.id = a.student_id
            WHERE a.student_id = ?
            ORDER BY a.submitted_at DESC, a.id DESC
            """;
        return findAttempts(sql, studentId);
    }

    public List<ExamAttemptDTO> findTeacherGrades(Long teacherId) {
        String sql = """
            SELECT a.id, a.exam_id, e.title AS exam_title, u.name AS student_name, u.email AS student_email,
                   a.correct_count, a.total_questions, a.score, a.submitted_at
            FROM exam_attempts a
            JOIN exams e ON e.id = a.exam_id
            JOIN evalia_users u ON u.id = a.student_id
            WHERE e.teacher_id = ?
            ORDER BY a.submitted_at DESC, a.id DESC
            """;
        return findAttempts(sql, teacherId);
    }

    private List<ExamAttemptDTO> findAttempts(String sql, Long ownerId) {
        List<ExamAttemptDTO> attempts = new ArrayList<>();
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, ownerId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    attempts.add(new ExamAttemptDTO(
                        rs.getLong("id"),
                        rs.getLong("exam_id"),
                        rs.getString("exam_title"),
                        rs.getString("student_name"),
                        rs.getString("student_email"),
                        rs.getInt("correct_count"),
                        rs.getInt("total_questions"),
                        rs.getDouble("score"),
                        rs.getString("submitted_at")
                    ));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erreur lors du chargement des notes: " + e.getMessage(), e);
        }
        return attempts;
    }

    public List<TeacherStudentDTO> findTeacherStudents(Long teacherId) {
        List<TeacherStudentDTO> students = new ArrayList<>();
        String sql = """
            SELECT u.id, u.name, u.email,
                   COUNT(a.id) AS attempt_count,
                   COUNT(DISTINCT a.exam_id) AS exams_taken,
                   COALESCE(AVG(a.score), 0) AS average_score
            FROM evalia_users u
            LEFT JOIN exams e ON e.teacher_id = ?
            LEFT JOIN exam_attempts a ON a.exam_id = e.id AND a.student_id = u.id
            WHERE u.role = 'STUDENT'
            GROUP BY u.id, u.name, u.email
            ORDER BY u.name, u.id
            """;
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, teacherId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    students.add(new TeacherStudentDTO(
                        rs.getLong("id"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getLong("attempt_count"),
                        rs.getLong("exams_taken"),
                        rs.getDouble("average_score")
                    ));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erreur lors du chargement des étudiants: " + e.getMessage(), e);
        }
        return students;
    }

    // ------------------------------------------------------------------
    // Espace enseignant
    // ------------------------------------------------------------------

    public Exam createExam(Exam exam) {
        String examSql = """
            INSERT INTO exams (title, description, teacher_id, teacher_name, subject, status, access_code,
                               access_enabled, duration_minutes, opens_at, language, mode, targets,
                               reveal_results, randomize_questions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING id, created_at
            """;

        try (Connection conn = DatabaseConfig.getConnection()) {
            conn.setAutoCommit(false);
            try {
                String status = normalizeStatus(exam.getStatus(), "published");
                String accessCode = normalizeAccessCode(exam.getAccessCode());
                if (accessCode == null && "published".equals(status)) {
                    accessCode = generateUniqueAccessCode(conn);
                }
                boolean accessEnabled = exam.getAccessEnabled() == null || exam.getAccessEnabled();
                boolean revealResults = exam.getRevealResults() == null || exam.getRevealResults();
                boolean randomizeQuestions = exam.getRandomizeQuestions() != null && exam.getRandomizeQuestions();
                List<String> targets = normalizeTargets(exam.getTargets());

                try (PreparedStatement psExam = conn.prepareStatement(examSql)) {
                    psExam.setString(1, exam.getTitle());
                    psExam.setString(2, exam.getDescription());
                    psExam.setLong(3, exam.getTeacherId());
                    psExam.setString(4, exam.getTeacherName());
                    psExam.setString(5, exam.getSubject());
                    psExam.setString(6, status);
                    psExam.setString(7, accessCode);
                    psExam.setBoolean(8, accessEnabled);
                    setNullableInteger(psExam, 9, exam.getDurationMinutes());
                    psExam.setTimestamp(10, toTimestamp(parseOpensAt(exam.getOpensAt())));
                    psExam.setString(11, normalizeLanguage(exam.getLanguage()));
                    psExam.setString(12, normalizeMode(exam.getMode()));
                    setTextArray(conn, psExam, 13, targets);
                    psExam.setBoolean(14, revealResults);
                    psExam.setBoolean(15, randomizeQuestions);
                    try (ResultSet rs = psExam.executeQuery()) {
                        if (rs.next()) {
                            exam.setId(rs.getLong("id"));
                            exam.setCreatedAt(rs.getString("created_at"));
                        }
                    }
                }

                insertQuestions(conn, exam);

                // Refléter l'état réellement persisté dans la réponse.
                exam.setStatus(status);
                exam.setAccessCode(accessCode);
                exam.setAccessEnabled(accessEnabled);
                exam.setRevealResults(revealResults);
                exam.setRandomizeQuestions(randomizeQuestions);
                exam.setLanguage(normalizeLanguage(exam.getLanguage()));
                exam.setMode(normalizeMode(exam.getMode()));
                exam.setTargets(targets);
                exam.setParticipants(0);

                conn.commit();
                return exam;
            } catch (Exception e) {
                conn.rollback();
                throw new RuntimeException("Erreur lors de la création de l'examen: " + e.getMessage(), e);
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erreur de connexion base de données: " + e.getMessage(), e);
        }
    }

    /**
     * Met à jour un examen existant.
     * <p>
     * Le contrôle d'intégrité est effectué dans la même transaction que l'écriture :
     * la ligne d'examen est verrouillée ({@code FOR UPDATE}) puis l'existence d'au moins
     * une tentative est vérifiée. Si une tentative existe, aucune modification n'est
     * appliquée et {@link UpdateStatus#LOCKED_BY_ATTEMPTS} est renvoyé.
     */
    public UpdateStatus updateExam(Exam exam) {
        if (exam == null || exam.getId() == null) {
            return UpdateStatus.NOT_FOUND;
        }

        String lockSql = "SELECT status, access_code FROM exams WHERE id = ? AND teacher_id = ? FOR UPDATE";
        String attemptsSql = "SELECT 1 FROM exam_attempts WHERE exam_id = ? LIMIT 1";
        String updateSql = """
            UPDATE exams SET title = ?, description = ?, subject = ?, status = ?, access_code = ?,
                             duration_minutes = ?, opens_at = ?, language = ?, mode = ?, targets = ?,
                             reveal_results = ?, randomize_questions = ?, access_mode = ?
            WHERE id = ? AND teacher_id = ?
            """;

        try (Connection conn = DatabaseConfig.getConnection()) {
            conn.setAutoCommit(false);
            try {
                String existingStatus;
                String existingCode;
                try (PreparedStatement ps = conn.prepareStatement(lockSql)) {
                    ps.setLong(1, exam.getId());
                    ps.setLong(2, exam.getTeacherId());
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            conn.rollback();
                            return UpdateStatus.NOT_FOUND;
                        }
                        existingStatus = rs.getString("status");
                        existingCode = rs.getString("access_code");
                    }
                }

                try (PreparedStatement ps = conn.prepareStatement(attemptsSql)) {
                    ps.setLong(1, exam.getId());
                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) {
                            conn.rollback();
                            return UpdateStatus.LOCKED_BY_ATTEMPTS;
                        }
                    }
                }

                String status = normalizeStatus(exam.getStatus(), existingStatus);
                String accessCode = normalizeAccessCode(exam.getAccessCode());
                if (accessCode == null) {
                    accessCode = existingCode;
                }
                if (accessCode == null && "published".equals(status)) {
                    accessCode = generateUniqueAccessCode(conn);
                }
                boolean revealResults = exam.getRevealResults() == null || exam.getRevealResults();
                boolean randomizeQuestions = exam.getRandomizeQuestions() != null && exam.getRandomizeQuestions();
                List<String> targets = normalizeTargets(exam.getTargets());

                try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
                    ps.setString(1, exam.getTitle());
                    ps.setString(2, exam.getDescription());
                    ps.setString(3, exam.getSubject());
                    ps.setString(4, status);
                    ps.setString(5, accessCode);
                    setNullableInteger(ps, 6, exam.getDurationMinutes());
                    ps.setTimestamp(7, toTimestamp(parseOpensAt(exam.getOpensAt())));
                    ps.setString(8, normalizeLanguage(exam.getLanguage()));
                    ps.setString(9, normalizeMode(exam.getMode()));
                    setTextArray(conn, ps, 10, targets);
                    ps.setBoolean(11, revealResults);
                    ps.setBoolean(12, randomizeQuestions);
                    ps.setString(13, "direct".equals(exam.getAccessMode()) ? "direct" : "code");
                    ps.setLong(14, exam.getId());
                    ps.setLong(15, exam.getTeacherId());
                    ps.executeUpdate();
                }

                // Remplacement complet des questions (les options suivent en cascade).
                try (PreparedStatement ps = conn.prepareStatement("DELETE FROM exam_questions WHERE exam_id = ?")) {
                    ps.setLong(1, exam.getId());
                    ps.executeUpdate();
                }
                insertQuestions(conn, exam);

                exam.setStatus(status);
                exam.setAccessCode(accessCode);
                exam.setRevealResults(revealResults);
                exam.setRandomizeQuestions(randomizeQuestions);
                exam.setLanguage(normalizeLanguage(exam.getLanguage()));
                exam.setMode(normalizeMode(exam.getMode()));
                exam.setTargets(targets);

                conn.commit();
                return UpdateStatus.UPDATED;
            } catch (Exception e) {
                conn.rollback();
                throw new RuntimeException("Erreur lors de la mise à jour de l'examen: " + e.getMessage(), e);
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erreur de connexion base de données: " + e.getMessage(), e);
        }
    }

    /**
     * Régénère le code d'accès d'un examen possédé par cet enseignant.
     * Retourne un {@code Optional} vide si l'examen n'existe pas ou n'appartient pas à l'enseignant.
     */
    public Optional<String> regenerateAccessCode(Long examId, Long teacherId) {
        String lockSql = "SELECT id FROM exams WHERE id = ? AND teacher_id = ? FOR UPDATE";
        String updateSql = "UPDATE exams SET access_code = ?, access_enabled = TRUE WHERE id = ?";
        try (Connection conn = DatabaseConfig.getConnection()) {
            conn.setAutoCommit(false);
            try {
                try (PreparedStatement ps = conn.prepareStatement(lockSql)) {
                    ps.setLong(1, examId);
                    ps.setLong(2, teacherId);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            conn.rollback();
                            return Optional.empty();
                        }
                    }
                }
                String code = generateUniqueAccessCode(conn);
                try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
                    ps.setString(1, code);
                    ps.setLong(2, examId);
                    ps.executeUpdate();
                }
                conn.commit();
                return Optional.of(code);
            } catch (Exception e) {
                conn.rollback();
                throw new RuntimeException("Erreur lors de la régénération du code d'accès: " + e.getMessage(), e);
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erreur de connexion base de données: " + e.getMessage(), e);
        }
    }

    /** Active ou désactive l'accès à un examen. Retourne false si l'examen n'est pas trouvé/possédé. */
    public boolean setAccessEnabled(Long examId, Long teacherId, boolean enabled) {
        String sql = "UPDATE exams SET access_enabled = ? WHERE id = ? AND teacher_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setBoolean(1, enabled);
            ps.setLong(2, examId);
            ps.setLong(3, teacherId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Erreur lors de la mise à jour de l'accès à l'examen: " + e.getMessage(), e);
        }
    }

    public List<Exam> findByTeacherId(Long teacherId) {
        List<Exam> exams = new ArrayList<>();
        String sql = "SELECT " + EXAM_SELECT + " FROM exams e WHERE e.teacher_id = ? ORDER BY e.id DESC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, teacherId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Exam exam = mapExam(rs);
                    loadQuestionsForExam(conn, exam);
                    exams.add(exam);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erreur lors de la récupération des examens: " + e.getMessage(), e);
        }
        return exams;
    }

    public Optional<Exam> findById(Long examId) {
        String sql = "SELECT " + EXAM_SELECT + " FROM exams e WHERE e.id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, examId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Exam exam = mapExam(rs);
                    loadQuestionsForExam(conn, exam);
                    return Optional.of(exam);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erreur lors de la recherche de l'examen: " + e.getMessage(), e);
        }
        return Optional.empty();
    }

    /** Recherche un examen publié par son code d'accès (espace étudiant). */
    public Optional<Exam> findByAccessCode(String code) {
        if (code == null || code.isBlank()) return Optional.empty();
        String sql = "SELECT " + EXAM_SELECT + " FROM exams e WHERE UPPER(e.access_code) = UPPER(?) AND e.status = 'published'";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, code.trim());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Exam exam = mapExam(rs);
                    loadQuestionsForExam(conn, exam);
                    return Optional.of(exam);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erreur lors de la recherche par code: " + e.getMessage(), e);
        }
        return Optional.empty();
    }

    public boolean deleteExam(Long examId, Long teacherId) {
        String sql = "DELETE FROM exams WHERE id = ? AND teacher_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, examId);
            ps.setLong(2, teacherId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Erreur lors de la suppression de l'examen: " + e.getMessage(), e);
        }
    }

    // ------------------------------------------------------------------
    // Helpers internes
    // ------------------------------------------------------------------

    private void insertQuestions(Connection conn, Exam exam) throws SQLException {
        String questionSql = """
            INSERT INTO exam_questions (exam_id, question, question_type, explanation, order_index, points)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING id
            """;
        String optionSql = "INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES (?, ?, ?, ?)";

        for (int qIdx = 0; qIdx < exam.getQuestions().size(); qIdx++) {
            ExamQuestion q = exam.getQuestions().get(qIdx);
            q.setExamId(exam.getId());
            String qType = "MULTIPLE".equalsIgnoreCase(q.getQuestionType()) ? "MULTIPLE" : "SINGLE";
            double points = q.getPoints() > 0 ? q.getPoints() : 1.0;
            q.setPoints(points);

            try (PreparedStatement psQ = conn.prepareStatement(questionSql)) {
                psQ.setLong(1, exam.getId());
                psQ.setString(2, q.getQuestion());
                psQ.setString(3, qType);
                psQ.setString(4, q.getExplanation());
                psQ.setInt(5, qIdx);
                psQ.setBigDecimal(6, BigDecimal.valueOf(points));
                try (ResultSet rsQ = psQ.executeQuery()) {
                    if (rsQ.next()) {
                        q.setId(rsQ.getLong("id"));
                    }
                }
            }

            for (int oIdx = 0; oIdx < q.getOptions().size(); oIdx++) {
                QuestionOption opt = q.getOptions().get(oIdx);
                try (PreparedStatement psOpt = conn.prepareStatement(optionSql)) {
                    psOpt.setLong(1, q.getId());
                    psOpt.setString(2, opt.getOptionText());
                    psOpt.setBoolean(3, opt.isCorrect());
                    psOpt.setInt(4, oIdx);
                    psOpt.executeUpdate();
                }
            }
        }
    }

    private Exam mapExam(ResultSet rs) throws SQLException {
        Exam exam = new Exam();
        exam.setId(rs.getLong("id"));
        exam.setTitle(rs.getString("title"));
        exam.setDescription(rs.getString("description"));
        exam.setTeacherId(rs.getLong("teacher_id"));
        exam.setTeacherName(rs.getString("teacher_name"));
        exam.setCreatedAt(rs.getString("created_at"));
        exam.setSubject(rs.getString("subject"));
        exam.setStatus(rs.getString("status"));
        exam.setAccessCode(rs.getString("access_code"));
        exam.setAccessEnabled(getNullableBoolean(rs, "access_enabled"));
        exam.setDurationMinutes(getNullableInteger(rs, "duration_minutes"));
        exam.setOpensAt(formatOpensAt(rs.getTimestamp("opens_at")));
        exam.setLanguage(rs.getString("language"));
        exam.setMode(rs.getString("mode"));
        exam.setTargets(readTargets(rs));
        exam.setRevealResults(getNullableBoolean(rs, "reveal_results"));
        exam.setRandomizeQuestions(getNullableBoolean(rs, "randomize_questions"));
        exam.setParticipants(rs.getInt("participants"));
        // exam.setAccessMode(rs.getString("access_mode") != null ? rs.getString("access_mode") : "code");
        return exam;
    }

    private void loadQuestionsForExam(Connection conn, Exam exam) throws SQLException {
        String qSql = "SELECT id, exam_id, question, question_type, explanation, order_index, points FROM exam_questions WHERE exam_id = ? ORDER BY order_index ASC";
        String optSql = "SELECT id, question_id, option_text, is_correct, order_index FROM question_options WHERE question_id = ? ORDER BY order_index ASC";

        try (PreparedStatement psQ = conn.prepareStatement(qSql)) {
            psQ.setLong(1, exam.getId());
            try (ResultSet rsQ = psQ.executeQuery()) {
                while (rsQ.next()) {
                    ExamQuestion q = new ExamQuestion();
                    q.setId(rsQ.getLong("id"));
                    q.setExamId(rsQ.getLong("exam_id"));
                    q.setQuestion(rsQ.getString("question"));
                    q.setQuestionType(rsQ.getString("question_type"));
                    q.setExplanation(rsQ.getString("explanation"));
                    q.setOrderIndex(rsQ.getInt("order_index"));
                    double points = rsQ.getDouble("points");
                    q.setPoints(rsQ.wasNull() ? 1.0 : points);

                    try (PreparedStatement psOpt = conn.prepareStatement(optSql)) {
                        psOpt.setLong(1, q.getId());
                        try (ResultSet rsOpt = psOpt.executeQuery()) {
                            while (rsOpt.next()) {
                                QuestionOption opt = new QuestionOption(
                                    rsOpt.getLong("id"),
                                    rsOpt.getString("option_text"),
                                    rsOpt.getBoolean("is_correct"),
                                    rsOpt.getInt("order_index")
                                );
                                q.getOptions().add(opt);
                            }
                        }
                    }
                    exam.getQuestions().add(q);
                }
            }
        }
    }

    private String generateUniqueAccessCode(Connection conn) throws SQLException {
        for (int attempt = 0; attempt < 12; attempt++) {
            StringBuilder sb = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) {
                sb.append(CODE_ALPHABET.charAt(CODE_RANDOM.nextInt(CODE_ALPHABET.length())));
            }
            String candidate = sb.toString();
            try (PreparedStatement ps = conn.prepareStatement("SELECT 1 FROM exams WHERE access_code = ?")) {
                ps.setString(1, candidate);
                try (ResultSet rs = ps.executeQuery()) {
                    if (!rs.next()) {
                        return candidate;
                    }
                }
            }
        }
        throw new SQLException("Impossible de générer un code d'accès unique");
    }

    private static String normalizeStatus(String status, String fallback) {
        if (status == null || status.isBlank()) {
            return fallback;
        }
        String value = status.trim().toLowerCase();
        return switch (value) {
            case "draft", "published", "finished" -> value;
            default -> fallback;
        };
    }

    private static String normalizeAccessCode(String accessCode) {
        if (accessCode == null) {
            return null;
        }
        String value = accessCode.trim().toUpperCase();
        return value.isEmpty() ? null : value;
    }

    private static String normalizeLanguage(String language) {
        if (language == null || language.isBlank()) {
            return "fr";
        }
        String value = language.trim().toLowerCase();
        return "en".equals(value) ? "en" : "fr";
    }

    private static String normalizeMode(String mode) {
        if (mode == null || mode.isBlank()) {
            return "manual";
        }
        String value = mode.trim().toLowerCase();
        return "ai".equals(value) ? "ai" : "manual";
    }

    private static List<String> normalizeTargets(List<String> targets) {
        if (targets == null) {
            return null;
        }
        List<String> cleaned = new ArrayList<>();
        for (String target : targets) {
            if (target != null && !target.isBlank()) {
                cleaned.add(target.trim());
            }
        }
        return cleaned.isEmpty() ? null : cleaned;
    }

    private static LocalDateTime parseOpensAt(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String v = value.trim();
        String[] patterns = {
            "yyyy-MM-dd'T'HH:mm:ss", "yyyy-MM-dd'T'HH:mm", "yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd HH:mm"
        };
        for (String pattern : patterns) {
            try {
                return LocalDateTime.parse(v, DateTimeFormatter.ofPattern(pattern));
            } catch (Exception ignored) {
                // essayer le format suivant
            }
        }
        try {
            return LocalDate.parse(v, DateTimeFormatter.ofPattern("yyyy-MM-dd")).atStartOfDay();
        } catch (Exception ignored) {
            return null;
        }
    }

    private static Timestamp toTimestamp(LocalDateTime value) {
        return value == null ? null : Timestamp.valueOf(value);
    }

    private static String formatOpensAt(Timestamp value) {
        return value == null ? null : value.toLocalDateTime().format(OPENS_AT_FORMAT);
    }

    private static void setNullableInteger(PreparedStatement ps, int index, Integer value) throws SQLException {
        if (value == null) {
            ps.setNull(index, Types.INTEGER);
        } else {
            ps.setInt(index, value);
        }
    }

    private static Integer getNullableInteger(ResultSet rs, String column) throws SQLException {
        int value = rs.getInt(column);
        return rs.wasNull() ? null : value;
    }

    private static Boolean getNullableBoolean(ResultSet rs, String column) throws SQLException {
        boolean value = rs.getBoolean(column);
        return rs.wasNull() ? null : value;
    }

    private static void setTextArray(Connection conn, PreparedStatement ps, int index, List<String> values) throws SQLException {
        if (values == null) {
            ps.setNull(index, Types.ARRAY);
        } else {
            ps.setArray(index, conn.createArrayOf("text", values.toArray()));
        }
    }

    private static List<String> readTargets(ResultSet rs) throws SQLException {
        Array array = rs.getArray("targets");
        if (array == null) {
            return null;
        }
        try {
            Object raw = array.getArray();
            if (raw instanceof String[] values) {
                return new ArrayList<>(List.of(values));
            }
            return null;
        } finally {
            array.free();
        }
    }
}
