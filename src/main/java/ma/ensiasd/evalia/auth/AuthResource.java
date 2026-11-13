package ma.ensiasd.evalia.auth;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import ma.ensiasd.evalia.auth.dto.AuthResponse;
import ma.ensiasd.evalia.auth.dto.LoginRequest;
import ma.ensiasd.evalia.auth.dto.RegisterRequest;

import java.util.Map;
import java.util.Optional;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    UserRepository userRepository;

    @POST
    @Path("/register")
    public Response register(RegisterRequest req) {
        if (req == null || req.getEmail() == null || req.getPassword() == null || req.getName() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Nom, email et mot de passe sont obligatoires"))
                    .build();
        }

        String email = req.getEmail().trim().toLowerCase();
        if (!email.contains("@")) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Format d'adresse email invalide"))
                    .build();
        }

        if (req.getPassword().length() < 6) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Le mot de passe doit contenir au moins 6 caractères"))
                    .build();
        }

        String role = "TEACHER".equalsIgnoreCase(req.getRole()) ? "TEACHER" : "STUDENT";

        try {
            if (userRepository.findByEmail(email).isPresent()) {
                return Response.status(Response.Status.CONFLICT)
                        .entity(Map.of("error", "Un compte existe déjà avec cette adresse email"))
                        .build();
            }

            User created = userRepository.createUser(req.getName(), email, req.getPassword(), role);
            String token = JwtUtil.generateToken(created.getId(), created.getEmail(), created.getName(), created.getRole());

            return Response.status(Response.Status.CREATED)
                    .entity(new AuthResponse(token, created.getId(), created.getName(), created.getEmail(), created.getRole()))
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Erreur lors de l'enregistrement: " + e.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("/login")
    public Response login(LoginRequest req) {
        if (req == null || req.getEmail() == null || req.getPassword() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Email et mot de passe requis"))
                    .build();
        }

        String email = req.getEmail().trim().toLowerCase();

        try {
            Optional<User> optionalUser = userRepository.findByEmail(email);
            if (optionalUser.isEmpty()) {
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity(Map.of("error", "Identifiants incorrects"))
                        .build();
            }

            User user = optionalUser.get();
            if (!userRepository.verifyPassword(req.getPassword(), user.getPassword())) {
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity(Map.of("error", "Identifiants incorrects"))
                        .build();
            }

            String token = JwtUtil.generateToken(user.getId(), user.getEmail(), user.getName(), user.getRole());
            return Response.ok(new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole())).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Erreur serveur: " + e.getMessage()))
                    .build();
        }
    }
}
