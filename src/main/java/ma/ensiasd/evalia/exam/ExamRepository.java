package ma.ensiasd.evalia.exam;

import jakarta.enterprise.context.ApplicationScoped;
import ma.ensiasd.evalia.auth.DatabaseConfig;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ExamRepository {

    public Exam createExam(Exam exam) {
        String examSql = "INSERT INTO exams (title, description, teacher_id, teacher_name) VALUES (?, ?, ?, ?) RETURNING id, created_at";
        String questionSql = "INSERT INTO exam_questions (exam_id, question, question_type, explanation, order_index) VALUES (?, ?, ?, ?, ?) RETURNING id";
        String optionSql = "INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES (?, ?, ?, ?)";

        try (Connection conn = DatabaseConfig.getConnection()) {
            conn.setAutoCommit(false);
            try {
                // 1. Insert Exam
                try (PreparedStatement psExam = conn.prepareStatement(examSql)) {
                    psExam.setString(1, exam.getTitle());
                    psExam.setString(2, exam.getDescription());
                    psExam.setLong(3, exam.getTeacherId());
                    psExam.setString(4, exam.getTeacherName());
                    try (ResultSet rs = psExam.executeQuery()) {
                        if (rs.next()) {
                            exam.setId(rs.getLong("id"));
                            exam.setCreatedAt(rs.getString("created_at"));
                        }
                    }
                }

                // 2. Insert Questions & Options
                for (int qIdx = 0; qIdx < exam.getQuestions().size(); qIdx++) {
                    ExamQuestion q = exam.getQuestions().get(qIdx);
                    q.setExamId(exam.getId());
                    String qType = "MULTIPLE".equalsIgnoreCase(q.getQuestionType()) ? "MULTIPLE" : "SINGLE";

                    try (PreparedStatement psQ = conn.prepareStatement(questionSql)) {
                        psQ.setLong(1, exam.getId());
                        psQ.setString(2, q.getQuestion());
                        psQ.setString(3, qType);
                        psQ.setString(4, q.getExplanation());
                        psQ.setInt(5, qIdx);
                        try (ResultSet rsQ = psQ.executeQuery()) {
                            if (rsQ.next()) {
                                q.setId(rsQ.getLong("id"));
                            }
                        }
                    }

                    // Insert options
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

    public List<Exam> findByTeacherId(Long teacherId) {
        List<Exam> exams = new ArrayList<>();
        String sql = "SELECT id, title, description, teacher_id, teacher_name, created_at FROM exams WHERE teacher_id = ? ORDER BY id DESC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, teacherId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Exam exam = new Exam();
                    exam.setId(rs.getLong("id"));
                    exam.setTitle(rs.getString("title"));
                    exam.setDescription(rs.getString("description"));
                    exam.setTeacherId(rs.getLong("teacher_id"));
                    exam.setTeacherName(rs.getString("teacher_name"));
                    exam.setCreatedAt(rs.getString("created_at"));
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
        String sql = "SELECT id, title, description, teacher_id, teacher_name, created_at FROM exams WHERE id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, examId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Exam exam = new Exam();
                    exam.setId(rs.getLong("id"));
                    exam.setTitle(rs.getString("title"));
                    exam.setDescription(rs.getString("description"));
                    exam.setTeacherId(rs.getLong("teacher_id"));
                    exam.setTeacherName(rs.getString("teacher_name"));
                    exam.setCreatedAt(rs.getString("created_at"));
                    loadQuestionsForExam(conn, exam);
                    return Optional.of(exam);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erreur lors de la recherche de l'examen: " + e.getMessage(), e);
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

    private void loadQuestionsForExam(Connection conn, Exam exam) throws SQLException {
        String qSql = "SELECT id, exam_id, question, question_type, explanation, order_index FROM exam_questions WHERE exam_id = ? ORDER BY order_index ASC";
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

                    // Options
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
}
