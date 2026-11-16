package ma.ensiasd.evalia.exam;

public class ExamSummary {
    private Long id;
    private String title;
    private String description;
    private String teacherName;
    private String createdAt;
    private int questionCount;

    // --- Métadonnées produit (Phase 1) ---
    private String subject;
    private String status;
    private Integer durationMinutes;
    private String opensAt;
    private String language;
    private Boolean accessEnabled;
    private String accessMode;
    private int participants;

    public ExamSummary() {}

    /** Constructeur historique conservé pour ne pas casser les appels existants. */
    public ExamSummary(Long id, String title, String description, String teacherName, String createdAt, int questionCount) {
        this(id, title, description, teacherName, createdAt, questionCount,
             null, null, null, null, null, null, null, 0);
    }

    /** Constructeur à 13 paramètres pour la compatibilité avec le code existant (sans accessMode). */
    public ExamSummary(Long id, String title, String description, String teacherName, String createdAt, int questionCount,
                       String subject, String status, Integer durationMinutes, String opensAt, String language,
                       Boolean accessEnabled, int participants) {
        this(id, title, description, teacherName, createdAt, questionCount,
             subject, status, durationMinutes, opensAt, language, accessEnabled, "code", participants);
    }

    public ExamSummary(Long id, String title, String description, String teacherName, String createdAt, int questionCount,
                       String subject, String status, Integer durationMinutes, String opensAt, String language,
                       Boolean accessEnabled, String accessMode, int participants) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.teacherName = teacherName;
        this.createdAt = createdAt;
        this.questionCount = questionCount;
        this.subject = subject;
        this.status = status;
        this.durationMinutes = durationMinutes;
        this.opensAt = opensAt;
        this.language = language;
        this.accessEnabled = accessEnabled;
        this.accessMode = accessMode;
        this.participants = participants;
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

    public String getSubject() {
        return subject;
    }

    public String getStatus() {
        return status;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public String getOpensAt() {
        return opensAt;
    }

    public String getLanguage() {
        return language;
    }

    public Boolean getAccessEnabled() {
        return accessEnabled;
    }

    public int getParticipants() {
        return participants;
    }

    public String getAccessMode() {
        return accessMode;
    }

    public void setAccessMode(String accessMode) {
        this.accessMode = accessMode;
    }
}
