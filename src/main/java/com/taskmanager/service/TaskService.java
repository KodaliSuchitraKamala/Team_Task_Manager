package com.taskmanager.service;

import com.taskmanager.model.Project;
import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.model.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {
    
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    
    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }
    
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }
    
    public List<Task> getTasksByProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));
        return taskRepository.findByProject(project);
    }
    
    public List<Task> getTasksByAssignee(Long assigneeId) {
        User user = userRepository.findById(assigneeId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return taskRepository.findByAssignedTo(user);
    }
    
    public List<Task> getTasksByCreator(Long creatorId) {
        User user = userRepository.findById(creatorId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return taskRepository.findByCreatedBy(user);
    }
    
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Task not found"));
    }
    
    public Task createTask(Task task, Long projectId, Long createdBy) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));
        User creator = userRepository.findById(createdBy)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        task.setProject(project);
        task.setCreatedBy(creator);
        return taskRepository.save(task);
    }
    
    public Task updateTask(Long id, Task taskDetails) {
        Task task = getTaskById(id);
        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        task.setStatus(taskDetails.getStatus());
        task.setPriority(taskDetails.getPriority());
        task.setDueDate(taskDetails.getDueDate());
        
        if (taskDetails.getAssignedTo() != null) {
            User assignee = userRepository.findById(taskDetails.getAssignedTo().getId())
                .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignedTo(assignee);
        }
        
        return taskRepository.save(task);
    }
    
    public void deleteTask(Long id) {
        Task task = getTaskById(id);
        taskRepository.delete(task);
    }
    
    public List<Task> getTasksByStatus(TaskStatus status) {
        return taskRepository.findByStatus(status.name());
    }
    
    public List<Task> getOverdueTasks() {
        return taskRepository.findByDueDateBefore(LocalDateTime.now());
    }
}
