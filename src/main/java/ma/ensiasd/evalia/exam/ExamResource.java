package ma.ensiasd.evalia.exam;

import io.jsonwebtoken.Claims;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import ma.ensiasd.evalia.auth.JwtUtil;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Path("/exams")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ExamResource {

    @Inject
    ExamRepository examRepository;

    private Claims authenticateTeacher(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new NotAuthorizedException("Token d'authentification manquant");
        }
        String token = authHeader.substring(7);
        try {
            Claims claims = JwtUtil.validateToken(token);
            String role = claims.get("role", String.class);
            if (!"TEACHER".equalsIgnoreCase(role)) {
                throw new ForbiddenException("Seuls les professeurs peuvent gérer les examens");
            }
            return claims;
        } catch (ForbiddenException fe) {
            throw fe;
        } catch (Exception e) {
            throw new NotAuthorizedException("Token JWT invalide ou expiré");
        }
    }

    @POST
    public Response createExam(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader, Exam exam) {
        Claims claims = authenticateTeacher(authHeader);

        if (exam == null || exam.getTitle() == null || exam.getTitle().trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Le titre de l'examen est obligatoire"))
                    .build();
        }

        if (exam.getQuestions() == null || exam.getQuestions().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "L'examen doit contenir au moins une question"))
                    .build();
        }

        // Validate each question
        for (int i = 0; i < exam.getQuestions().size(); i++) {
            ExamQuestion q = exam.getQuestions().get(i);
            if (q.getQuestion() == null || q.getQuestion().trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "La question n°" + (i + 1) + " n'a pas de texte"))
                        .build();
            }
            if (q.getOptions() == null || q.getOptions().size() < 2) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "La question n°" + (i + 1) + " doit avoir au moins 2 options"))
                        .build();
            }

            long correctCount = q.getOptions().stream().filter(QuestionOption::isCorrect).count();
            if (correctCount == 0) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "La question n°" + (i + 1) + " doit avoir au moins une réponse correcte"))
                        .build();
            }

            // Si le type est SINGLE mais plusieurs réponses sont cochées
            if ("SINGLE".equalsIgnoreCase(q.getQuestionType()) && correctCount > 1) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "La question n°" + (i + 1) + " est à choix unique mais possède plusieurs réponses correctes"))
                        .build();
            }
        }

        Long teacherId = claims.get("userId", Long.class);
        String teacherName = claims.get("name", String.class);
        exam.setTeacherId(teacherId);
        exam.setTeacherName(teacherName);

        try {
            Exam created = examRepository.createExam(exam);
            return Response.status(Response.Status.CREATED).entity(created).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/my")
    public Response getTeacherExams(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader) {
        Claims claims = authenticateTeacher(authHeader);
        Long teacherId = claims.get("userId", Long.class);
        List<Exam> exams = examRepository.findByTeacherId(teacherId);
        return Response.ok(exams).build();
    }

    @GET
    @Path("/{id}")
    public Response getExamById(@PathParam("id") Long id) {
        Optional<Exam> examOpt = examRepository.findById(id);
        if (examOpt.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Examen introuvable"))
                    .build();
        }
        return Response.ok(examOpt.get()).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteExam(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader, @PathParam("id") Long id) {
        Claims claims = authenticateTeacher(authHeader);
        Long teacherId = claims.get("userId", Long.class);
        boolean deleted = examRepository.deleteExam(id, teacherId);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Examen introuvable ou non autorisé"))
                    .build();
        }
        return Response.ok(Map.of("message", "Examen supprimé avec succès")).build();
    }
}
