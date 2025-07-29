
    
        document.addEventListener('DOMContentLoaded', function() {
            const dropdowns = document.querySelectorAll('.dropdown');

            // Função para definir o link de menu ativo
            function setActiveMenuLink() {
                // Remove classes ativas de todos os links de menu, botões de dropdown e itens de dropdown
                document.querySelectorAll('.menu-link').forEach(link => {
                    link.classList.remove('active-menu');
                });
                document.querySelectorAll('.dropdown-item').forEach(item => {
                    item.classList.remove('active-menu-dropdown-item');
                });
                document.querySelectorAll('.submenu-trigger').forEach(trigger => {
                    trigger.classList.remove('active-menu-submenu-trigger');
                });

                // Obtém o nome do arquivo da página atual
                const currentPage = window.location.pathname.split('/').pop();

                // Destaca o link do Dashboard se for a página atual ou a raiz
                if (currentPage === 'dashboard.html' || currentPage === '') {
                    const dashboardLink = document.querySelector('a[href="dashboard.html"]');
                    if (dashboardLink) {
                        dashboardLink.classList.add('active-menu');
                    }
                } else {
                    // Itera por todos os dropdowns para encontrar links ativos
                    dropdowns.forEach(dropdown => {
                        const dropdownContent = dropdown.querySelector('.dropdown-content');
                        const parentButton = dropdown.querySelector('button[aria-haspopup="true"]'); // O botão principal do dropdown (Configurações, Plano, etc.)

                        if (dropdownContent) {
                            // Verifica itens diretos do dropdown (como "Plano de Manutenção" dentro de "Configurações")
                            const dropdownItems = dropdownContent.querySelectorAll(':scope > a.dropdown-item');
                            dropdownItems.forEach(item => {
                                if (item.getAttribute('href') === currentPage) {
                                    item.classList.add('active-menu-dropdown-item');
                                    if (parentButton) {
                                        parentButton.classList.add('active-menu'); // Destaca o botão principal do dropdown
                                    }
                                }
                            });

                            // Verifica submenus e seus itens (como "Veículos" e "Cadastro de Veículos")
                            const submenuContainers = dropdownContent.querySelectorAll('.relative.group'); // Pega os divs que contêm submenus
                            submenuContainers.forEach(submenuContainer => {
                                const submenuTrigger = submenuContainer.querySelector('.submenu-trigger'); // Botão "Veículos"
                                const submenuContent = submenuContainer.querySelector('.submenu-content'); // O div com os itens de submenu

                                if (submenuContent && submenuTrigger) {
                                    const submenuItems = submenuContent.querySelectorAll('.dropdown-item');
                                    submenuItems.forEach(item => {
                                        if (item.getAttribute('href') === currentPage) {
                                            item.classList.add('active-menu-dropdown-item'); // Destaca o item específico ("Cadastro de Veículos")
                                            submenuTrigger.classList.add('active-menu-submenu-trigger'); // Destaca o botão do submenu ("Veículos")
                                            if (parentButton) {
                                                parentButton.classList.add('active-menu'); // Destaca o botão principal do dropdown ("Configurações")
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });

                    // Retorno para links de nível superior não-dropdown (como "Segurança")
                    document.querySelectorAll('nav > a.menu-link').forEach(link => {
                        if (link.getAttribute('href') === currentPage && !link.closest('.dropdown')) {
                            link.classList.add('active-menu');
                        }
                    });
                }
            }

            // Chama a função ao carregar a página
            setActiveMenuLink();

            // --- Lógica de Dropdown e Submenu ---
            dropdowns.forEach(dropdown => {
                const button = dropdown.querySelector('button[aria-haspopup="true"]');
                const dropdownContent = dropdown.querySelector('.dropdown-content');

                if (button && dropdownContent) {
                    button.addEventListener('click', function(event) {
                        event.stopPropagation(); // Impede que o clique no documento feche imediatamente
                        // Fecha outros dropdowns abertos
                        dropdowns.forEach(otherDropdown => {
                            const otherDropdownContent = otherDropdown.querySelector('.dropdown-content');
                            const otherButton = otherDropdown.querySelector('button[aria-haspopup="true"]');
                            if (otherDropdown !== dropdown && otherDropdownContent && !otherDropdownContent.classList.contains('hidden')) {
                                otherDropdownContent.classList.add('hidden');
                                otherDropdownContent.classList.remove('animate-fade-in-down');
                                if (otherButton) {
                                    otherButton.setAttribute('aria-expanded', 'false');
                                }
                            }
                        });

                        // Alterna o dropdown atual
                        dropdownContent.classList.toggle('hidden');
                        dropdownContent.classList.toggle('animate-fade-in-down');
                        button.setAttribute('aria-expanded', dropdownContent.classList.contains('hidden') ? 'false' : 'true');

                        // Fecha quaisquer submenus abertos dentro deste dropdown quando seu menu principal é alternado
                        const openSubmenus = dropdownContent.querySelectorAll('.submenu-content:not(.hidden)');
                        openSubmenus.forEach(submenu => {
                            submenu.classList.add('hidden');
                            submenu.classList.remove('animate-fade-in-right');
                            const submenuTrigger = submenu.previousElementSibling;
                            if (submenuTrigger && submenuTrigger.hasAttribute('aria-expanded')) {
                                submenuTrigger.setAttribute('aria-expanded', 'false');
                            }
                        });
                    });

                    // Impede que cliques dentro do dropdown o fechem
                    dropdownContent.addEventListener('click', function(event) {
                        event.stopPropagation();
                    });
                }
            });

            // Fecha dropdowns ao clicar fora
            document.addEventListener('click', function(event) {
                dropdowns.forEach(dropdown => {
                    const dropdownContent = dropdown.querySelector('.dropdown-content');
                    const button = dropdown.querySelector('button[aria-haspopup="true"]');
                    // Verifica se o clique foi fora do botão e do conteúdo do dropdown
                    if (dropdownContent && button && !dropdown.contains(event.target)) {
                        dropdownContent.classList.add('hidden');
                        dropdownContent.classList.remove('animate-fade-in-down');
                        button.setAttribute('aria-expanded', 'false');
                    }
                });
            });

            // Lógica do submenu
            const submenuTriggers = document.querySelectorAll('.submenu-trigger');
            submenuTriggers.forEach(trigger => {
                const submenuContent = trigger.nextElementSibling; // O conteúdo do submenu
                if (submenuContent && submenuContent.classList.contains('submenu-content')) {
                    trigger.addEventListener('click', function(event) {
                        event.stopPropagation(); // Impede que o dropdown pai feche

                        // Fecha outros submenus abertos dentro do mesmo dropdown pai
                        const parentDropdownContent = trigger.closest('.dropdown-content');
                        if (parentDropdownContent) {
                            const otherSubmenus = parentDropdownContent.querySelectorAll('.submenu-content:not(.hidden)');
                            otherSubmenus.forEach(otherSubmenu => {
                                const otherTrigger = otherSubmenu.previousElementSibling;
                                if (otherSubmenu !== submenuContent && otherTrigger) {
                                    otherSubmenu.classList.add('hidden');
                                    otherSubmenu.classList.remove('animate-fade-in-right');
                                    otherTrigger.setAttribute('aria-expanded', 'false');
                                }
                            });
                        }

                        // Alterna o submenu atual
                        submenuContent.classList.toggle('hidden');
                        submenuContent.classList.toggle('animate-fade-in-right');
                        trigger.setAttribute('aria-expanded', submenuContent.classList.contains('hidden') ? 'false' : 'true');
                    });

                    // Impede que cliques dentro do submenu o fechem
                    submenuContent.addEventListener('click', function(event) {
                        event.stopPropagation();
                    });
                }
            });

            // Lógica do botão do sino de alerta
            const alertBellButton = document.getElementById('alertBellButton');
            const alertDropdown = document.getElementById('alertDropdown');
            if (alertBellButton && alertDropdown) {
                alertBellButton.addEventListener('click', function(event) {
                    event.stopPropagation(); // Impede que este clique se propague para o documento
                    alertDropdown.classList.toggle('hidden');
                    alertDropdown.classList.toggle('animate-fade-in-down');
                    alertBellButton.setAttribute('aria-expanded', alertDropdown.classList.contains('hidden') ? 'false' : 'true');
                });

                alertDropdown.addEventListener('click', function(event) {
                    event.stopPropagation(); // Impede que cliques *dentro* do dropdown o fechem
                });
            }
        });

        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                localStorage.removeItem('logado');
                window.location.replace('login.html');
            }
        }

        // Verifica o status de login imediatamente
        (function() {
            if (localStorage.getItem('logado') !== 'true' && window.location.pathname.split('/').pop() !== 'login.html') {
                window.location.replace('login.html');
            }
        })();

        // --- MODELO SPECIFIC JAVASCRIPT ---
        let models = [];
        const MODELS_STORAGE_KEY = 'models';
        const modelForm = document.getElementById('modelForm');
        const modelNameInput = document.getElementById('modelName');
        const modelsTableBody = document.getElementById('modelsTableBody');
        const noModelsMessage = document.getElementById('noModelsMessage');
        const editModelModal = document.getElementById('editModelModal');
        const editModelForm = document.getElementById('editModelForm');
        const editModelNameInput = document.getElementById('editModelName');
        const editModelIndexInput = document.getElementById('editModelIndex');
        const feedbackMessage = document.getElementById('feedback-message');
        let feedbackTimeout;

        function showFeedback(message, type = 'info') {
            feedbackMessage.textContent = message;
            feedbackMessage.className = `feedback-message show ${type}`; // Add type class for styling
            clearTimeout(feedbackTimeout);
            feedbackTimeout = setTimeout(() => {
                feedbackMessage.classList.remove('show');
                // Optional: Clear message and type after animation
                setTimeout(() => {
                    feedbackMessage.textContent = '';
                    feedbackMessage.className = 'feedback-message';
                }, 300); // Match CSS transition duration
            }, 3000); // Message visible for 3 seconds
        }

        function loadModels() {
            const storedModels = localStorage.getItem(MODELS_STORAGE_KEY);
            if (storedModels) {
                models = JSON.parse(storedModels);
            }
        }

        function saveModels() {
            localStorage.setItem(MODELS_STORAGE_KEY, JSON.stringify(models));
        }

        function renderModels() {
            modelsTableBody.innerHTML = ''; // Clear existing rows
            if (models.length === 0) {
                noModelsMessage.classList.remove('hidden');
                return;
            } else {
                noModelsMessage.classList.add('hidden');
            }

            models.forEach((model, index) => {
                const row = modelsTableBody.insertRow();
                row.className = 'hover:bg-gray-100';

                const nameCell = row.insertCell();
                nameCell.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900';
                nameCell.textContent = model;

                const actionsCell = row.insertCell();
                actionsCell.className = 'px-6 py-4 whitespace-nowrap text-right text-sm font-medium';

                const editButton = document.createElement('button');
                editButton.innerHTML = '<i class="ph ph-pencil-simple text-lg"></i>';
                editButton.className = 'btn-warning mr-2';
                editButton.title = 'Editar';
                editButton.onclick = () => openEditModal(index);
                actionsCell.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="ph ph-trash text-lg"></i>';
                deleteButton.className = 'btn-danger';
                deleteButton.title = 'Excluir';
                deleteButton.onclick = () => deleteModel(index);
                actionsCell.appendChild(deleteButton);
            });
        }

        function addModel(event) {
            event.preventDefault();
            const modelName = modelNameInput.value.trim();
            if (modelName) {
                if (models.includes(modelName)) {
                    showFeedback('Este modelo já existe!', 'error');
                    return;
                }
                models.push(modelName);
                saveModels();
                renderModels();
                modelNameInput.value = '';
                showFeedback('Modelo cadastrado com sucesso!', 'success');
            } else {
                showFeedback('Por favor, insira um nome para o modelo.', 'error');
            }
        }

        function openEditModal(index) {
            editModelIndexInput.value = index;
            editModelNameInput.value = models[index];
            editModelModal.classList.remove('hidden');
        }

        function closeEditModal() {
            editModelModal.classList.add('hidden');
        }

        function saveEditedModel(event) {
            event.preventDefault();
            const index = parseInt(editModelIndexInput.value);
            const newModelName = editModelNameInput.value.trim();

            if (newModelName && index !== -1) {
                if (models.includes(newModelName) && models.indexOf(newModelName) !== index) {
                    showFeedback('Este modelo já existe!', 'error');
                    return;
                }
                models[index] = newModelName;
                saveModels();
                renderModels();
                closeEditModal();
                showFeedback('Modelo atualizado com sucesso!', 'success');
            } else {
                showFeedback('Por favor, insira um nome válido para o modelo.', 'error');
            }
        }

        function deleteModel(index) {
            if (confirm('Tem certeza que deseja excluir este modelo?')) {
                const deletedModel = models.splice(index, 1);
                saveModels();
                renderModels();
                showFeedback(`Modelo "${deletedModel}" excluído.`, 'info');
            }
        }

        // Event Listeners
        modelForm.addEventListener('submit', addModel);
        editModelForm.addEventListener('submit', saveEditedModel);

        // Initial load
        loadModels();
        renderModels();
