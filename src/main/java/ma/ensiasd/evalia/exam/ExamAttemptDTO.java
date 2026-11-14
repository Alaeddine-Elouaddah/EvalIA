package ma.ensiasd.evalia.exam;

public class ExamAttemptDTO {
    private Long id;
    private Long examId;
    private String examTitle;
    private String studentName;
    private String studentEmail;
    private int correctCount;
    private int totalQuestions;
    private double score;
    private String submittedAt;

    public ExamAttemptDTO() {}

    public ExamAttemptDTO(
            Long id,
            Long examId,
            String examTitle,
            String studentName,
            String studentEmail,
            int correctCount,
            int totalQuestions,
            double score,
            String submittedAt) {
        this.id = id;
        this.examId = examId;
        this.examTitle = examTitle;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.correctCount = correctCount;
        this.totalQuestions = totalQuestions;
        this.score = score;
        this.submittedAt = submittedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getExamId() {
        return examId;
    }

    public String getExamTitle() {
        return examTitle;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public int getCorrectCount() {
        return correctCount;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public double getScore() {
        return score;
    }

    public String getSubmittedAt() {
        return submittedAt;
    }
}
