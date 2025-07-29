document.addEventListener('DOMContentLoaded', function() {
    // --- Lógica de Dropdowns e Submenus do Header ---
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('button[aria-haspopup="true"]');
        const dropdownContent = dropdown.querySelector('.dropdown-content');

        if (button && dropdownContent) {
            let timeoutId;

            const openMenu = () => {
                clearTimeout(timeoutId);
                closeAllOtherMenus(dropdown); // Fecha outros dropdowns principais
                dropdownContent.classList.remove('hidden');
                dropdownContent.classList.add('animate-fade-in-down', 'flex');
                button.setAttribute('aria-expanded', 'true');
                dropdown.classList.add('active'); // Adiciona classe ativa ao dropdown principal
            };

            const closeMenu = () => {
                timeoutId = setTimeout(() => {
                    dropdownContent.classList.remove('animate-fade-in-down', 'flex');
                    dropdownContent.classList.add('hidden');
                    button.setAttribute('aria-expanded', 'false');
                    dropdown.classList.remove('active'); // Remove classe ativa
                }, 100); // Pequeno delay para permitir cliques nos itens
            };

            // Listeners de evento para os dropdowns principais (mouseenter para abrir, mouseleave para fechar)
            button.addEventListener('mouseenter', openMenu);
            dropdown.addEventListener('mouseleave', closeMenu);
            dropdownContent.addEventListener('mouseenter', () => clearTimeout(timeoutId)); // Mantém aberto se o mouse entrar no menu

            // Lógica para submenus aninhados
            const submenuTriggers = dropdown.querySelectorAll('.submenu-trigger');
            submenuTriggers.forEach(submenuTrigger => {
                const submenuContent = submenuTrigger.nextElementSibling; // Pega o próximo irmão (conteúdo do submenu)

                if (submenuContent && submenuContent.classList.contains('submenu-content')) {
                    let submenuTimeoutId;

                    const openSubmenu = () => {
                        clearTimeout(submenuTimeoutId);
                        if (window.innerWidth >= 768) { // Comportamento de hover para desktop
                            submenuContent.classList.remove('hidden');
                            submenuContent.classList.add('animate-fade-in-right', 'flex');
                            submenuTrigger.setAttribute('aria-expanded', 'true');
                        }
                    };

                    const closeSubmenu = () => {
                        submenuTimeoutId = setTimeout(() => {
                            if (window.innerWidth >= 768) { // Comportamento de hover para desktop
                                submenuContent.classList.remove('animate-fade-in-right', 'flex');
                                submenuContent.classList.add('hidden');
                                submenuTrigger.setAttribute('aria-expanded', 'false');
                            }
                        }, 50);
                    };

                    // Desktop: Hover para submenus
                    if (window.innerWidth >= 768) {
                        submenuTrigger.addEventListener('mouseenter', openSubmenu);
                        submenuTrigger.parentElement.addEventListener('mouseleave', closeSubmenu); // Escuta no pai 'group'
                        submenuContent.addEventListener('mouseenter', () => clearTimeout(submenuTimeoutId));
                    }

                    // Mobile: Clique para alternar submenus
                    submenuTrigger.addEventListener('click', (e) => {
                        e.stopPropagation(); // Previne que o dropdown principal feche
                        if (window.innerWidth < 768) {
                            submenuContent.classList.toggle('hidden');
                            submenuContent.classList.toggle('flex');
                            const isExpanded = submenuTrigger.getAttribute('aria-expanded') === 'true';
                            submenuTrigger.setAttribute('aria-expanded', !isExpanded);
                        }
                    });
                }
            });
        }
    });

    // Fecha todos os dropdowns, exceto o que está sendo aberto atualmente
    function closeAllOtherMenus(currentDropdown = null) {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            if (dropdown !== currentDropdown) {
                const menu = dropdown.querySelector('.dropdown-content');
                const button = dropdown.querySelector('button[aria-haspopup="true"]');
                if (menu && button && !menu.classList.contains('hidden')) {
                    menu.classList.add('hidden');
                    menu.classList.remove('animate-fade-in-down', 'flex');
                    button.setAttribute('aria-expanded', 'false');
                    dropdown.classList.remove('active');

                    // Fecha todos os submenus dentro deste dropdown
                    const submenus = dropdown.querySelectorAll('.submenu-content');
                    submenus.forEach(submenu => {
                        submenu.classList.add('hidden');
                        submenu.classList.remove('animate-fade-in-right', 'flex');
                        const submenuTrigger = submenu.previousElementSibling;
                        if(submenuTrigger && submenuTrigger.classList.contains('submenu-trigger')) {
                            submenuTrigger.setAttribute('aria-expanded', 'false');
                        }
                    });
                }
            }
        });
    }

    // Fecha todos os dropdowns ao clicar em qualquer outro lugar do documento
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            closeAllOtherMenus();
        }
    });

    // Ajusta o 'active-menu' com base na página atual
    const currentPath = window.location.pathname.split('/').pop();
    document.querySelectorAll('.menu-link, .dropdown-item').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active-menu');
            // Para menus drop-down, adiciona a classe 'active-menu' ao botão pai
            let parentDropdownButton = link.closest('.dropdown')?.querySelector('button[aria-haspopup="true"]');
            if (parentDropdownButton) {
                parentDropdownButton.classList.add('active-menu');
            }
            // Para submenus, adiciona a classe 'active-menu' ao trigger do submenu
            let parentSubmenuTrigger = link.closest('.submenu-content')?.previousElementSibling;
            if (parentSubmenuTrigger && parentSubmenuTrigger.classList.contains('submenu-trigger')) {
                parentSubmenuTrigger.classList.add('active-menu');
            }
        } else {
            link.classList.remove('active-menu');
        }
    });

    // Gerenciamento de Alertas (Exemplo Básico)
    const alertBellButton = document.getElementById('alertBellButton');
    const alertDropdown = document.getElementById('alertDropdown');
    const alertList = document.getElementById('alertList');
    const alertCountSpan = document.getElementById('alertCount');
    let alerts = [];

    function updateAlertsDisplay() {
        alertList.innerHTML = '';
        if (alerts.length === 0) {
            alertList.innerHTML = '<p class="text-sm text-gray-500">Nenhum alerta no momento.</p>';
            alertCountSpan.style.display = 'none';
        } else {
            alerts.forEach((alert, index) => {
                const alertItem = document.createElement('div');
                alertItem.className = 'flex items-center justify-between p-2 hover:bg-gray-50 rounded-md';
                alertItem.innerHTML = `
                    <p class="text-sm text-gray-700">${alert.message}</p>
                    <button class="text-gray-400 hover:text-gray-700 ml-2" onclick="removeAlert(${index})">
                        <i class="ph ph-x"></i>
                    </button>
                `;
                alertList.appendChild(alertItem);
            });
            alertCountSpan.textContent = alerts.length;
            alertCountSpan.style.display = 'block';
        }
    }

    window.removeAlert = function(index) {
        alerts.splice(index, 1);
        updateAlertsDisplay();
    };

    alertBellButton.addEventListener('click', (e) => {
        e.stopPropagation();
        alertDropdown.classList.toggle('hidden');
        alertDropdown.classList.toggle('flex');
    });

    document.addEventListener('click', (e) => {
        if (!alertBellButton.contains(e.target) && !alertDropdown.contains(e.target)) {
            alertDropdown.classList.add('hidden');
            alertDropdown.classList.remove('flex');
        }
    });

    window.logout = function() {
        if (confirm('Tem certeza que deseja sair?')) {
            localStorage.clear();
            // window.location.href = 'login.html'; // Descomente para redirecionar
            alert('Usuário desconectado!');
        }
    };

    // --- FIM DA LÓGICA DE DROPDOWNS E ALERTAS ---

    // --- INÍCIO DA LÓGICA DE CADASTRO DE MARCAS ---

    // --- FUNÇÕES DE ARMAZENAMENTO DE DADOS (LocalStorage) ---
    function getBFMFleetData() {
        const data = localStorage.getItem('bfmFleetData');
        return data ? JSON.parse(data) : {
            vehicles: [],
            compartments: [],
            brands: [],
            fuels: [],
            models: [],
            technicians: [],
            suppliers: [],
            periodicities: [],
            workshops: [],
            hodometerHorimeter: [],
            maintenancePlans: [],
            serviceOrders: [],
            customCompartmentTypes: [],
            actions: []
        };
    }

    function saveBFMFleetData(data) {
        localStorage.setItem('bfmFleetData', JSON.stringify(data));
        const marcaChannel = new BroadcastChannel('bfm_marcas_channel');
        marcaChannel.onmessage = function(event) {
    if (event.data && event.data.type === 'marcas_atualizadas') {
        console.log('Dados de marcas atualizados por outra aba/janela. Recarregando...');
        renderMarcas(); // Recarrega a lista de marcas
    }
};
        // AQUI É ONDE SERÁ ADICIONADO O CÓDIGO DO BroadcastChannel.postMessage()
    }

    // --- Broadcast Channel para comunicação entre abas/janelas ---
    const marcaChannel = new BroadcastChannel('bfm_marcas_channel'); // Esta linha já estava presente no seu código anterior

    // AQUI É ONDE SERÁ ADICIONADO O CÓDIGO DO BroadcastChannel.onmessage

    // --- Variáveis Globais para Marcas ---
    let marcas = getBFMFleetData().brands || [];
    let editingMarcaId = null;
    let marcaIdToDelete = null;

    // --- Elementos do DOM ---
    const addMarcaForm = document.getElementById('addMarcaForm');
    const nomeMarcaInput = document.getElementById('nomeMarca');
    const marcasListTbody = document.querySelector('#marcasList tbody');
    const noMarcasMessage = document.getElementById('noMarcasMessage');
    const editMarcaModal = document.getElementById('editMarcaModal');
    const editMarcaForm = document.getElementById('editMarcaForm');
    const editNomeMarcaInput = document.getElementById('editNomeMarca');
    const editMarcaIdInput = document.getElementById('editMarcaId');
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalNo = document.getElementById('confirmModalNo');
    const confirmModalYes = document.getElementById('confirmModalYes');
    const feedbackMessage = document.getElementById('feedbackMessage');

    // --- FUNÇÕES DE FEEDBACK ---
    function showFeedback(message, type = 'success') {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl text-white z-50 transition-all duration-300 ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'} show`;
        setTimeout(() => {
            feedbackMessage.classList.remove('show');
            setTimeout(() => feedbackMessage.classList.add('hidden'), 300);
        }, 3000);
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO DE MARCAS ---
    function renderMarcas() {
        marcas = getBFMFleetData().brands || [];
        marcasListTbody.innerHTML = '';

        if (marcas.length === 0) {
            noMarcasMessage.classList.remove('hidden');
            marcasListTbody.closest('table').classList.add('hidden');
            return;
        }
        noMarcasMessage.classList.add('hidden');
        marcasListTbody.closest('table').classList.remove('hidden');

        marcas.forEach(marca => {
            const row = marcasListTbody.insertRow();
            row.innerHTML = `
                <td>${marca.nome}</td>
                <td class="action-buttons">
                    <button class="btn-edit" onclick="openEditMarcaModal(${marca.id})">
                        <i class="ph ph-pencil"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="confirmDeleteMarca(${marca.id})">
                        <i class="ph ph-trash"></i> Excluir
                    </button>
                </td>
            `;
        });
    }

    // --- FUNÇÕES DO FORMULÁRIO DE CADASTRO ---
    addMarcaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = nomeMarcaInput.value.trim();

        if (!nome) {
            showFeedback('Por favor, insira o nome da marca.', 'error');
            return;
        }

        if (marcas.some(m => m.nome.toLowerCase() === nome.toLowerCase())) {
            showFeedback('Esta marca já está cadastrada.', 'error');
            return;
        }

        const novaMarca = {
            id: Date.now(),
            nome: nome
        };

        let bfmData = getBFMFleetData();
        bfmData.brands.push(novaMarca);
        saveBFMFleetData(bfmData);
        marcas = bfmData.brands;

        showFeedback('Marca cadastrada com sucesso!', 'success');
        nomeMarcaInput.value = '';
        renderMarcas();
    });

    // --- FUNÇÕES DO MODAL DE EDIÇÃO ---
    // Funções openEditMarcaModal e closeEditMarcaModal precisam ser globais se chamadas diretamente do HTML
    window.openEditMarcaModal = function(id) {
        const marca = marcas.find(m => m.id === id);
        if (marca) {
            editingMarcaId = id;
            editMarcaIdInput.value = marca.id;
            editNomeMarcaInput.value = marca.nome;
            editMarcaModal.classList.add('open');
            editMarcaModal.classList.remove('hidden');
        }
    }

    window.closeEditMarcaModal = function() {
        editMarcaModal.classList.remove('open');
        editMarcaModal.classList.add('hidden');
        editingMarcaId = null;
        editMarcaForm.reset();
    }

    editMarcaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(editMarcaIdInput.value);
        const novoNome = editNomeMarcaInput.value.trim();

        if (!novoNome) {
            showFeedback('Por favor, insira o novo nome da marca.', 'error');
            return;
        }

        if (marcas.some(m => m.nome.toLowerCase() === novoNome.toLowerCase() && m.id !== id)) {
            showFeedback('Já existe outra marca com este nome.', 'error');
            return;
        }

        let bfmData = getBFMFleetData();
        const marcaIndex = bfmData.brands.findIndex(m => m.id === id);
        if (marcaIndex > -1) {
            bfmData.brands[marcaIndex].nome = novoNome;
            saveBFMFleetData(bfmData);
            marcas = bfmData.brands;
            showFeedback('Marca atualizada com sucesso!', 'success');
            renderMarcas();
            closeEditMarcaModal();
        } else {
            showFeedback('Marca não encontrada.', 'error');
        }
    });

    // --- FUNÇÕES DO MODAL DE CONFIRMAÇÃO DE EXCLUSÃO ---
    // Funções confirmDeleteMarca e deleteMarca precisam ser globais se chamadas diretamente do HTML
    window.confirmDeleteMarca = function(id) {
        const bfmData = getBFMFleetData();
        const vehicles = bfmData.vehicles || [];

        // Verifica se alguma veículo usa esta marca
        const marcaEmUso = vehicles.some(vehicle => vehicle.marcaId === id);

        if (marcaEmUso) {
            showFeedback('Esta marca não pode ser excluída porque está vinculada a um ou mais veículos.', 'error');
            return;
        }

        marcaIdToDelete = id;
        const marca = marcas.find(m => m.id === id);
        document.getElementById('confirmModalMessage').textContent = `Tem certeza que deseja excluir a marca "${marca ? marca.nome : ''}"?`;
        confirmModal.classList.add('open');
        confirmModal.classList.remove('hidden');
    }

    window.deleteMarca = function() {
        if (marcaIdToDelete !== null) {
            let bfmData = getBFMFleetData();
            bfmData.brands = bfmData.brands.filter(m => m.id !== marcaIdToDelete);
            saveBFMFleetData(bfmData);
            marcas = bfmData.brands;
            renderMarcas();
            showFeedback('Marca excluída com sucesso!', 'success');
            closeConfirmModal();
        }
    }

    window.closeConfirmModal = function() {
        confirmModal.classList.remove('open');
        confirmModal.classList.add('hidden');
        marcaIdToDelete = null;
    }

    confirmModalNo.addEventListener('click', closeConfirmModal);
    confirmModalYes.addEventListener('click', deleteMarca);

    // --- INITIAL LOAD AND SETUP ---
    renderMarcas(); // Renderização inicial da tabela
});