package ma.ensiasd.evalia.exam;

public class TeacherStudentDTO {
    private Long id;
    private String name;
    private String email;
    private long attemptCount;
    private long examsTaken;
    private double averageScore;

    public TeacherStudentDTO() {}

    public TeacherStudentDTO(Long id, String name, String email, long attemptCount, long examsTaken, double averageScore) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.attemptCount = attemptCount;
        this.examsTaken = examsTaken;
        this.averageScore = averageScore;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public long getAttemptCount() {
        return attemptCount;
    }

    public long getExamsTaken() {
        return examsTaken;
    }

    public double getAverageScore() {
        return averageScore;
    }
}
