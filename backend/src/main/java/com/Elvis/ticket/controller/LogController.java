package com.Elvis.ticket.controller;

import com.Elvis.ticket.model.LogEntry;
import com.Elvis.ticket.service.LogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
public class LogController {
    private static final Logger logger = LoggerFactory.getLogger(LogController.class);

    @Autowired
    private LogService logService;
    
    @Value("${logging.file.path:log}")
    private String logDirectory;

    @GetMapping("/files")
    public ResponseEntity<List<String>> getLogFiles() {
        logger.info("Received request to get log files");
        List<String> files = logService.getLogFiles();
        logger.info("Returning {} log files", files.size());
        return ResponseEntity.ok(files);
    }

    @GetMapping("/file/{fileName}")
    public ResponseEntity<List<LogEntry>> getLogContent(
            @PathVariable String fileName,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer limit) {
        
        logger.info("Received request to get log content from file: {}", fileName);
        logger.info("Filters - level: {}, search: {}, limit: {}", level, search, limit);
        
        List<LogEntry> logs = logService.getLogContent(fileName, level, search, limit);
        logger.info("Returning {} log entries", logs.size());
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/debug")
    public ResponseEntity<Map<String, Object>> getDebugInfo() {
        Map<String, Object> debug = new HashMap<>();
        
        // Get working directory
        debug.put("workingDirectory", System.getProperty("user.dir"));
        
        // Get configured log directory
        debug.put("configuredLogDirectory", logDirectory);
        
        // Check if log directory exists
        File logDir = new File(logDirectory);
        debug.put("logDirectoryExists", logDir.exists());
        debug.put("logDirectoryIsDirectory", logDir.isDirectory());
        debug.put("logDirectoryAbsolutePath", logDir.getAbsolutePath());
        debug.put("logDirectoryCanRead", logDir.canRead());
        
        // List files in log directory if it exists
        if (logDir.exists() && logDir.isDirectory()) {
            File[] files = logDir.listFiles();
            if (files != null) {
                Map<String, Object> fileInfos = new HashMap<>();
                for (File file : files) {
                    if (file.isFile()) {
                        Map<String, Object> fileInfo = new HashMap<>();
                        fileInfo.put("size", file.length());
                        fileInfo.put("canRead", file.canRead());
                        fileInfo.put("lastModified", new java.util.Date(file.lastModified()));
                        fileInfos.put(file.getName(), fileInfo);
                    }
                }
                debug.put("logFiles", fileInfos);
            } else {
                debug.put("logFiles", "null (listFiles returned null)");
            }
        }
        
        return ResponseEntity.ok(debug);
    }
}
