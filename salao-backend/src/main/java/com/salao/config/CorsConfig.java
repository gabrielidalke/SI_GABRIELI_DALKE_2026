package com.salao.config;



import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        // o front pode ser aberto por localhost, 127.0.0.1 ou [::1] (o Vite às vezes mostra um desses):
        // aceita qualquer um deles, em qualquer porta, mas só da própria máquina
        config.addAllowedOriginPattern("http://localhost:[*]");
        config.addAllowedOriginPattern("http://127.0.0.1:[*]");
        config.addAllowedOriginPattern("http://[::1]:[*]");
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}