package ma.ensiasd.evalia.exam;

import java.util.List;

public class ExamAttemptRequest {
    private List<List<Integer>> answers;
    private Long startedAtTimestamp;
    private Integer violationCount;
    private List<String> violations;

    public List<List<Integer>> getAnswers() {
        return answers;
    }

    public void setAnswers(List<List<Integer>> answers) {
        this.answers = answers;
    }

    public Long getStartedAtTimestamp() {
        return startedAtTimestamp;
    }

    public void setStartedAtTimestamp(Long startedAtTimestamp) {
        this.startedAtTimestamp = startedAtTimestamp;
    }

    public Integer getViolationCount() {
        return violationCount;
    }

    public void setViolationCount(Integer violationCount) {
        this.violationCount = violationCount;
    }

    public List<String> getViolations() {
        return violations;
    }

    public void setViolations(List<String> violations) {
        this.violations = violations;
    }
}
