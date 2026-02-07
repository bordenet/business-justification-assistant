/**
 * Views Module (TEMPLATE - CUSTOMIZE FOR YOUR DOMAIN)
 * Handles rendering different views
 * @module views
 *
 * ⚠️ CUSTOMIZATION REQUIRED:
 * 1. Update form fields in renderNewProjectForm() for YOUR domain
 * 2. Update project card display in renderProjectsList() for YOUR fields
 * 3. Update button text and labels throughout
 */

import { getAllProjects, createProject, updateProject, getProject, deleteProject } from './projects.js';
import { formatDate, escapeHtml, confirm, showToast, showDocumentPreviewModal } from './ui.js';
import { navigateTo } from './router.js';
import { getFinalMarkdown, getExportFilename } from './workflow.js';
import {
  ATTACHMENT_CONFIG,
  validateFile,
  validateFiles,
  formatFileSize,
  handleFiles,
  resetAttachmentTracking,
  getAttachmentStats
} from './attachments.js';
import { getAllTemplates, getTemplate } from './document-specific-templates.js';
import { validateDocument, getScoreColor, getScoreLabel } from './validator-inline.js';

// Re-export attachment functions for backwards compatibility
export {
  ATTACHMENT_CONFIG,
  validateFile,
  validateFiles,
  formatFileSize,
  handleFiles,
  resetAttachmentTracking,
  getAttachmentStats
};

/**
 * Render the projects list view
 * @returns {Promise<void>}
 */
export async function renderProjectsList() {
  const projects = await getAllProjects();

  const container = document.getElementById('app-container');
  container.innerHTML = `
        <!-- CUSTOMIZE: Update button text and headings for your domain -->
        <div class="mb-6 flex items-center justify-between">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
                My Documents
            </h2>
            <button id="new-project-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                + New Document
            </button>
        </div>

        ${projects.length === 0 ? `
            <div class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <span class="text-6xl mb-4 block">📋</span>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No documents yet
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                    Create your first document to get started
                </p>
                <button id="new-project-btn-empty" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    + Create Your First Document
                </button>
            </div>
        ` : `
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                ${projects.map(project => {
    // Check if all phases are complete
    const isComplete = project.phases &&
                        project.phases[1]?.completed &&
                        project.phases[2]?.completed &&
                        project.phases[3]?.completed;

    // Count COMPLETED phases (not current phase)
    const completedPhases = project.phases
      ? [1, 2, 3].filter(phase => project.phases[phase]?.completed).length
      : 0;

    // Calculate score for completed projects
    let scoreData = null;
    if (isComplete && project.phases?.[3]?.response) {
      const validation = validateDocument(project.phases[3].response);
      scoreData = {
        score: validation.totalScore,
        color: getScoreColor(validation.totalScore),
        label: getScoreLabel(validation.totalScore)
      };
    }
    return `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" data-project-id="${project.id}">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-3">
                                <!-- CUSTOMIZE: Update to display YOUR primary field -->
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                                    ${escapeHtml(project.title || 'Untitled')}
                                </h3>
                                <div class="flex items-center space-x-2">
                                    ${isComplete ? `
                                    <button class="preview-project-btn text-gray-400 hover:text-blue-600 transition-colors" data-project-id="${project.id}" title="Preview & Copy">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    </button>
                                    ` : ''}
                                    <button class="delete-project-btn text-gray-400 hover:text-red-600 transition-colors" data-project-id="${project.id}" title="Delete">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <!-- CUSTOMIZE: Update to display YOUR secondary fields -->
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                ${escapeHtml(project.context ? project.context.substring(0, 100) + (project.context.length > 100 ? '...' : '') : '')}
                            </p>

                            ${scoreData ? `
                            <!-- Completed: Show quality score -->
                            <div class="mb-3">
                                <div class="flex items-center justify-between mb-1">
                                    <span class="text-xs text-gray-500 dark:text-gray-400">Quality Score</span>
                                    <span class="text-xs font-medium text-${scoreData.color}-600 dark:text-${scoreData.color}-400">${scoreData.score}% · ${scoreData.label}</span>
                                </div>
                                <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                    <div class="bg-${scoreData.color}-500 h-1.5 rounded-full" style="width: ${scoreData.score}%"></div>
                                </div>
                            </div>
                            ` : `
                            <!-- In Progress: Show completed phases as segments -->
                            <div class="flex items-center space-x-2 mb-3">
                                <div class="flex space-x-1 flex-1">
                                    ${[1, 2, 3].map(phase => `
                                        <div class="flex-1 h-1.5 rounded ${project.phases && project.phases[phase]?.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}"></div>
                                    `).join('')}
                                </div>
                                <span class="text-xs text-gray-500 dark:text-gray-400">${completedPhases}/3</span>
                            </div>
                            `}

                            <div class="text-xs text-gray-500 dark:text-gray-400">
                                Updated ${formatDate(project.updatedAt)}
                            </div>
                        </div>
                    </div>
                `;}).join('')}
            </div>
        `}
    `;

  // Event listeners
  const newProjectBtns = container.querySelectorAll('#new-project-btn, #new-project-btn-empty');
  newProjectBtns.forEach(btn => {
    btn.addEventListener('click', () => navigateTo('new-project'));
  });

  const projectCards = container.querySelectorAll('[data-project-id]');
  projectCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.delete-project-btn') && !e.target.closest('.preview-project-btn')) {
        navigateTo('project', card.dataset.projectId);
      }
    });
  });

  // Preview buttons (for completed projects)
  const previewBtns = container.querySelectorAll('.preview-project-btn');
  previewBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const projectId = btn.dataset.projectId;
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const markdown = getFinalMarkdown(project);
        if (markdown) {
          showDocumentPreviewModal(markdown, 'Your Proposal is Ready', getExportFilename(project));
        } else {
          showToast('No content to preview', 'warning');
        }
      }
    });
  });

  const deleteBtns = container.querySelectorAll('.delete-project-btn');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const projectId = btn.dataset.projectId;
      const project = projects.find(p => p.id === projectId);

      if (await confirm(`Are you sure you want to delete "${project.title}"?`, 'Delete Project')) {
        await deleteProject(projectId);
        showToast('Project deleted', 'success');
        renderProjectsList();
      }
    });
  });
}

/**
 * Render the new project form view
 * @returns {void}
 */
export function renderNewProjectForm() {
  const container = document.getElementById('app-container');
  if (!container) return;
  container.innerHTML = getNewProjectFormHTML();
  setupNewProjectFormListeners();
}

/**
 * Generate HTML for the new project form
 * @returns {string} HTML string
 */
function getNewProjectFormHTML() {
  return `
        <div class="max-w-6xl mx-auto">
            <div class="mb-6">
                <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back to Proposals
                </button>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <!-- CUSTOMIZE: Update heading for your domain -->
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Create New Document
                </h2>

                <!-- Template Selector - CUSTOMIZE: Add your domain-specific templates -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Choose a Template
                    </label>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3" id="template-selector">
                        ${getAllTemplates().map(t => `
                            <button type="button"
                                class="template-btn p-3 border-2 rounded-lg text-center transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${t.id === 'blank' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'}"
                                data-template-id="${t.id}">
                                <span class="text-2xl block mb-1">${t.icon}</span>
                                <span class="text-sm font-medium text-gray-900 dark:text-white block">${t.name}</span>
                                <span class="text-xs text-gray-500 dark:text-gray-400">${t.description}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <form id="new-project-form" class="space-y-8">
                    <!--
                      ⚠️ CUSTOMIZATION REQUIRED:
                      Replace these placeholder form sections with YOUR domain-specific fields.
                      Make sure field names match:
                      - types.js Project and ProjectFormData typedefs
                      - projects.js createProject() field mappings
                      - prompts.js generatePhase*Prompt() variable mappings
                    -->

                    <!-- Title Section -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            📝 Document Title
                        </h3>
                        <div>
                            <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title <span class="text-red-500">*</span></label>
                            <input type="text" id="title" name="title" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Enter a title for your document">
                        </div>
                    </section>

                    <!-- Context Section - CUSTOMIZE for your domain -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            📋 Context
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label for="context" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Context</label>
                                <textarea id="context" name="context" rows="6" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Describe the main context or background for this document..."></textarea>
                            </div>
                            <div>
                                <label for="problems" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Problems / Challenges</label>
                                <textarea id="problems" name="problems" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="What problems or challenges does this document address?"></textarea>
                            </div>
                        </div>
                    </section>

                    <!-- Additional Context -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            ℹ️ Additional Context
                        </h3>
                        <div>
                            <textarea id="additionalContext" name="additionalContext" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Any other context, special considerations, or instructions..."></textarea>
                        </div>
                    </section>

                    <!-- Submit Buttons -->
                    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" id="cancel-btn" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Create Document
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

/**
 * Set up event listeners for the new project form
 * @returns {void}
 */
function setupNewProjectFormListeners() {
  document.getElementById('back-btn')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('cancel-btn')?.addEventListener('click', () => navigateTo('home'));

  // Template selector click handlers - CUSTOMIZE: Update field names for your domain
  document.querySelectorAll('.template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const templateId = btn.dataset.templateId;
      const template = getTemplate(templateId);

      if (template) {
        // Update selection UI
        document.querySelectorAll('.template-btn').forEach(b => {
          b.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
          b.classList.add('border-gray-200', 'dark:border-gray-600');
        });
        btn.classList.remove('border-gray-200', 'dark:border-gray-600');
        btn.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');

        // Populate form fields with template content
        // CUSTOMIZE: Update this array to match YOUR form field IDs
        const fields = ['title', 'context', 'problems', 'additionalContext'];
        fields.forEach(field => {
          const el = document.getElementById(field);
          if (el && template[field] !== undefined) {
            el.value = template[field];
          }
        });
      }
    });
  });

  // Form submission
  const form = document.getElementById('new-project-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const target = /** @type {HTMLFormElement} */ (e.target);
    const formData = Object.fromEntries(new FormData(target));
    const project = await createProject(/** @type {import('./types.js').ProjectFormData} */ (formData));
    // CUSTOMIZE: Update toast message for your domain
    showToast('Document created successfully!', 'success');
    navigateTo('project', project.id);
  });
}

/**
 * Render the edit project form
 * @param {string} projectId - ID of the project to edit
 * @returns {Promise<void>}
 */
export async function renderEditProjectForm(projectId) {
  const project = await getProject(projectId);
  if (!project) {
    showToast('Project not found', 'error');
    navigateTo('home');
    return;
  }

  const container = document.getElementById('app-container');
  if (!container) return;
  container.innerHTML = getEditProjectFormHTML(project);
  setupEditProjectFormListeners(project);
}

/**
 * Generate HTML for the edit project form
 * @param {import('./types.js').Project} project - Project to edit
 * @returns {string} HTML string
 */
function getEditProjectFormHTML(project) {
  return `
        <div class="max-w-6xl mx-auto">
            <div class="mb-6">
                <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back to Document
                </button>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <!-- CUSTOMIZE: Update heading for your domain -->
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Edit Document Details
                </h2>

                <form id="edit-project-form" class="space-y-8">
                    <!--
                      ⚠️ CUSTOMIZATION REQUIRED:
                      These fields must match your new project form.
                      Make sure field names match types.js and projects.js
                    -->

                    <!-- Title Section -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            📝 Document Title
                        </h3>
                        <div>
                            <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title <span class="text-red-500">*</span></label>
                            <input type="text" id="title" name="title" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Enter a title for your document" value="${escapeHtml(project.title || '')}">
                        </div>
                    </section>

                    <!-- Context Section - CUSTOMIZE for your domain -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            📋 Context
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label for="context" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Context</label>
                                <textarea id="context" name="context" rows="6" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Describe the main context or background for this document...">${escapeHtml(project.context || '')}</textarea>
                            </div>
                            <div>
                                <label for="problems" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Problems / Challenges</label>
                                <textarea id="problems" name="problems" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="What problems or challenges does this document address?">${escapeHtml(project.problems || '')}</textarea>
                            </div>
                        </div>
                    </section>

                    <!-- Additional Context -->
                    <section>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            ℹ️ Additional Context
                        </h3>
                        <div>
                            <textarea id="additionalContext" name="additionalContext" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Any other context, special considerations, or instructions...">${escapeHtml(project.additionalContext || '')}</textarea>
                        </div>
                    </section>

                    <!-- Submit Buttons -->
                    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" id="cancel-btn" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

/**
 * Set up event listeners for the edit project form
 * @param {import('./types.js').Project} project - Project being edited
 * @returns {void}
 */
function setupEditProjectFormListeners(project) {
  document.getElementById('back-btn')?.addEventListener('click', () => navigateTo('project', project.id));
  document.getElementById('cancel-btn')?.addEventListener('click', () => navigateTo('project', project.id));

  // Form submission
  const form = document.getElementById('edit-project-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const target = /** @type {HTMLFormElement} */ (e.target);
    const formData = Object.fromEntries(new FormData(target));
    await updateProject(project.id, formData);
    // CUSTOMIZE: Update toast message for your domain
    showToast('Document updated successfully!', 'success');
    navigateTo('project', project.id);
  });
}
