package ma.ensiasd.evalia.ai;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.json.*;
import jakarta.ws.rs.ProcessingException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import ma.ensiasd.evalia.ai.dto.GeneratedQuestion;

import java.io.IOException;
import java.io.StringReader;
import java.net.SocketTimeoutException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@ApplicationScoped
public class AiClient {

    private static final String DEFAULT_MODEL = "gemini-3.8-flash";
    private static final String FALLBACK_MODEL = "gemini-flash-latest";
    private static final int MAX_TRIES = 4;

    private final Client http = ClientBuilder.newBuilder()
      .connectTimeout(15, TimeUnit.SECONDS)
      .readTimeout(180, TimeUnit.SECONDS)
      .build();

    /** Lit une variable d'environnement, sinon le fichier .env à la racine du projet. */
    private static String readConfig(String name) {
        String v = System.getenv(name);
        if (v != null && !v.isBlank()) return v;

        Path env = Paths.get(System.getProperty("user.dir"), ".env");
        if (Files.exists(env)) {
            try {
                for (String line : Files.readAllLines(env)) {
                    line = line.trim();
                    if (line.startsWith(name + "=")) {
                        return line.substring(name.length() + 1).trim();
                    }
                }
            } catch (IOException ignored) {
            }
        }
        return null;
    }

    private static boolean isTimeout(Throwable e) {
        while (e != null) {
            if (e instanceof SocketTimeoutException) return true;
            String msg = e.getMessage();
            if (msg != null && msg.toLowerCase().contains("timed out")) return true;
            e = e.getCause();
        }
        return false;
    }

    /** Erreur HTTP avec un message lisible dans le corps de la réponse. */
    private static WebApplicationException error(int status, String msg) {
        return new WebApplicationException(
          Response.status(status).type(MediaType.TEXT_PLAIN).entity(msg).build());
    }

    public List<GeneratedQuestion> generateQcm(String courseText, int nb) {
        String key = readConfig("AI_API_KEY");
        if (key == null || key.isBlank()) {
            throw error(500, "AI_API_KEY non définie (variable d'environnement ou fichier .env)");
        }
        String model = readConfig("AI_MODEL");
        if (model == null || model.isBlank()) model = DEFAULT_MODEL;

        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";

        String prompt = """
            Tu es un enseignant. À partir du cours ci-dessous, génère %d questions à choix multiples
            en français. Chaque question a exactement 4 options et une seule bonne réponse.
            Réponds UNIQUEMENT avec un tableau JSON de la forme :
            [{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]
            correctIndex est l'indice (0 à 3) de la bonne option.

            COURS :
            %s
            """.formatted(nb, courseText);

        JsonObject body = Json.createObjectBuilder()
          .add("contents", Json.createArrayBuilder()
            .add(Json.createObjectBuilder()
              .add("parts", Json.createArrayBuilder()
                .add(Json.createObjectBuilder().add("text", prompt)))))
          .add("generationConfig", Json.createObjectBuilder()
            .add("responseMimeType", "application/json"))
          .build();

        // Appel à Gemini, avec nouvelle tentative sur les erreurs temporaires / timeouts
        String raw = null;
        for (int attempt = 1; attempt <= MAX_TRIES; attempt++) {
            try (Response r = http.target(url)
              .request(MediaType.APPLICATION_JSON)
              .header("x-goog-api-key", key)
              .post(Entity.entity(body.toString(), MediaType.APPLICATION_JSON))) {
                raw = r.readEntity(String.class);
                int status = r.getStatus();
                if (status == 200) break;

                boolean temporary = (status == 503 || status == 429 || status == 500);
                if (!temporary || attempt == MAX_TRIES) {
                    throw error(502, "Erreur API IA (" + status + ") : " + raw);
                }
            } catch (ProcessingException e) {
                if (!isTimeout(e) || attempt == MAX_TRIES) {
                    throw error(504, "L'API IA n'a pas répondu à temps. Réessaie dans quelques minutes. ("
                      + e.getMessage() + ")");
                }
            }
            try {
                Thread.sleep(2000L * attempt); // attend 2 s, 4 s, 6 s
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                throw error(500, "Interrompu");
            }
        }

        // Lecture de la réponse
        try {
            JsonObject root = Json.createReader(new StringReader(raw)).readObject();
            String text = root.getJsonArray("candidates").getJsonObject(0)
              .getJsonObject("content").getJsonArray("parts").getJsonObject(0)
              .getString("text");
            text = text.replace("```json", "").replace("```", "").trim();

            JsonArray arr = Json.createReader(new StringReader(text)).readArray();
            List<GeneratedQuestion> result = new ArrayList<>();
            for (JsonValue v : arr) {
                JsonObject q = v.asJsonObject();
                List<String> options = new ArrayList<>();
                q.getJsonArray("options").forEach(o -> options.add(((JsonString) o).getString()));
                int correct = q.getInt("correctIndex");
                if (options.size() != 4 || correct < 0 || correct > 3) continue; // question invalide ignorée
                result.add(new GeneratedQuestion(
                  q.getString("question"), options, correct,
                  q.getString("explanation", "")));
            }
            return result;
        } catch (Exception e) {
            throw error(502, "Réponse de l'IA illisible : " + e.getMessage() + " | Réponse brute : " + raw);
        }
    }
}