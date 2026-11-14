package ma.ensiasd.evalia.exam;

public class ExamSummary {
    private Long id;
    private String title;
    private String description;
    private String teacherName;
    private String createdAt;
    private int questionCount;

    public ExamSummary() {}

    public ExamSummary(Long id, String title, String description, String teacherName, String createdAt, int questionCount) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.teacherName = teacherName;
        this.createdAt = createdAt;
        this.questionCount = questionCount;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public int getQuestionCount() {
        return questionCount;
    }
}
