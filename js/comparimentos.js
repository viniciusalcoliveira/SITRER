

        // --- LOCAL STORAGE KEY (mantendo o seu padrão) ---
        const LOCAL_STORAGE_KEY = 'bfm_fleet_data';

        // --- Variável para controle de edição ---
        let editingCompartmentId = null;

        // --- Elementos do DOM ---
        const form = document.getElementById('formCompartimento');
        const formTitle = document.getElementById('formTitle');
        const btnCadastrar = document.getElementById('btnCadastrarCompartimento');
        const alertDiv = document.getElementById('alertMessage');
        const compartmentsListDiv = document.getElementById('compartmentsList');

        // Main input for compartment name/type
        const compartmentNameInput = document.getElementById('compartmentNameInput');

        // --- Modal de Edição de Compartimento ---
        const editCompartmentModal = document.getElementById('editCompartmentModal');
        const editCompartmentForm = document.getElementById('editCompartmentForm');
        const editCompartmentIdInput = document.getElementById('editCompartmentId');
        const editCompartmentNameInput = document.getElementById('editCompartmentNameInput'); // Changed from select to input
        const saveEditCompartmentBtn = document.getElementById('saveEditCompartment');
        const cancelEditCompartmentBtn = document.getElementById('cancelEditCompartment');
        const editModalAlertMessage = document.getElementById('editModalAlertMessage');


        // --- Funções de Leitura/Escrita no Local Storage ---
        function getBFMFleetData() {
            const data = localStorage.getItem(LOCAL_STORAGE_KEY);
            return data ? JSON.parse(data) : { vehicles: [], compartments: [], customCompartmentTypes: [] };
        }

        function saveBFMFleetData(data) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        }

        // --- Inicialização de Dados no Local Storage ---
        let bfmData = getBFMFleetData();

        // Ensure vehicles array exists and seed if empty (from previous context)
        if (!bfmData.vehicles || bfmData.vehicles.length === 0) {
            bfmData.vehicles = [
                { id: 1, placa: 'ABC-1234', modelo: 'Ford Cargo', nome: 'Caminhão de Carga' },
                { id: 2, placa: 'XYZ-5678', modelo: 'Volvo FH', nome: 'Caminhão Tanque' },
                { id: 3, placa: 'DEF-9012', modelo: 'Scania R450', nome: 'Caminhão Basculante' }
            ];
            saveBFMFleetData(bfmData);
        }

        // Ensure compartments array exists
        if (!bfmData.compartments) {
            bfmData.compartments = [];
            saveBFMFleetData(bfmData);
        }

        // Ensure customCompartmentTypes array exists
        if (!bfmData.customCompartmentTypes) {
            bfmData.customCompartmentTypes = [];
            saveBFMFleetData(bfmData);
        }
        
        function showAlert(message, type, targetAlertDiv = alertDiv) {
            targetAlertDiv.textContent = message;
            targetAlertDiv.className = `alert ${type}`; // Apply type class (success or error)
            targetAlertDiv.style.display = 'flex'; // Make it visible
            setTimeout(() => {
                targetAlertDiv.style.display = 'none'; // Hide after 3 seconds
            }, 3000);
        }
        
        // --- Lógica do Formulário de Cadastro de Compartimentos ---

        // Função para resetar o formulário para uma nova entrada
        function resetFormForNewEntry() {
            form.reset();
            editingCompartmentId = null;
            formTitle.innerHTML = '<i class="ph ph-cube"></i> Cadastro de Compartimentos';
            btnCadastrar.innerHTML = '<i class="ph ph-plus-circle"></i> Cadastrar';
            showAlert('Formulário pronto para novo cadastro.', 'success');
            compartmentNameInput.value = ''; // Clear input
        }

        // Lidar com o envio do formulário (Cadastro)
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const compartmentName = compartmentNameInput.value.trim();

            if (!compartmentName) {
                showAlert('Por favor, insira o nome do compartimento.', 'error');
                return;
            }

            let currentBFMData = getBFMFleetData();

            // *** Duplicate Check for New Compartment ***
            const isDuplicate = currentBFMData.compartments.some(
                comp => comp.tipoCompartimento && comp.tipoCompartimento.toLowerCase() === compartmentName.toLowerCase()
            );

            if (isDuplicate) {
                showAlert('Já existe um compartimento com este nome.', 'error');
                return;
            }
            // *** End Duplicate Check ***

            // Add the new compartment name to custom types if it's not already there
            if (!currentBFMData.customCompartmentTypes.some(type => type.toLowerCase() === compartmentName.toLowerCase())) {
                currentBFMData.customCompartmentTypes.push(compartmentName);
            }

            // Generate sequential ID
            const nextId = currentBFMData.compartments.length > 0
                ? Math.max(...currentBFMData.compartments.map(c => c.id)) + 1
                : 1;

            const compartmentData = {
                id: nextId, // Unique ID for the compartment entry, now sequential
                tipoCompartimento: compartmentName, // The typed name becomes the type
            };
            
            currentBFMData.compartments.push(compartmentData);
            saveBFMFleetData(currentBFMData);
            showAlert('Compartimento cadastrado com sucesso!', 'success');

            resetFormForNewEntry();
            displayCompartments(document.getElementById('filterCompartments').value);
        });

        function displayCompartments(filterText = '') {
            const currentBFMData = getBFMFleetData();
            const compartments = currentBFMData.compartments || [];
            compartmentsListDiv.innerHTML = '';
            const normalizedFilter = filterText.toLowerCase().trim();

            const filteredCompartments = compartments.filter(compartment => {
                if (normalizedFilter === '') return true;
                
                const typeMatch = compartment.tipoCompartimento && compartment.tipoCompartimento.toLowerCase().includes(normalizedFilter);
                const idMatch = compartment.id && String(compartment.id).includes(normalizedFilter); // Search by ID too
                
                return typeMatch || idMatch;
            });


            if (filteredCompartments.length === 0) {
                compartmentsListDiv.innerHTML = '<p class="empty-state">Nenhum compartimento encontrado com o filtro aplicado.</p>';
                if (compartments.length === 0) {
                    compartmentsListDiv.innerHTML = '<p class="empty-state">Nenhum compartimento cadastrado ainda.</p>';
                }
                return;
            }

            filteredCompartments.forEach(compartment => {
                const compartmentItem = document.createElement('div');
                compartmentItem.classList.add('compartment-item');
                compartmentItem.setAttribute('data-id', compartment.id);

                // Simplified display: only name (tipoCompartimento) and ID
                compartmentItem.innerHTML = `
                    <h3>
                        <i class="ph ph-cube"></i> ${compartment.tipoCompartimento} 
                        <span class="text-base font-normal text-gray-500">(ID: ${compartment.id})</span>
                    </h3>
                    <div class="actions">
                        <button class="edit-btn" onclick="openEditModal(${compartment.id})">
                            <i class="ph ph-pencil"></i> Editar
                        </button>
                        <button class="delete-btn" onclick="deleteCompartment(${compartment.id})">
                            <i class="ph ph-trash"></i> Excluir
                        </button>
                    </div>
                `;
                compartmentsListDiv.appendChild(compartmentItem);
            });
        }

        function deleteCompartment(id) {
            if (confirm('Tem certeza que deseja excluir este compartimento?')) {
                let currentBFMData = getBFMFleetData();
                currentBFMData.compartments = currentBFMData.compartments.filter(comp => comp.id !== id);
                saveBFMFleetData(currentBFMData);
                showAlert('Compartimento excluído com sucesso!', 'success');
                displayCompartments(document.getElementById('filterCompartments').value);
                resetFormForNewEntry();
            }
        }

        // --- Funções do Modal de Edição ---
        function openEditModal(id) {
            let currentBFMData = getBFMFleetData();
            const compartmentToEdit = currentBFMData.compartments.find(comp => comp.id === id);

            if (compartmentToEdit) {
                editingCompartmentId = id;
                editCompartmentIdInput.value = id;
                
                // Set the input value for editing
                editCompartmentNameInput.value = compartmentToEdit.tipoCompartimento || '';

                editModalAlertMessage.style.display = 'none'; // Hide previous alerts
                editCompartmentModal.classList.add('active'); // Show the modal
            } else {
                showAlert('Compartimento não encontrado para edição.', 'error');
            }
        }

        function closeEditModal() {
            editCompartmentModal.classList.remove('active');
            editingCompartmentId = null; // Clear editing state
        }

        editCompartmentForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const idToUpdate = parseInt(editCompartmentIdInput.value);
            const newCompartmentName = editCompartmentNameInput.value.trim(); 

            if (!newCompartmentName) {
                showAlert('Por favor, insira o nome do compartimento.', 'error', editModalAlertMessage);
                return;
            }

            let currentBFMData = getBFMFleetData();

            // *** Duplicate Check for Edited Compartment ***
            const isDuplicate = currentBFMData.compartments.some(
                comp => comp.id !== idToUpdate && comp.tipoCompartimento && comp.tipoCompartimento.toLowerCase() === newCompartmentName.toLowerCase()
            );

            if (isDuplicate) {
                showAlert('Já existe outro compartimento com este nome.', 'error', editModalAlertMessage);
                return;
            }
            // *** End Duplicate Check ***

            const index = currentBFMData.compartments.findIndex(comp => comp.id === idToUpdate);

            if (index !== -1) {
                currentBFMData.compartments[index].tipoCompartimento = newCompartmentName; 
                
                // Also ensure the updated type is in the custom types list
                if (!currentBFMData.customCompartmentTypes.some(type => type.toLowerCase() === newCompartmentName.toLowerCase())) {
                    currentBFMData.customCompartmentTypes.push(newCompartmentName);
                }

                saveBFMFleetData(currentBFMData);
                showAlert('Compartimento atualizado com sucesso!', 'success', editModalAlertMessage);
                displayCompartments(document.getElementById('filterCompartments').value); // Re-render main list
                setTimeout(closeEditModal, 1000); // Close modal after a short delay
            } else {
                showAlert('Erro: Compartimento não encontrado para atualização.', 'error', editModalAlertMessage);
            }
        });

        cancelEditCompartmentBtn.addEventListener('click', closeEditModal);

        editCompartmentModal.addEventListener('click', (event) => {
            if (event.target === editCompartmentModal) { // Clicked on overlay, not content
                closeEditModal();
            }
        });

        // --- Lógica do Filtro ---
        const filterInput = document.getElementById('filterCompartments');
        filterInput.addEventListener('keyup', () => {
            displayCompartments(filterInput.value);
        });

        // --- Script para Dropdowns do Header ---
        document.addEventListener('DOMContentLoaded', function() {
            const dropdowns = document.querySelectorAll('.dropdown');
            dropdowns.forEach(dropdown => {
                const button = dropdown.querySelector('button[aria-haspopup="true"]');
                const dropdownContent = dropdown.querySelector('.dropdown-content');

                if (button && dropdownContent) {
                    button.addEventListener('click', function(event) {
                        event.stopPropagation(); // Prevent document click from immediately closing
                        // Close other open main dropdowns
                        dropdowns.forEach(otherDropdown => {
                            const otherDropdownContent = otherDropdown.querySelector('.dropdown-content');
                            const otherButton = otherDropdown.querySelector('button[aria-haspopup="true"]');
                            if (otherDropdown !== dropdown && otherDropdownContent && !otherDropdownContent.classList.contains('hidden')) {
                                otherDropdownContent.classList.add('hidden');
                                otherDropdownContent.classList.remove('animate-fade-in-down'); // Main menu uses fadeInDown
                                if (otherButton) {
                                    otherButton.setAttribute('aria-expanded', 'false');
                                }
                            }
                        });

                        // Toggle current main dropdown
                        dropdownContent.classList.toggle('hidden');
                        dropdownContent.classList.toggle('animate-fade-in-down'); // Main menu uses fadeInDown
                        button.setAttribute('aria-expanded', dropdownContent.classList.contains('hidden') ? 'false' : 'true');

                        // Close any open submenus within this main dropdown when its main menu is toggled
                        const openSubmenus = dropdownContent.querySelectorAll('.submenu-content:not(.hidden)');
                        openSubmenus.forEach(submenu => {
                            submenu.classList.add('hidden');
                            submenu.classList.remove('animate-fade-in-right'); // Submenu uses fadeInRight
                            const submenuTrigger = submenu.previousElementSibling;
                            if (submenuTrigger && submenuTrigger.hasAttribute('aria-expanded')) {
                                submenuTrigger.setAttribute('aria-expanded', 'false');
                            }
                        });
                    });

                    // Prevent clicks inside the dropdown from closing it
                    dropdownContent.addEventListener('click', function(event) {
                        event.stopPropagation();
                    });
                }
            });

            // Close dropdowns when clicking outside
            document.addEventListener('click', function(event) {
                dropdowns.forEach(dropdown => {
                    const dropdownContent = dropdown.querySelector('.dropdown-content');
                    const button = dropdown.querySelector('button[aria-haspopup="true"]');
                    // Check if the click was outside the dropdown button and content
                    if (dropdownContent && button && !dropdown.contains(event.target)) {
                        dropdownContent.classList.add('hidden');
                        dropdownContent.classList.remove('animate-fade-in-down'); // Main menu uses fadeInDown
                        button.setAttribute('aria-expanded', 'false');
                    }
                });
            });

            // Submenu logic
            const submenuTriggers = document.querySelectorAll('.submenu-trigger');
            submenuTriggers.forEach(trigger => {
                const submenuContent = trigger.nextElementSibling; // The submenu content
                if (submenuContent && submenuContent.classList.contains('submenu-content')) {
                    trigger.addEventListener('click', function(event) {
                        event.stopPropagation(); // Prevent parent dropdown from closing

                        // Close other open submenus within the same parent dropdown
                        const parentDropdownContent = trigger.closest('.dropdown-content');
                        if (parentDropdownContent) {
                            const otherSubmenus = parentDropdownContent.querySelectorAll('.submenu-content:not(.hidden)');
                            otherSubmenus.forEach(otherSubmenu => {
                                const otherTrigger = otherSubmenu.previousElementSibling;
                                if (otherSubmenu !== submenuContent && otherTrigger) {
                                    otherSubmenu.classList.add('hidden');
                                    otherSubmenu.classList.remove('animate-fade-in-right'); // Submenu uses fadeInRight
                                    otherTrigger.setAttribute('aria-expanded', 'false');
                                }
                            });
                        }

                        // Toggle current submenu
                        submenuContent.classList.toggle('hidden');
                        submenuContent.classList.toggle('animate-fade-in-right'); // Submenu uses fadeInRight
                        trigger.setAttribute('aria-expanded', submenuContent.classList.contains('hidden') ? 'false' : 'true');
                    });

                    // Prevent clicks inside submenu from closing it
                    submenuContent.addEventListener('click', function(event) {
                        event.stopPropagation();
                    });
                }
            });

            // Alert Bell Button Logic
            const alertBellButton = document.getElementById('alertBellButton');
            const alertDropdown = document.getElementById('alertDropdown');
            if (alertBellButton && alertDropdown) {
                alertBellButton.addEventListener('click', function(event) {
                    event.stopPropagation(); // Prevents this click from bubbling up to document
                    alertDropdown.classList.toggle('hidden');
                    alertDropdown.classList.toggle('animate-fade-in-down'); // This one likely still opens down
                    alertBellButton.setAttribute('aria-expanded', alertDropdown.classList.contains('hidden') ? 'false' : 'true');
                });

                alertDropdown.addEventListener('click', function(event) {
                    event.stopPropagation(); // Prevents clicks *inside* the dropdown from closing it
                });
            }
        });

        function logout() {
            localStorage.removeItem('logado');
            window.location.replace('login.html');
        }

        // --- INITIAL LOAD AND SETUP ---
        document.addEventListener('DOMContentLoaded', () => {
            // Check login status
            if (localStorage.getItem('logado') !== 'true') {
                window.location.replace('login.html');
                return;
            }
            
            // Removed populateTipoCompartimentoSelect() as it's no longer used with input type text
            displayCompartments(); // Loads and displays existing compartments
        });
    