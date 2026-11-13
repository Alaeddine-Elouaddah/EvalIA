package ma.ensiasd.evalia.auth;

import jakarta.enterprise.context.ApplicationScoped;
import org.mindrot.jbcrypt.BCrypt;

import java.sql.*;
import java.util.Optional;

@ApplicationScoped
public class UserRepository {

    public UserRepository() {
        DatabaseConfig.initDatabase();
    }

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT id, name, email, password, role FROM evalia_users WHERE LOWER(email) = LOWER(?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(new User(
                        rs.getLong("id"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("password"),
                        rs.getString("role")
                    ));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Database error finding user by email: " + e.getMessage(), e);
        }
        return Optional.empty();
    }

    public User createUser(String name, String email, String rawPassword, String role) {
        String hashedPassword = BCrypt.hashpw(rawPassword, BCrypt.gensalt(10));
        String formattedRole = "TEACHER".equalsIgnoreCase(role) ? "TEACHER" : "STUDENT";

        String sql = "INSERT INTO evalia_users (name, email, password, role) VALUES (?, ?, ?, ?) RETURNING id";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, name);
            ps.setString(2, email.toLowerCase().trim());
            ps.setString(3, hashedPassword);
            ps.setString(4, formattedRole);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    long id = rs.getLong(1);
                    return new User(id, name, email.toLowerCase().trim(), hashedPassword, formattedRole);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Database error creating user: " + e.getMessage(), e);
        }
        throw new RuntimeException("Failed to register user");
    }

    public boolean verifyPassword(String rawPassword, String hashedPassword) {
        if (hashedPassword == null || !hashedPassword.startsWith("$2")) {
            return false;
        }
        return BCrypt.checkpw(rawPassword, hashedPassword);
    }
}
