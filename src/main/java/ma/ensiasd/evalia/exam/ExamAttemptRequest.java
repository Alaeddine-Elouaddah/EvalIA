package ma.ensiasd.evalia.exam;

import java.util.List;

public class ExamAttemptRequest {
    private List<List<Integer>> answers;

    public List<List<Integer>> getAnswers() {
        return answers;
    }

    public void setAnswers(List<List<Integer>> answers) {
        this.answers = answers;
    }
}
