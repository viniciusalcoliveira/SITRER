document.addEventListener('DOMContentLoaded', function() {
    // --- Funções para gerenciar Dropdowns e Submenus (Navegação) ---
    // Função para fechar todos os dropdowns e submenus
    function closeAllDropdowns() {
        document.querySelectorAll('.dropdown-content:not(.hidden)').forEach(dropdown => {
            dropdown.classList.add('hidden');
            dropdown.classList.remove('animate-fade-in-down');
            const btn = dropdown.previousElementSibling;
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });
        document.querySelectorAll('.submenu-content:not(.hidden)').forEach(submenu => {
            submenu.classList.add('hidden');
            submenu.classList.remove('animate-fade-in-right');
            const btn = submenu.previousElementSibling;
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });
    }

    // Função para alternar dropdowns principais (abre para baixo)
    function toggleDropdown(buttonElement) {
        const dropdownContent = buttonElement.nextElementSibling;
        const isExpanded = buttonElement.getAttribute('aria-expanded') === 'true';

        // Close other main dropdowns
        document.querySelectorAll('.dropdown > button.menu-link[aria-expanded="true"]').forEach(btn => {
            if (btn !== buttonElement) {
                btn.nextElementSibling.classList.add('hidden');
                btn.nextElementSibling.classList.remove('animate-fade-in-down');
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        // Close all submenus when a main dropdown is clicked
        document.querySelectorAll('.submenu-content:not(.hidden)').forEach(submenu => {
            submenu.classList.add('hidden');
            submenu.classList.remove('animate-fade-in-right');
            const submenuTrigger = submenu.previousElementSibling;
            if (submenuTrigger) submenuTrigger.setAttribute('aria-expanded', 'false');
        });

        if (isExpanded) {
            dropdownContent.classList.add('hidden');
            dropdownContent.classList.remove('animate-fade-in-down');
            buttonElement.setAttribute('aria-expanded', 'false');
        } else {
            dropdownContent.classList.remove('hidden');
            dropdownContent.classList.add('animate-fade-in-down');
            buttonElement.setAttribute('aria-expanded', 'true');
        }
    }

    // Função para alternar submenus (abre para o lado)
    function toggleSubmenu(buttonElement) {
        const submenuContent = buttonElement.nextElementSibling;
        const isExpanded = buttonElement.getAttribute('aria-expanded') === 'true';

        // Close other submenus within the same parent
        const parentContainer = buttonElement.closest('.dropdown-content, .submenu-content');
        if (parentContainer) {
            parentContainer.querySelectorAll('.submenu-trigger[aria-expanded="true"]').forEach(btn => {
                if (btn !== buttonElement) {
                    btn.nextElementSibling.classList.add('hidden');
                    btn.nextElementSibling.classList.remove('animate-fade-in-right');
                    btn.setAttribute('aria-expanded', 'false');
                }
            });
        }

        if (isExpanded) {
            submenuContent.classList.add('hidden');
            submenuContent.classList.remove('animate-fade-in-right');
            buttonElement.setAttribute('aria-expanded', 'false');
        } else {
            submenuContent.classList.remove('hidden');
            submenuContent.classList.add('animate-fade-in-right');
            buttonElement.setAttribute('aria-expanded', 'true');
        }
    }

    // Event Listeners para dropdowns principais
    document.querySelectorAll('.dropdown > button.menu-link').forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent document click from closing immediately
            toggleDropdown(this);
        });
    });

    // Event Listeners para submenus
    document.querySelectorAll('.submenu-trigger').forEach(button => {
        // Click event for mobile and as fallback
        button.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent click from propagating to parent dropdown or document
            toggleSubmenu(this);
        });

        // Mouseover/mouseout for desktop for submenu functionality
        const submenuContainer = button.parentElement; // The .relative group div
        if (window.innerWidth >= 768) { // Apply hover only on desktop (md breakpoint)
            submenuContainer.addEventListener('mouseenter', function() {
                const submenuTriggerButton = this.querySelector('.submenu-trigger');
                const submenuContent = this.querySelector('.submenu-content');
                if (submenuContent && submenuContent.classList.contains('hidden')) {
                    toggleSubmenu(submenuTriggerButton);
                }
            });

            submenuContainer.addEventListener('mouseleave', function(event) {
                // Check if the mouse is truly leaving the entire submenu container (including its content)
                if (!this.contains(event.relatedTarget)) {
                    const submenuTriggerButton = this.querySelector('.submenu-trigger');
                    const submenuContent = this.querySelector('.submenu-content');
                    if (submenuContent && !submenuContent.classList.contains('hidden')) {
                        toggleSubmenu(submenuTriggerButton);
                    }
                }
            });
        }
    });

    // Fecha dropdowns/submenus quando clicar fora
    document.addEventListener('click', function(event) {
        // Check if the clicked element is *not* inside any .dropdown
        let isClickInsideDropdown = false;
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            if (dropdown.contains(event.target)) {
                isClickInsideDropdown = true;
            }
        });

        if (!isClickInsideDropdown) {
            closeAllDropdowns();
        }
    });

    // Previne que cliques dentro dos dropdown-contents fechem o menu
    document.querySelectorAll('.dropdown-content, .submenu-content').forEach(content => {
        content.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevents click from bubbling up to document and closing
        });
    });

    // Função para ativar o item de menu correto na navegação
    function activateMenuItem() {
        const currentPath = window.location.pathname.split('/').pop();

        // First, remove all active classes
        document.querySelectorAll('.menu-link, .dropdown-item, .submenu-trigger').forEach(item => {
            item.classList.remove('active-menu');
            // Also reset aria-expanded for elements that might be set from previous navigation
            if (item.hasAttribute('aria-expanded')) {
                item.setAttribute('aria-expanded', 'false');
            }
            const content = item.nextElementSibling;
            if (content && (content.classList.contains('dropdown-content') || content.classList.contains('submenu-content'))) {
                content.classList.add('hidden');
                content.classList.remove('animate-fade-in-down', 'animate-fade-in-right');
            }
        });

        // Then, activate the current page's menu item and its parents
        let activatedLink = null;
        document.querySelectorAll('.menu-link, .dropdown-item').forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref && linkHref.endsWith(currentPath) && currentPath !== '') {
                link.classList.add('active-menu');
                activatedLink = link;
            }
        });

        // If a link was activated, traverse up to activate its parent dropdowns/submenus
        if (activatedLink) {
            let parent = activatedLink.closest('.dropdown-content, .submenu-content');
            while (parent) {
                const parentButton = parent.previousElementSibling;
                if (parentButton && (parentButton.classList.contains('menu-link') || parentButton.classList.contains('submenu-trigger'))) {
                    parentButton.classList.add('active-menu');
                    parentButton.setAttribute('aria-expanded', 'true'); // Keep parent open
                    parent.classList.remove('hidden'); // Ensure parent content is visible
                    if (parent.classList.contains('dropdown-content')) {
                        parent.classList.add('animate-fade-in-down');
                    } else if (parent.classList.contains('submenu-content')) {
                        parent.classList.add('animate-fade-in-right');
                    }
                }
                // Move up to the next parent dropdown/submenu
                parent = parent.parentElement.closest('.dropdown-content, .submenu-content');
            }
        }
    }

    // Chama a função quando a página é carregada
    document.addEventListener('DOMContentLoaded', activateMenuItem);

    // Optional: Re-apply active class on internal link clicks for immediate visual feedback
    document.querySelectorAll('.menu-link, .dropdown-item, .submenu-trigger').forEach(item => {
        item.addEventListener('click', function() {
            // We'll rely on the full `activateMenuItem` on DOMContentLoaded for accurate state
            // This click handler is mostly to ensure immediate visual feedback without full page reload.
            // For actual navigation, `activateMenuItem` will run after the new page loads.
        });
    });

    // --- Alert Bell Icon (Notifications) ---
    const alertBellButton = document.getElementById('alertBellButton');
    const alertDropdown = document.getElementById('alertDropdown');
    const alertCountSpan = document.getElementById('alertCount');
    const alertList = document.getElementById('alertList');

    // Example alerts (replace with real data from backend/localStorage)
    let alerts = [
        { id: 1, message: "Manutenção preventiva do veículo ABC-1234 agendada para amanhã." },
        { id: 2, message: "Nível de combustível do veículo XYZ-5678 está baixo." }
    ];

    function updateAlertsDisplay() {
        if (alerts.length > 0) {
            alertCountSpan.textContent = alerts.length;
            alertCountSpan.style.display = 'block';
            alertList.innerHTML = ''; // Clear previous alerts
            alerts.forEach(alert => {
                const p = document.createElement('p');
                p.className = 'text-sm mb-1';
                p.textContent = alert.message;
                alertList.appendChild(p);
            });
        } else {
            alertCountSpan.style.display = 'none';
            alertList.innerHTML = '<p class="text-sm text-gray-500">Nenhum alerta no momento.</p>';
        }
    }

    // Toggle alert dropdown
    alertBellButton.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent document click from closing
        // Close other main dropdowns first
        document.querySelectorAll('.dropdown > button.menu-link[aria-expanded="true"]').forEach(btn => {
            if (btn !== alertBellButton) {
                btn.nextElementSibling.classList.add('hidden');
                btn.nextElementSibling.classList.remove('animate-fade-in-down');
                btn.setAttribute('aria-expanded', 'false');
            }
        });
        // Close all submenus
        document.querySelectorAll('.submenu-content:not(.hidden)').forEach(submenu => {
            submenu.classList.add('hidden');
            submenu.classList.remove('animate-fade-in-right');
            const submenuTrigger = submenu.previousElementSibling;
            if (submenuTrigger) submenuTrigger.setAttribute('aria-expanded', 'false');
        });

        const isExpanded = alertBellButton.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            alertDropdown.classList.add('hidden');
            alertDropdown.classList.remove('animate-fade-in-down');
            alertBellButton.setAttribute('aria-expanded', 'false');
        } else {
            alertDropdown.classList.remove('hidden');
            alertDropdown.classList.add('animate-fade-in-down');
            alertBellButton.setAttribute('aria-expanded', 'true');
        }
    });

    // Call on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', updateAlertsDisplay);


    // --- SEGURANÇA DE LOGIN ---
    if (localStorage.getItem('logado') !== 'true') {
        if (typeof __app_id === 'undefined') {
            window.location.href = 'login.html';
        } else {
            console.log("Running in Canvas environment, bypassing login redirect.");
            localStorage.setItem('logado', 'true');
        }
    }

    function logout() {
        localStorage.removeItem('logado');
        if (typeof __app_id === 'undefined') {
            window.location.href = 'login.html';
        } else {
            console.log("Running in Canvas environment, logout simulated.");
        }
    }

    // --- Funções de Persistência de Dados (DEVE SER IDÊNTICA EM TODOS OS SEUS ARQUIVOS JS) ---
    // Função para obter os dados do localStorage
    function getBFMFleetData() {
        const data = localStorage.getItem('bfmFleetData');
        return data ? JSON.parse(data) : {
            vehicles: [],
            brands: [],
            fuels: [], // ESSENCIAL: Garanta que 'fuels' está aqui!
            models: [],
            customCompartmentTypes: [], // Ou o nome que você usa para Tipo de Veículo
        };
    }

    // Função para salvar os dados no localStorage e notificar outras abas
    function saveBFMFleetData(data) {
        localStorage.setItem('bfmFleetData', JSON.stringify(data));
        const generalChannel = new BroadcastChannel('bfm_fleet_channel');
        generalChannel.postMessage({ type: 'dados_atualizados' }); // Envia a notificação
    }

    // --- LÓGICA DO FORMULÁRIO DE CADASTRO DE COMBUSTÍVEL ---
    const combustivelForm = document.getElementById('combustivelForm');
    const combustiveisTableBody = document.getElementById('combustiveisTableBody');
    const userFeedback = document.getElementById('userFeedback');

    // Elements do modal de edição
    const editCombustivelModal = document.getElementById('editCombustivelModal');
    const editCombustivelForm = document.getElementById('editCombustivelForm');
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalYes = document.getElementById('confirmModalYes');
    const confirmModalNo = document.getElementById('confirmModalNo');

    // Variáveis para controle (não mais lidas diretamente do localStorage no início)
    let currentEditingCombustivelId = null; // Para guardar o ID do combustível sendo editado
    let combustivelIdToDelete = null;       // Para guardar o ID do combustível a ser excluído

    // --- BroadcastChannel para comunicação entre abas (específico para esta página) ---
    const generalChannel = new BroadcastChannel('bfm_fleet_channel');

    generalChannel.onmessage = function(event) {
        if (event.data && event.data.type === 'dados_atualizados') {
            console.log('Dados gerais atualizados por outra aba. Recarregando combustíveis...');
            // Quando uma notificação é recebida, renderiza os combustíveis novamente
            renderCombustiveis();
        }
    };

    // Display user feedback messages (success/error banners)
    function showFeedback(message, type = 'success') {
        userFeedback.textContent = message;
        userFeedback.className = `p-4 mt-4 rounded-lg text-white font-bold text-center ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        userFeedback.classList.remove('hidden');
        setTimeout(() => {
            userFeedback.classList.add('hidden');
        }, 3000); // Hide after 3 seconds
    }

    // Render combustíveis in the table
    function renderCombustiveis() {
        // Agora pegamos os combustíveis do objeto bfmFleetData
        const bfmData = getBFMFleetData();
        const combustiveis = bfmData.fuels || []; // Garante que é um array, mesmo se vazio

        combustiveisTableBody.innerHTML = ''; // Clear table before re-rendering
        if (combustiveis.length === 0) {
            combustiveisTableBody.innerHTML = `<tr><td colspan="3" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">Nenhum combustível cadastrado.</td></tr>`;
            return;
        }

        combustiveis.forEach(combustivel => {
            const row = combustiveisTableBody.insertRow();
            row.className = 'hover:bg-gray-100 transition-colors';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${combustivel.id}</td>
                <td class="px-6 py-4 whitespace-nowrap">${combustivel.nome}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="openEditCombustivelModal(${combustivel.id})" class="text-indigo-600 hover:text-indigo-900 mr-3" title="Editar">
                        <i class="ph ph-pencil-simple text-lg"></i>
                    </button>
                    <button onclick="confirmDeleteCombustivel(${combustivel.id})" class="text-red-600 hover:text-red-900" title="Excluir">
                        <i class="ph ph-trash text-lg"></i>
                    </button>
                </td>
            `;
        });
        // Não é mais necessário salvar "combustiveis" diretamente aqui,
        // pois saveBFMFleetData() fará isso no submit/edição/exclusão.
    }

    // Add new combustível
    combustivelForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const nomeCombustivelInput = document.getElementById('nomeCombustivel');
        const nome = nomeCombustivelInput.value.trim();

        if (nome === '') {
            showFeedback('O nome do combustível não pode ser vazio.', 'error');
            return;
        }

        let bfmData = getBFMFleetData(); // Pega os dados atuais
        const currentFuels = bfmData.fuels || []; // Pega o array de combustíveis

        // Check for duplicate (case-insensitive)
        const isDuplicate = currentFuels.some(c => c.nome.toLowerCase() === nome.toLowerCase());
        if (isDuplicate) {
            showFeedback('Já existe um combustível com este nome!', 'error');
            return;
        }

        // Calcula o próximo ID de forma robusta, buscando o maior ID existente + 1
        const nextId = currentFuels.length > 0 ? Math.max(...currentFuels.map(c => c.id)) + 1 : 1;

        const newCombustivel = {
            id: nextId,
            nome: nome
        };

        bfmData.fuels.push(newCombustivel); // Adiciona o novo combustível ao array
        saveBFMFleetData(bfmData); // Salva os dados atualizados e notifica outras abas

        combustivelForm.reset();
        renderCombustiveis(); // Re-renderiza a tabela
        showFeedback('Combustível cadastrado com sucesso!', 'success');
    });

    // --- EDIT MODAL FUNCTIONS ---
    // Make these functions globally accessible if called from onclick in HTML
    window.openEditCombustivelModal = function(id) {
        currentEditingCombustivelId = id;
        const bfmData = getBFMFleetData();
        const combustiveis = bfmData.fuels || [];
        const combustivelToEdit = combustiveis.find(c => c.id === id);

        if (combustivelToEdit) {
            document.getElementById('edit-nomeCombustivel').value = combustivelToEdit.nome;
            editCombustivelModal.classList.remove('hidden');
            editCombustivelModal.classList.add('flex');
        }
    }

    window.closeEditCombustivelModal = function() { // Make global
        editCombustivelModal.classList.add('hidden');
        editCombustivelModal.classList.remove('flex');
        currentEditingCombustivelId = null;
    }

    editCombustivelForm.addEventListener('submit', function(event) {
        event.preventDefault();

        if (currentEditingCombustivelId === null) {
            showFeedback('Erro: Nenhum combustível selecionado para edição.', 'error');
            return;
        }

        const editedNome = document.getElementById('edit-nomeCombustivel').value.trim();

        if (editedNome === '') {
            showFeedback('O nome do combustível não pode ser vazio.', 'error');
            return;
        }

        let bfmData = getBFMFleetData();
        let combustiveis = bfmData.fuels || [];

        // Check for duplicate name, excluding the current item being edited
        const isDuplicate = combustiveis.some(c => c.id !== currentEditingCombustivelId && c.nome.toLowerCase() === editedNome.toLowerCase());
        if (isDuplicate) {
            showFeedback('Já existe outro combustível com este nome!', 'error');
            return;
        }

        const index = combustiveis.findIndex(c => c.id === currentEditingCombustivelId);
        if (index !== -1) {
            combustiveis[index].nome = editedNome;
            bfmData.fuels = combustiveis; // Atualiza o array dentro do bfmData
            saveBFMFleetData(bfmData); // Salva e notifica
            renderCombustiveis();
            showFeedback('Combustível atualizado com sucesso!', 'success');
            closeEditCombustivelModal();
        } else {
            showFeedback('Combustível não encontrado.', 'error');
        }
    });

    // --- CONFIRMATION MODAL FUNCTIONS ---
    // Make these functions globally accessible if called from onclick in HTML
    window.confirmDeleteCombustivel = function(id) {
        combustivelIdToDelete = id;
        document.getElementById('confirmModalMessage').textContent = 'Tem certeza que deseja excluir este combustível?';
        confirmModal.classList.remove('hidden');
        confirmModal.classList.add('flex');
    }

    confirmModalYes.addEventListener('click', function() {
        if (combustivelIdToDelete !== null) {
            let bfmData = getBFMFleetData();
            // Filtra o array de combustíveis, removendo o item
            bfmData.fuels = (bfmData.fuels || []).filter(c => c.id !== combustivelIdToDelete);
            saveBFMFleetData(bfmData); // Salva e notifica
            renderCombustiveis();
            showFeedback('Combustível excluído com sucesso!', 'success');
        }
        closeConfirmModal();
    });

    confirmModalNo.addEventListener('click', closeConfirmModal);

    window.closeConfirmModal = function() { // Make global
        confirmModal.classList.add('hidden');
        confirmModal.classList.remove('flex');
        combustivelIdToDelete = null;
    }

    // Initial render when the page loads
    document.addEventListener('DOMContentLoaded', renderCombustiveis);
}); // Fim do DOMContentLoaded