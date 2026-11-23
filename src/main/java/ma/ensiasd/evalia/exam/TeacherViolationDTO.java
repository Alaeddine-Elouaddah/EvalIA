package ma.ensiasd.evalia.exam;

public class TeacherViolationDTO {
    private Long id;
    private Long examId;
    private String examTitle;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String reason;
    private String detectedAt;

    public TeacherViolationDTO(
            Long id,
            Long examId,
            String examTitle,
            Long studentId,
            String studentName,
            String studentEmail,
            String reason,
            String detectedAt) {
        this.id = id;
        this.examId = examId;
        this.examTitle = examTitle;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.reason = reason;
        this.detectedAt = detectedAt;
    }

    public Long getId() { return id; }
    public Long getExamId() { return examId; }
    public String getExamTitle() { return examTitle; }
    public Long getStudentId() { return studentId; }
    public String getStudentName() { return studentName; }
    public String getStudentEmail() { return studentEmail; }
    public String getReason() { return reason; }
    public String getDetectedAt() { return detectedAt; }
}
