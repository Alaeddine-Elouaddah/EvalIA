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
import java.util.HashSet;
import java.util.Set;
import java.util.LinkedHashSet;

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

    private Claims authenticateStudent(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new NotAuthorizedException("Token d'authentification manquant");
        }
        try {
            Claims claims = JwtUtil.validateToken(authHeader.substring(7));
            if (!"STUDENT".equalsIgnoreCase(claims.get("role", String.class))) {
                throw new ForbiddenException("Seuls les étudiants peuvent passer les examens");
            }
            return claims;
        } catch (ForbiddenException fe) {
            throw fe;
        } catch (Exception e) {
            throw new NotAuthorizedException("Token JWT invalide ou expiré");
        }
    }

    @GET
    @Path("/available")
    public Response getAvailableExams(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader) {
        authenticateStudent(authHeader);
        return Response.ok(examRepository.findAvailableExams()).build();
    }

    @GET
    @Path("/attempts/my")
    public Response getStudentAttempts(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader) {
        Claims claims = authenticateStudent(authHeader);
        Long studentId = claims.get("userId", Long.class);
        return Response.ok(examRepository.findStudentAttempts(studentId)).build();
    }

    @GET
    @Path("/students")
    public Response getTeacherStudents(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader) {
        Claims claims = authenticateTeacher(authHeader);
        Long teacherId = claims.get("userId", Long.class);
        return Response.ok(examRepository.findTeacherStudents(teacherId)).build();
    }

    @GET
    @Path("/grades")
    public Response getTeacherGrades(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader) {
        Claims claims = authenticateTeacher(authHeader);
        Long teacherId = claims.get("userId", Long.class);
        return Response.ok(examRepository.findTeacherGrades(teacherId)).build();
    }

    @GET
    @Path("/violations")
    public Response getTeacherViolations(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader) {
        Claims claims = authenticateTeacher(authHeader);
        Long teacherId = claims.get("userId", Long.class);
        return Response.ok(examRepository.findTeacherViolations(teacherId)).build();
    }

    @GET
    @Path("/{id}/student")
    public Response getExamForStudent(
            @HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathParam("id") Long id) {
        authenticateStudent(authHeader);
        Optional<Exam> examOpt = examRepository.findById(id);
        if (examOpt.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Examen introuvable"))
                    .build();
        }
        Exam exam = examOpt.get();
        exam.getQuestions().forEach(question -> {
            question.setExplanation(null);
            question.getOptions().forEach(option -> option.setCorrect(false));
        });
        // Un étudiant ne doit jamais recevoir le code d'accès de l'examen.
        exam.setAccessCode(null);
        return Response.ok(exam).build();
    }

    @GET
    @Path("/join/{code}")
    public Response getExamByCode(
            @HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathParam("code") String code) {
        authenticateStudent(authHeader);
        Optional<Exam> examOpt = examRepository.findByAccessCode(code);
        if (examOpt.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Code invalide ou examen introuvable"))
                    .build();
        }
        Exam exam = examOpt.get();
        if (!Boolean.TRUE.equals(exam.getAccessEnabled())) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(Map.of("error", "L'accès à cet examen a été désactivé par le professeur."))
                    .build();
        }
        // Masquer les réponses correctes et le code d'accès côté étudiant.
        exam.getQuestions().forEach(question -> {
            question.setExplanation(null);
            question.getOptions().forEach(option -> option.setCorrect(false));
        });
        exam.setAccessCode(null);
        return Response.ok(exam).build();
    }

    @POST
    @Path("/{id}/violations")
    public Response reportViolation(
            @HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathParam("id") Long id,
            Map<String, String> body) {
        Claims claims = authenticateStudent(authHeader);
        if (!examRepository.findById(id).isPresent()) {
            return notFound("Examen introuvable");
        }
        String reason = body == null ? null : body.get("reason");
        if (reason == null || reason.isBlank()) {
            return badRequest("La raison de l'infraction est obligatoire");
        }
        examRepository.createViolation(
                id,
                claims.get("userId", Long.class),
                reason.trim()
        );
        return Response.status(Response.Status.CREATED).build();
    }

    @POST
    @Path("/{id}/attempts")
    public Response submitAttempt(
            @HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathParam("id") Long id,
            ExamAttemptRequest request) {
        Claims claims = authenticateStudent(authHeader);
        Optional<Exam> examOpt = examRepository.findById(id);
        if (examOpt.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Examen introuvable"))
                    .build();
        }

        Exam exam = examOpt.get();

        // Vérification de la deadline serveur si durationMinutes est défini
        java.sql.Timestamp startedAt = null;
        if (request != null && request.getStartedAtTimestamp() != null && request.getStartedAtTimestamp() > 0) {
            startedAt = new java.sql.Timestamp(request.getStartedAtTimestamp());
            if (exam.getDurationMinutes() != null && exam.getDurationMinutes() > 0) {
                long now = System.currentTimeMillis();
                long maxAllowedTimeMs = request.getStartedAtTimestamp() + (exam.getDurationMinutes() * 60L * 1000L) + (60L * 1000L); // +60s de tolérance réseau
                if (now > maxAllowedTimeMs) {
                    return Response.status(Response.Status.BAD_REQUEST)
                            .entity(Map.of("error", "Le temps alloué pour cet examen est expiré (délai dépassé)"))
                            .build();
                }
            }
        }

        List<ExamQuestion> questions = exam.getQuestions();
        if (questions.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Cet examen ne contient aucune question"))
                    .build();
        }
        List<List<Integer>> answers = request == null ? null : request.getAnswers();
        if (answers == null || answers.size() != questions.size()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Répondez à toutes les questions avant de terminer l'examen"))
                    .build();
        }

        int correctCount = 0;
        for (int questionIndex = 0; questionIndex < questions.size(); questionIndex++) {
            ExamQuestion question = questions.get(questionIndex);
            List<Integer> selected = answers.get(questionIndex);
            if (selected == null || selected.isEmpty()
                    || selected.stream().anyMatch(optionIndex ->
                            optionIndex == null || optionIndex < 0 || optionIndex >= question.getOptions().size())
                    || new HashSet<>(selected).size() != selected.size()
                    || ("SINGLE".equalsIgnoreCase(question.getQuestionType()) && selected.size() != 1)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "Une ou plusieurs réponses sont invalides"))
                        .build();
            }

            Set<Integer> correct = new HashSet<>();
            for (int optionIndex = 0; optionIndex < question.getOptions().size(); optionIndex++) {
                if (question.getOptions().get(optionIndex).isCorrect()) {
                    correct.add(optionIndex);
                }
            }
            if (!correct.isEmpty() && correct.size() == selected.size() && correct.containsAll(selected)) {
                correctCount++;
            }
        }

        int totalQuestions = questions.size();
        double score = Math.round(correctCount * 10000.0 / totalQuestions) / 100.0;

        // L'intégrité est recalculée côté serveur à partir du journal persistant,
        // pas uniquement à partir du compteur conservé dans le navigateur.
        Long studentId = claims.get("userId", Long.class);
        LinkedHashSet<String> violationEntries = new LinkedHashSet<>();
        violationEntries.addAll(examRepository.findViolationLog(id, studentId));
        if (request != null && request.getViolations() != null) {
            violationEntries.addAll(request.getViolations());
        }
        int payloadViolationCount = request != null && request.getViolationCount() != null
                ? Math.max(0, request.getViolationCount())
                : 0;
        int violationCount = Math.max(payloadViolationCount, violationEntries.size());
        // Chaque violation retire 15 points d'intégrité (min 0)
        int integrityScore = Math.max(0, 100 - (violationCount * 15));
        String violationLog = null;
        if (!violationEntries.isEmpty()) {
            violationLog = String.join(" | ", violationEntries);
        }

        ExamAttemptDTO result = examRepository.createAttempt(
                id,
                claims.get("userId", Long.class),
                claims.get("name", String.class),
                claims.getSubject(),
                correctCount,
                totalQuestions,
                score,
                exam.getTitle(),
                startedAt,
                integrityScore,
                violationCount,
                violationLog
        );
        return Response.status(Response.Status.CREATED).entity(result).build();
    }

    @POST
    public Response createExam(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader, Exam exam) {
        Claims claims = authenticateTeacher(authHeader);

        String validationError = validateExam(exam);
        if (validationError != null) {
            return badRequest(validationError);
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

    /**
     * Met à jour un examen existant (édition complète).
     * Refusé avec 409 si l'examen possède déjà au moins une tentative (D5-B).
     */
    @PUT
    @Path("/{id}")
    public Response updateExam(
            @HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathParam("id") Long id,
            Exam exam) {
        Claims claims = authenticateTeacher(authHeader);
        Long teacherId = claims.get("userId", Long.class);

        Optional<Exam> existing = examRepository.findById(id);
        if (existing.isEmpty()) {
            return notFound("Examen introuvable");
        }
        if (!existing.get().getTeacherId().equals(teacherId)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(Map.of("error", "Vous n'êtes pas autorisé à modifier cet examen"))
                    .build();
        }

        String validationError = validateExam(exam);
        if (validationError != null) {
            return badRequest(validationError);
        }

        exam.setId(id);
        exam.setTeacherId(teacherId);
        exam.setTeacherName(claims.get("name", String.class));

        ExamRepository.UpdateStatus status;
        try {
            status = examRepository.updateExam(exam);
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }

        return switch (status) {
            case NOT_FOUND -> notFound("Examen introuvable ou non autorisé");
            case LOCKED_BY_ATTEMPTS -> Response.status(Response.Status.CONFLICT)
                    .entity(Map.of("error", "Cet examen possède déjà des tentatives : il ne peut plus être modifié"))
                    .build();
            case UPDATED -> Response.ok(exam).build();
        };
    }

    /** Régénère le code d'accès côté serveur et réactive l'accès. */
    @POST
    @Path("/{id}/regenerate-code")
    @Consumes(MediaType.WILDCARD)
    public Response regenerateAccessCode(
            @HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathParam("id") Long id) {
        Claims claims = authenticateTeacher(authHeader);
        Long teacherId = claims.get("userId", Long.class);

        Optional<String> code = examRepository.regenerateAccessCode(id, teacherId);
        if (code.isEmpty()) {
            return notFound("Examen introuvable ou non autorisé");
        }
        return Response.ok(Map.of("accessCode", code.get(), "accessEnabled", true)).build();
    }

    /** Active / désactive l'accès à un examen. */
    @PATCH
    @Path("/{id}/access")
    public Response setExamAccess(
            @HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathParam("id") Long id,
            Map<String, Boolean> body) {
        Claims claims = authenticateTeacher(authHeader);
        Long teacherId = claims.get("userId", Long.class);

        Boolean enabled = body == null ? null : body.get("enabled");
        if (enabled == null) {
            return badRequest("Le champ 'enabled' est obligatoire");
        }

        boolean updated = examRepository.setAccessEnabled(id, teacherId, enabled);
        if (!updated) {
            return notFound("Examen introuvable ou non autorisé");
        }
        return Response.ok(Map.of("accessEnabled", enabled)).build();
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
    public Response getExamById(
            @HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader,
            @PathParam("id") Long id) {
        Claims claims = authenticateTeacher(authHeader);
        Optional<Exam> examOpt = examRepository.findById(id);
        if (examOpt.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Examen introuvable"))
                    .build();
        }
        if (!examOpt.get().getTeacherId().equals(claims.get("userId", Long.class))) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(Map.of("error", "Vous n'êtes pas autorisé à consulter cet examen"))
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

    // ------------------------------------------------------------------
    // Validation et réponses d'erreur partagées (POST / PUT)
    // ------------------------------------------------------------------

    /** Retourne un message d'erreur, ou null si l'examen est valide. */
    private String validateExam(Exam exam) {
        if (exam == null || exam.getTitle() == null || exam.getTitle().trim().isEmpty()) {
            return "Le titre de l'examen est obligatoire";
        }

        if (exam.getQuestions() == null || exam.getQuestions().isEmpty()) {
            return "L'examen doit contenir au moins une question";
        }

        // Validate each question
        for (int i = 0; i < exam.getQuestions().size(); i++) {
            ExamQuestion q = exam.getQuestions().get(i);
            if (q.getQuestion() == null || q.getQuestion().trim().isEmpty()) {
                return "La question n°" + (i + 1) + " n'a pas de texte";
            }
            if (q.getOptions() == null || q.getOptions().size() < 2) {
                return "La question n°" + (i + 1) + " doit avoir au moins 2 options";
            }

            long correctCount = q.getOptions().stream().filter(QuestionOption::isCorrect).count();
            if (correctCount == 0) {
                return "La question n°" + (i + 1) + " doit avoir au moins une réponse correcte";
            }

            // Si le type est SINGLE mais plusieurs réponses sont cochées
            if ("SINGLE".equalsIgnoreCase(q.getQuestionType()) && correctCount > 1) {
                return "La question n°" + (i + 1) + " est à choix unique mais possède plusieurs réponses correctes";
            }

            if (q.getPoints() < 0) {
                return "Le barème de la question n°" + (i + 1) + " ne peut pas être négatif";
            }
        }

        return validateMetadata(exam);
    }

    /** Valide les métadonnées produit (Phase 1). */
    private String validateMetadata(Exam exam) {
        if (exam.getStatus() != null && !exam.getStatus().isBlank()
                && !Set.of("draft", "published", "finished").contains(exam.getStatus().trim().toLowerCase())) {
            return "Statut d'examen invalide (attendu : draft, published ou finished)";
        }
        if (exam.getLanguage() != null && !exam.getLanguage().isBlank()
                && !Set.of("fr", "en").contains(exam.getLanguage().trim().toLowerCase())) {
            return "Langue invalide (attendu : fr ou en)";
        }
        if (exam.getMode() != null && !exam.getMode().isBlank()
                && !Set.of("manual", "ai").contains(exam.getMode().trim().toLowerCase())) {
            return "Mode de création invalide (attendu : manual ou ai)";
        }
        if (exam.getDurationMinutes() != null && exam.getDurationMinutes() <= 0) {
            return "La durée de l'examen doit être positive";
        }
        if (exam.getAccessCode() != null && !exam.getAccessCode().isBlank()
                && !exam.getAccessCode().trim().toUpperCase().matches("[A-Z0-9]{4,6}")) {
            return "Le code d'accès doit contenir entre 4 et 6 caractères alphanumériques";
        }
        return null;
    }

    private Response badRequest(String message) {
        return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", message))
                .build();
    }

    private Response notFound(String message) {
        return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of("error", message))
                .build();
    }
}
