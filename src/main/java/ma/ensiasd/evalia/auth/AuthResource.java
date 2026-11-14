package ma.ensiasd.evalia.auth;

import io.jsonwebtoken.Claims;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import ma.ensiasd.evalia.auth.dto.AuthResponse;
import ma.ensiasd.evalia.auth.dto.LoginRequest;
import ma.ensiasd.evalia.auth.dto.ProfileData;
import ma.ensiasd.evalia.auth.dto.RegisterRequest;
import ma.ensiasd.evalia.auth.dto.UpdateProfileRequest;

import java.sql.SQLException;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {
    private static final int MAX_PROFILE_PHOTO_BYTES = 2 * 1024 * 1024;
    private static final Pattern PROFILE_PHOTO_PATTERN =
            Pattern.compile("^data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$");

    @Inject
    UserRepository userRepository;

    private Claims authenticate(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new NotAuthorizedException("Token d'authentification manquant");
        }
        try {
            return JwtUtil.validateToken(authHeader.substring(7));
        } catch (Exception e) {
            throw new NotAuthorizedException("Token JWT invalide ou expiré");
        }
    }

    private String validateProfilePhoto(String profilePhoto) {
        if (profilePhoto == null) {
            return null;
        }
        int maxEncodedLength = 4 * ((MAX_PROFILE_PHOTO_BYTES + 2) / 3) + 32;
        if (profilePhoto.length() > maxEncodedLength) {
            throw new IllegalArgumentException("La photo ne doit pas dépasser 2 Mo.");
        }
        Matcher matcher = PROFILE_PHOTO_PATTERN.matcher(profilePhoto);
        if (!matcher.matches()) {
            throw new IllegalArgumentException("La photo doit être au format PNG, JPEG ou WebP.");
        }

        byte[] imageBytes;
        try {
            imageBytes = Base64.getDecoder().decode(matcher.group(2));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Le fichier photo est invalide.");
        }
        if (imageBytes.length == 0 || imageBytes.length > MAX_PROFILE_PHOTO_BYTES) {
            throw new IllegalArgumentException("La photo ne doit pas dépasser 2 Mo.");
        }

        String format = matcher.group(1);
        boolean validSignature = switch (format) {
            case "png" -> imageBytes.length >= 8
                    && (imageBytes[0] & 0xff) == 0x89
                    && imageBytes[1] == 0x50
                    && imageBytes[2] == 0x4e
                    && imageBytes[3] == 0x47
                    && imageBytes[4] == 0x0d
                    && imageBytes[5] == 0x0a
                    && imageBytes[6] == 0x1a
                    && imageBytes[7] == 0x0a;
            case "jpeg" -> imageBytes.length >= 3
                    && (imageBytes[0] & 0xff) == 0xff
                    && (imageBytes[1] & 0xff) == 0xd8
                    && (imageBytes[2] & 0xff) == 0xff;
            case "webp" -> imageBytes.length >= 12
                    && new String(imageBytes, 0, 4, java.nio.charset.StandardCharsets.US_ASCII).equals("RIFF")
                    && new String(imageBytes, 8, 4, java.nio.charset.StandardCharsets.US_ASCII).equals("WEBP");
            default -> false;
        };
        if (!validSignature) {
            throw new IllegalArgumentException("Le contenu du fichier ne correspond pas à une image valide.");
        }
        return profilePhoto;
    }

    @GET
    @Path("/profile")
    public Response getProfile(@HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader) {
        Claims claims = authenticate(authHeader);
        Long userId = claims.get("userId", Long.class);
        Optional<ProfileData> profile = userRepository.findProfileById(userId);
        if (profile.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Profil introuvable"))
                    .build();
        }
        return Response.ok(profile.get()).build();
    }

    @PUT
    @Path("/profile")
    public Response updateProfile(
            @HeaderParam(HttpHeaders.AUTHORIZATION) String authHeader,
            UpdateProfileRequest req) {
        Claims claims = authenticate(authHeader);
        if (req == null || req.getName() == null || req.getName().trim().isEmpty()
                || req.getEmail() == null || req.getEmail().trim().isEmpty()
                || req.getCurrentPassword() == null || req.getCurrentPassword().isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Nom, email et mot de passe actuel sont obligatoires"))
                    .build();
        }

        String name = req.getName().trim();
        String email = req.getEmail().trim().toLowerCase();
        if (name.length() > 100 || email.length() > 150 || !email.contains("@")) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Nom ou adresse email invalide"))
                    .build();
        }
        String newPassword = req.getNewPassword();
        if (newPassword != null && !newPassword.isEmpty() && newPassword.length() < 6) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Le nouveau mot de passe doit contenir au moins 6 caractères"))
                    .build();
        }

        String profilePhoto;
        try {
            profilePhoto = validateProfilePhoto(req.getProfilePhoto());
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }

        Long userId = claims.get("userId", Long.class);
        try {
            Optional<User> optionalUser = userRepository.findById(userId);
            if (optionalUser.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Profil introuvable"))
                        .build();
            }
            User user = optionalUser.get();
            if (!userRepository.verifyPassword(req.getCurrentPassword(), user.getPassword())) {
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity(Map.of("error", "Le mot de passe actuel est incorrect"))
                        .build();
            }

            Optional<User> emailOwner = userRepository.findByEmail(email);
            if (emailOwner.isPresent() && !emailOwner.get().getId().equals(userId)) {
                return Response.status(Response.Status.CONFLICT)
                        .entity(Map.of("error", "Un compte existe déjà avec cette adresse email"))
                        .build();
            }

            String passwordToSave = newPassword == null || newPassword.isEmpty() ? null : newPassword;
            userRepository.updateProfile(userId, name, email, passwordToSave, profilePhoto);
            String role = claims.get("role", String.class);
            String token = JwtUtil.generateToken(userId, email, name, role);
            AuthResponse response = new AuthResponse(token, userId, name, email, role);
            response.setProfilePhoto(profilePhoto);
            return Response.ok(response).build();
        } catch (RuntimeException e) {
            if (e.getCause() instanceof SQLException sqlException
                    && "23505".equals(sqlException.getSQLState())) {
                return Response.status(Response.Status.CONFLICT)
                        .entity(Map.of("error", "Un compte existe déjà avec cette adresse email"))
                        .build();
            }
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Erreur lors de la mise à jour du profil"))
                    .build();
        }
    }

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

        try {
            if (userRepository.findByEmail(email).isPresent()) {
                return Response.status(Response.Status.CONFLICT)
                        .entity(Map.of("error", "Un compte existe déjà avec cette adresse email"))
                        .build();
            }

            User created = userRepository.createUser(req.getName(), email, req.getPassword(), "STUDENT");
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
