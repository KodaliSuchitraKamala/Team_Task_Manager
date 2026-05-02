package com.taskmanager.service;

import com.taskmanager.model.Project;
import com.taskmanager.model.ProjectStatus;
import com.taskmanager.model.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {
    
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    
    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }
    
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }
    
    public List<Project> getProjectsByUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return projectRepository.findByCreatedBy(user);
    }
    
    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Project not found"));
    }
    
    public Project createProject(Project project, Long createdBy) {
        User user = userRepository.findById(createdBy)
            .orElseThrow(() -> new RuntimeException("User not found"));
        project.setCreatedBy(user);
        return projectRepository.save(project);
    }
    
    public Project updateProject(Long id, Project projectDetails) {
        Project project = getProjectById(id);
        project.setName(projectDetails.getName());
        project.setDescription(projectDetails.getDescription());
        project.setStatus(projectDetails.getStatus());
        return projectRepository.save(project);
    }
    
    public void deleteProject(Long id) {
        Project project = getProjectById(id);
        projectRepository.delete(project);
    }
    
    public List<Project> getProjectsByStatus(ProjectStatus status) {
        return projectRepository.findByStatus(status.name());
    }
}
