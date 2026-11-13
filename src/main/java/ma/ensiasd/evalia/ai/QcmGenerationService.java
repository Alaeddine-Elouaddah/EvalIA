package ma.ensiasd.evalia.ai;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import ma.ensiasd.evalia.ai.dto.GeneratedQuestion;
import ma.ensiasd.evalia.extraction.TextExtractor;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@ApplicationScoped
public class QcmGenerationService {

    private static final int MAX_CHARS = 30_000;

    @Inject TextExtractor extractor;
    @Inject AiClient aiClient;

    public List<GeneratedQuestion> generate(String filename, InputStream in, int nb) throws IOException {
        String text = extractor.extract(filename, in);
        if (text.isBlank()) {
            throw new BadRequestException("Aucun texte trouvé dans le fichier (PDF scanné ?)");
        }
        if (text.length() > MAX_CHARS) {
            text = text.substring(0, MAX_CHARS);
        }
        return aiClient.generateQcm(text, nb);
    }
}