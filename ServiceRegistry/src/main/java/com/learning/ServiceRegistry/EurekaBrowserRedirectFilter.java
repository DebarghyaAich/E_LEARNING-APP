package com.learning.ServiceRegistry;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class EurekaBrowserRedirectFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String uri = req.getRequestURI();
        // Redirect browser visits from /eureka and /eureka/ to the dashboard at /
        if ("/eureka".equals(uri) || "/eureka/".equals(uri)) {
            res.sendRedirect("/");
            return;
        }

        chain.doFilter(request, response);
    }
}
