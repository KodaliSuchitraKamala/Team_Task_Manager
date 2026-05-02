package com.taskmanager.controller;

import com.taskmanager.model.Project;
import com.taskmanager.model.ProjectStatus;
import com.taskmanager.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectController {
    
    private final ProjectService projectService;
    
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }
    
    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }
    
    @GetMapping("/user/{userId}")
    public List<Project> getProjectsByUser(@PathVariable Long userId) {
        return projectService.getProjectsByUser(userId);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }
    
    @PostMapping
    public Project createProject(@RequestBody Project project, @RequestParam Long createdBy) {
        return projectService.createProject(project, createdBy);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project project) {
        return ResponseEntity.ok(projectService.updateProject(id, project));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/status/{status}")
    public List<Project> getProjectsByStatus(@PathVariable ProjectStatus status) {
        return projectService.getProjectsByStatus(status);
    }
}
