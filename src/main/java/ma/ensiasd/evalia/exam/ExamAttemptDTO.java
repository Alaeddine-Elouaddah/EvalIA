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
    private String startedAt;
    private int integrityScore = 100;
    private int violationCount = 0;
    private String violationLog;

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
        this(id, examId, examTitle, studentName, studentEmail, correctCount, totalQuestions, score, submittedAt, null, 100, 0, null);
    }

    public ExamAttemptDTO(
            Long id,
            Long examId,
            String examTitle,
            String studentName,
            String studentEmail,
            int correctCount,
            int totalQuestions,
            double score,
            String submittedAt,
            String startedAt,
            int integrityScore,
            int violationCount,
            String violationLog) {
        this.id = id;
        this.examId = examId;
        this.examTitle = examTitle;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.correctCount = correctCount;
        this.totalQuestions = totalQuestions;
        this.score = score;
        this.submittedAt = submittedAt;
        this.startedAt = startedAt;
        this.integrityScore = integrityScore;
        this.violationCount = violationCount;
        this.violationLog = violationLog;
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

    public String getStartedAt() {
        return startedAt;
    }

    public int getIntegrityScore() {
        return integrityScore;
    }

    public int getViolationCount() {
        return violationCount;
    }

    public String getViolationLog() {
        return violationLog;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public void setExamTitle(String examTitle) {
        this.examTitle = examTitle;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public void setCorrectCount(int correctCount) {
        this.correctCount = correctCount;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public void setSubmittedAt(String submittedAt) {
        this.submittedAt = submittedAt;
    }

    public void setStartedAt(String startedAt) {
        this.startedAt = startedAt;
    }

    public void setIntegrityScore(int integrityScore) {
        this.integrityScore = integrityScore;
    }

    public void setViolationCount(int violationCount) {
        this.violationCount = violationCount;
    }

    public void setViolationLog(String violationLog) {
        this.violationLog = violationLog;
    }
}
