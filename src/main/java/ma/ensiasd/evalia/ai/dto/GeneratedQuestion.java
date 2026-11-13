package ma.ensiasd.evalia.ai.dto;

import java.util.List;

public class GeneratedQuestion {
    public String question;
    public List<String> options;
    public int correctIndex;
    public String explanation;

    public GeneratedQuestion() {}

    public GeneratedQuestion(String question, List<String> options, int correctIndex, String explanation) {
        this.question = question;
        this.options = options;
        this.correctIndex = correctIndex;
        this.explanation = explanation;
    }
}