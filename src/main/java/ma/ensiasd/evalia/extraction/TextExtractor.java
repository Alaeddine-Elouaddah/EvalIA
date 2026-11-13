package ma.ensiasd.evalia.extraction;


import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.BadRequestException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.IOException;
import java.io.InputStream;

@ApplicationScoped
public class TextExtractor {

    public String extract(String filename, InputStream in) throws IOException {
        if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Seuls les fichiers PDF sont acceptés");
        }
        try (PDDocument doc = Loader.loadPDF(in.readAllBytes())) {
            return new PDFTextStripper().getText(doc);
        } catch (IOException e) {
            throw new BadRequestException("PDF illisible ou corrompu");
        }
    }
}