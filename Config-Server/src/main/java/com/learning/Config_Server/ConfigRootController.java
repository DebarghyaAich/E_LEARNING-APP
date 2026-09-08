package com.learning.Config_Server;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.config.server.environment.EnvironmentController;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class ConfigRootController {

    private final EnvironmentController environmentController;

    @Autowired
    public ConfigRootController(EnvironmentController environmentController) {
        this.environmentController = environmentController;
    }

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public String homeHtml() {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Spring Cloud Config Server</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
                <style>
                    :root {
                        --bg: #F8FAFC;
                        --card: #FFFFFF;
                        --border: #E2E8F0;
                        --primary: #4F46E5;
                        --primary-soft: #EEF2FF;
                        --text-dark: #0F172A;
                        --text-muted: #64748B;
                        --emerald: #10B981;
                        --emerald-soft: #ECFDF5;
                    }
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body {
                        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
                        background: var(--bg);
                        color: var(--text-dark);
                        padding: 40px 20px;
                        display: flex;
                        justify-content: center;
                    }
                    .container {
                        max-width: 840px;
                        width: 100%;
                    }
                    .header {
                        background: var(--card);
                        border: 1px solid var(--border);
                        border-radius: 20px;
                        padding: 28px 32px;
                        margin-bottom: 24px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .title-area h1 {
                        font-family: 'Outfit', sans-serif;
                        font-size: 24px;
                        font-weight: 700;
                        color: var(--text-dark);
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .title-area p {
                        color: var(--text-muted);
                        font-size: 14px;
                        margin-top: 4px;
                    }
                    .status-pill {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 6px 14px;
                        background: var(--emerald-soft);
                        color: var(--emerald);
                        border: 1px solid rgba(16, 185, 129, 0.2);
                        border-radius: 9999px;
                        font-size: 13px;
                        font-weight: 600;
                    }
                    .status-dot {
                        width: 8px;
                        height: 8px;
                        background: var(--emerald);
                        border-radius: 50%;
                        animation: pulse 2s infinite;
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.4; transform: scale(0.85); }
                    }
                    .section-card {
                        background: var(--card);
                        border: 1px solid var(--border);
                        border-radius: 20px;
                        padding: 24px 32px;
                        margin-bottom: 20px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
                    }
                    .section-title {
                        font-family: 'Outfit', sans-serif;
                        font-size: 16px;
                        font-weight: 600;
                        color: var(--text-dark);
                        margin-bottom: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }
                    .service-grid {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                    .service-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 14px 18px;
                        background: #F8FAFC;
                        border: 1px solid var(--border);
                        border-radius: 12px;
                        transition: border-color 0.2s, transform 0.2s;
                    }
                    .service-row:hover {
                        border-color: #CBD5E1;
                        transform: translateY(-1px);
                    }
                    .service-info {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .service-name {
                        font-weight: 600;
                        font-size: 15px;
                        color: var(--text-dark);
                    }
                    .service-port {
                        font-size: 12px;
                        color: var(--text-muted);
                        background: #FFFFFF;
                        border: 1px solid var(--border);
                        padding: 2px 8px;
                        border-radius: 6px;
                    }
                    .links-group {
                        display: flex;
                        gap: 8px;
                    }
                    .btn-link {
                        border: none;
                        outline: none;
                        cursor: pointer;
                        font-family: inherit;
                        font-size: 12px;
                        font-weight: 600;
                        padding: 7px 14px;
                        border-radius: 8px;
                        transition: all 0.2s;
                        display: inline-flex;
                        align-items: center;
                        gap: 5px;
                        text-decoration: none;
                    }
                    .btn-json {
                        background: var(--primary-soft);
                        color: var(--primary);
                    }
                    .btn-json:hover {
                        background: var(--primary);
                        color: #FFFFFF;
                    }
                    .btn-yaml {
                        background: #F1F5F9;
                        color: #334155;
                        border: 1px solid #E2E8F0;
                    }
                    .btn-yaml:hover {
                        background: #E2E8F0;
                        color: var(--text-dark);
                    }
                    .quick-links {
                        display: flex;
                        gap: 12px;
                        margin-top: 16px;
                        flex-wrap: wrap;
                    }
                    .quick-btn {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        text-decoration: none;
                        font-size: 13px;
                        font-weight: 600;
                        color: var(--text-muted);
                        padding: 8px 14px;
                        background: #F1F5F9;
                        border-radius: 8px;
                        transition: all 0.2s;
                    }
                    .quick-btn:hover {
                        color: var(--text-dark);
                        background: #E2E8F0;
                    }
                    .info-box {
                        margin-top: 16px;
                        padding: 14px 18px;
                        background: #EFF6FF;
                        border: 1px solid #DBEAFE;
                        border-radius: 12px;
                        font-size: 13px;
                        color: #1E40AF;
                        line-height: 1.5;
                    }

                    /* Interactive Viewer Modal */
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100vw;
                        height: 100vh;
                        background: rgba(15, 23, 42, 0.65);
                        backdrop-filter: blur(6px);
                        z-index: 9999;
                        display: none;
                        align-items: center;
                        justify-content: center;
                        padding: 20px;
                        animation: fadeIn 0.2s ease-out;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .modal-box {
                        background: #FFFFFF;
                        border-radius: 20px;
                        width: 100%;
                        max-width: 860px;
                        height: 82vh;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
                        border: 1px solid var(--border);
                        animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    @keyframes slideUp {
                        from { transform: translateY(20px) scale(0.98); opacity: 0; }
                        to { transform: translateY(0) scale(1); opacity: 1; }
                    }
                    .modal-header {
                        padding: 16px 24px;
                        background: #FFFFFF;
                        border-bottom: 1px solid var(--border);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        flex-shrink: 0;
                    }
                    .modal-header-left {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                    }
                    .back-btn {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        background: #F1F5F9;
                        color: var(--text-dark);
                        border: 1px solid var(--border);
                        padding: 8px 16px;
                        border-radius: 10px;
                        font-family: inherit;
                        font-size: 13px;
                        font-weight: 700;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .back-btn:hover {
                        background: var(--primary);
                        color: #FFFFFF;
                        border-color: var(--primary);
                        transform: translateX(-2px);
                    }
                    .back-btn svg {
                        transition: transform 0.2s;
                    }
                    .back-btn:hover svg {
                        transform: translateX(-3px);
                    }
                    .service-tag {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .service-tag-name {
                        font-family: 'Outfit', sans-serif;
                        font-size: 17px;
                        font-weight: 700;
                        color: var(--text-dark);
                    }
                    .format-pill {
                        font-size: 11px;
                        font-weight: 700;
                        padding: 3px 8px;
                        background: var(--primary-soft);
                        color: var(--primary);
                        border-radius: 6px;
                        letter-spacing: 0.5px;
                    }
                    .modal-header-right {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .modal-action-btn {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        background: #F8FAFC;
                        color: #475569;
                        border: 1px solid var(--border);
                        padding: 7px 12px;
                        border-radius: 8px;
                        font-size: 12px;
                        font-weight: 600;
                        cursor: pointer;
                        text-decoration: none;
                        transition: all 0.2s;
                    }
                    .modal-action-btn:hover {
                        background: #F1F5F9;
                        color: var(--text-dark);
                    }
                    .modal-body {
                        flex: 1;
                        background: #0F172A;
                        overflow: auto;
                        padding: 24px;
                    }
                    .modal-body pre {
                        margin: 0;
                        font-family: 'JetBrains Mono', Consolas, monospace;
                        font-size: 13px;
                        line-height: 1.7;
                        color: #F8FAFC;
                        white-space: pre-wrap;
                        word-break: break-all;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="title-area">
                            <h1>
                                <span>⚙️</span>
                                Spring Cloud Config Server
                            </h1>
                            <p>Centralized configuration repository running on port 8888</p>
                        </div>
                        <div class="status-pill">
                            <span class="status-dot"></span>
                            ACTIVE (native)
                        </div>
                    </div>

                    <div class="section-card">
                        <div class="section-title">
                            <span>Available Client Configurations</span>
                            <span style="font-size: 12px; font-weight: normal; color: var(--text-muted);">Profile: default</span>
                        </div>
                        <div class="service-grid">
                            <div class="service-row">
                                <div class="service-info">
                                    <span class="service-name">ContentService</span>
                                    <span class="service-port">Port 8083</span>
                                </div>
                                <div class="links-group">
                                    <button class="btn-link btn-json" onclick="openViewer('ContentService', 'json')">View JSON</button>
                                    <button class="btn-link btn-yaml" onclick="openViewer('ContentService', 'yaml')">View YAML</button>
                                </div>
                            </div>
                            <div class="service-row">
                                <div class="service-info">
                                    <span class="service-name">CourseService</span>
                                    <span class="service-port">Port 8082</span>
                                </div>
                                <div class="links-group">
                                    <button class="btn-link btn-json" onclick="openViewer('CourseService', 'json')">View JSON</button>
                                    <button class="btn-link btn-yaml" onclick="openViewer('CourseService', 'yaml')">View YAML</button>
                                </div>
                            </div>
                            <div class="service-row">
                                <div class="service-info">
                                    <span class="service-name">UnitService</span>
                                    <span class="service-port">Port 8084</span>
                                </div>
                                <div class="links-group">
                                    <button class="btn-link btn-json" onclick="openViewer('UnitService', 'json')">View JSON</button>
                                    <button class="btn-link btn-yaml" onclick="openViewer('UnitService', 'yaml')">View YAML</button>
                                </div>
                            </div>
                            <div class="service-row">
                                <div class="service-info">
                                    <span class="service-name">UserService</span>
                                    <span class="service-port">Port 8081</span>
                                </div>
                                <div class="links-group">
                                    <button class="btn-link btn-json" onclick="openViewer('UserService', 'json')">View JSON</button>
                                    <button class="btn-link btn-yaml" onclick="openViewer('UserService', 'yaml')">View YAML</button>
                                </div>
                            </div>
                            <div class="service-row">
                                <div class="service-info">
                                    <span class="service-name">InteractionService</span>
                                    <span class="service-port">Port 8085</span>
                                </div>
                                <div class="links-group">
                                    <button class="btn-link btn-json" onclick="openViewer('InteractionService', 'json')">View JSON</button>
                                    <button class="btn-link btn-yaml" onclick="openViewer('InteractionService', 'yaml')">View YAML</button>
                                </div>
                            </div>
                        </div>

                        <div class="info-box">
                            💡 <strong>Interactive Config Viewer:</strong> Clicking <strong>View YAML</strong> or <strong>View JSON</strong> opens the in-page code viewer with a <strong>"← Back to Dashboard"</strong> button and one-click copy.
                        </div>
                    </div>

                    <div class="section-card">
                        <div class="section-title">
                            <span>System & Microservices Diagnostics</span>
                        </div>
                        <div class="quick-links">
                            <a class="quick-btn" href="/actuator/health" target="_blank">🩺 Config Server Health</a>
                            <a class="quick-btn" href="/actuator/env" target="_blank">🔍 Config Environment</a>
                            <a class="quick-btn" href="http://localhost:8761" target="_blank">🌐 Eureka Service Registry (8761)</a>
                            <a class="quick-btn" href="http://localhost:5173" target="_blank">🎓 Eduwerks UI (5173)</a>
                        </div>
                    </div>
                </div>

                <!-- Interactive Viewer Modal with Back Button -->
                <div id="config-modal" class="modal-overlay" onclick="handleBackdropClick(event)">
                    <div class="modal-box" onclick="event.stopPropagation()">
                        <div class="modal-header">
                            <div class="modal-header-left">
                                <button class="back-btn" onclick="closeViewer()" title="Back to Dashboard (or press Esc)">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="19" y1="12" x2="5" y2="12"></line>
                                        <polyline points="12 19 5 12 12 5"></polyline>
                                    </svg>
                                    Back to Home
                                </button>
                                <div class="service-tag">
                                    <span id="modal-service-name" class="service-tag-name">Service</span>
                                    <span id="modal-format-badge" class="format-pill">YAML</span>
                                </div>
                            </div>
                            <div class="modal-header-right">
                                <button id="copy-btn" class="modal-action-btn" onclick="copyCode()">
                                    📋 Copy Config
                                </button>
                                <a id="raw-link" href="#" target="_blank" class="modal-action-btn">
                                    Raw Endpoint ↗
                                </a>
                            </div>
                        </div>
                        <div class="modal-body">
                            <pre><code id="code-content">Loading configuration...</code></pre>
                        </div>
                    </div>
                </div>

                <script>
                    function openViewer(service, format) {
                        const modal = document.getElementById('config-modal');
                        const serviceNameEl = document.getElementById('modal-service-name');
                        const formatBadgeEl = document.getElementById('modal-format-badge');
                        const codeEl = document.getElementById('code-content');
                        const rawLink = document.getElementById('raw-link');

                        serviceNameEl.textContent = service;
                        formatBadgeEl.textContent = format.toUpperCase();
                        codeEl.textContent = 'Loading configuration from Config-Server...';
                        modal.style.display = 'flex';

                        const endpoint = format === 'yaml' ? `/${service}.yaml` : `/${service}/default`;
                        rawLink.href = endpoint;

                        // Update URL query parameter without full reload
                        history.pushState({ service, format }, '', `/?service=${service}&format=${format}`);

                        fetch(endpoint)
                            .then(res => {
                                if (!res.ok) throw new Error(`HTTP ${res.status}: Not Found`);
                                return format === 'yaml' ? res.text() : res.json();
                            })
                            .then(data => {
                                codeEl.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
                            })
                            .catch(err => {
                                codeEl.textContent = 'Failed to load configuration: ' + err.message;
                            });
                    }

                    function closeViewer() {
                        document.getElementById('config-modal').style.display = 'none';
                        history.pushState({}, '', '/');
                    }

                    function handleBackdropClick(event) {
                        if (event.target.id === 'config-modal') {
                            closeViewer();
                        }
                    }

                    function copyCode() {
                        const code = document.getElementById('code-content').textContent;
                        navigator.clipboard.writeText(code).then(() => {
                            const btn = document.getElementById('copy-btn');
                            const original = btn.textContent;
                            btn.textContent = '✓ Copied!';
                            btn.style.background = '#10B981';
                            btn.style.color = '#FFFFFF';
                            setTimeout(() => {
                                btn.textContent = original;
                                btn.style.background = '';
                                btn.style.color = '';
                            }, 2000);
                        });
                    }

                    document.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape') closeViewer();
                    });

                    window.addEventListener('popstate', (e) => {
                        const params = new URLSearchParams(window.location.search);
                        const service = params.get('service');
                        const format = params.get('format');
                        if (service && format) {
                            openViewer(service, format);
                        } else {
                            document.getElementById('config-modal').style.display = 'none';
                        }
                    });

                    // Check query params on page load
                    window.addEventListener('DOMContentLoaded', () => {
                        const params = new URLSearchParams(window.location.search);
                        const service = params.get('service');
                        const format = params.get('format') || 'yaml';
                        if (service) {
                            openViewer(service, format);
                        }
                    });
                </script>
            </body>
            </html>
            """;
    }

    @GetMapping(value = "/", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> homeJson() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("service", "Config-Server");
        response.put("port", 8888);
        response.put("profile", "native");
        response.put("endpoints", Map.of(
                "ContentService", "/ContentService/default",
                "CourseService", "/CourseService/default",
                "UnitService", "/UnitService/default",
                "UserService", "/UserService/default",
                "InteractionService", "/InteractionService/default",
                "actuator", "/actuator/health"
        ));
        return response;
    }

    @GetMapping("/view")
    public void viewRedirect(
            @RequestParam(defaultValue = "ContentService") String service,
            @RequestParam(defaultValue = "yaml") String format,
            HttpServletResponse response) throws IOException {
        response.sendRedirect("/?service=" + service + "&format=" + format);
    }

    @GetMapping(value = "/{serviceName}.yaml", produces = "text/yaml;charset=UTF-8")
    public ResponseEntity<String> getYaml(@PathVariable String serviceName) throws Exception {
        return resolveYaml(serviceName);
    }

    @GetMapping(value = "/{serviceName}.yml", produces = "text/yaml;charset=UTF-8")
    public ResponseEntity<String> getYml(@PathVariable String serviceName) throws Exception {
        return resolveYaml(serviceName);
    }

    @GetMapping(value = "/{serviceName}.properties", produces = "text/plain;charset=UTF-8")
    public ResponseEntity<String> getProperties(@PathVariable String serviceName) throws Exception {
        if (serviceName.contains("-")) {
            int dashIdx = serviceName.lastIndexOf('-');
            String name = serviceName.substring(0, dashIdx);
            String profile = serviceName.substring(dashIdx + 1);
            return environmentController.properties(name, profile, true);
        }
        return environmentController.properties(serviceName, "default", true);
    }

    private ResponseEntity<String> resolveYaml(String serviceName) throws Exception {
        if (serviceName.contains("-")) {
            int dashIdx = serviceName.lastIndexOf('-');
            String name = serviceName.substring(0, dashIdx);
            String profile = serviceName.substring(dashIdx + 1);
            return environmentController.yaml(name, profile, true);
        }
        return environmentController.yaml(serviceName, "default", true);
    }
}
