package com.filesharing.backend.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource(Environment env) {
        String raw = first(
                env.getProperty("SPRING_DATASOURCE_URL"),
                env.getProperty("DATABASE_URL"),
                env.getProperty("spring.datasource.url"),
                "jdbc:postgresql://localhost:5432/filesharing_db"
        );
        String username = first(
                env.getProperty("SPRING_DATASOURCE_USERNAME"),
                env.getProperty("DB_USER"),
                env.getProperty("spring.datasource.username"),
                "postgres"
        );
        String password = first(
                env.getProperty("SPRING_DATASOURCE_PASSWORD"),
                env.getProperty("DB_PASSWORD"),
                env.getProperty("spring.datasource.password"),
                "postgres"
        );

        JdbcTarget target = toJdbc(raw, username, password);

        return DataSourceBuilder.create()
                .driverClassName("org.postgresql.Driver")
                .url(target.url)
                .username(target.username)
                .password(target.password)
                .build();
    }

    static JdbcTarget toJdbc(String raw, String username, String password) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Database URL is empty");
        }
        String value = raw.trim();
        if (value.startsWith("jdbc:")) {
            return new JdbcTarget(value, username, password);
        }

        String normalized = value;
        if (normalized.startsWith("postgres://")) {
            normalized = "postgresql://" + normalized.substring("postgres://".length());
        }
        if (!normalized.startsWith("postgresql://")) {
            throw new IllegalArgumentException("DATABASE_URL must be a jdbc: or postgresql:// URL");
        }

        URI uri = URI.create(normalized);
        String user = username;
        String pass = password;
        String userInfo = uri.getUserInfo();
        if (userInfo != null && !userInfo.isEmpty()) {
            int colon = userInfo.indexOf(':');
            if (colon >= 0) {
                user = decode(userInfo.substring(0, colon));
                pass = decode(userInfo.substring(colon + 1));
            } else {
                user = decode(userInfo);
            }
        }

        String path = uri.getPath() == null ? "" : uri.getPath();
        StringBuilder url = new StringBuilder("jdbc:postgresql://");
        if (uri.getHost() == null) {
            throw new IllegalArgumentException("DATABASE_URL is missing a host");
        }
        url.append(uri.getHost());
        if (uri.getPort() != -1) {
            url.append(':').append(uri.getPort());
        }
        url.append(path);

        String query = uri.getRawQuery();
        if (query == null || query.isEmpty()) {
            url.append("?sslmode=require");
        } else {
            url.append('?').append(query);
            if (!query.contains("sslmode=")) {
                url.append("&sslmode=require");
            }
        }

        return new JdbcTarget(url.toString(), user, pass);
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private static String first(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }

    record JdbcTarget(String url, String username, String password) {}
}
