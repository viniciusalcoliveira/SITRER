document.addEventListener('DOMContentLoaded', function() {
    // --- Lógica do menu dropdown (mantida como está) ---
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('button[aria-haspopup="true"]');
        const dropdownContent = dropdown.querySelector('.dropdown-content');

        if (button && dropdownContent) {
            button.addEventListener('click', function(event) {
                event.stopPropagation();
                dropdowns.forEach(otherDropdown => {
                    const otherDropdownContent = otherDropdown.querySelector('.dropdown-content');
                    // Corrected selector: 'button[aria-haspopup="true enquiry"]' -> 'button[aria-haspopup="true"]'
                    // The ' enquiry' part was likely a typo or an unused attribute.
                    const otherButton = otherDropdown.querySelector('button[aria-haspopup="true"]');
                    if (otherDropdown !== dropdown && otherDropdownContent && !otherDropdownContent.classList.contains('hidden')) {
                        otherDropdownContent.classList.add('hidden');
                        otherDropdownContent.classList.remove('animate-fade-in-down');
                        if (otherButton) {
                            otherButton.setAttribute('aria-expanded', 'false');
                        }
                    }
                });
                dropdownContent.classList.toggle('hidden');
                dropdownContent.classList.toggle('animate-fade-in-down');
                button.setAttribute('aria-expanded', dropdownContent.classList.contains('hidden') ? 'false' : 'true');

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

            dropdownContent.addEventListener('click', function(event) {
                event.stopPropagation();
            });
        }
    });

    document.addEventListener('click', function(event) {
        dropdowns.forEach(dropdown => {
            const dropdownContent = dropdown.querySelector('.dropdown-content');
            const button = dropdown.querySelector('button[aria-haspopup="true"]');
            if (dropdownContent && button && !dropdown.contains(event.target)) {
                dropdownContent.classList.add('hidden');
                dropdownContent.classList.remove('animate-fade-in-down');
                button.setAttribute('aria-expanded', 'false');
            }
        });
    });

    const submenuTriggers = document.querySelectorAll('.submenu-trigger');
    submenuTriggers.forEach(trigger => {
        const submenuContent = trigger.nextElementSibling;
        if (submenuContent && submenuContent.classList.contains('submenu-content')) {
            trigger.addEventListener('click', function(event) {
                event.stopPropagation();
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
                submenuContent.classList.toggle('hidden');
                submenuContent.classList.toggle('animate-fade-in-right');
                trigger.setAttribute('aria-expanded', submenuContent.classList.contains('hidden') ? 'false' : 'true');
            });
            submenuContent.addEventListener('click', function(event) {
                event.stopPropagation();
            });
        }
    });

    const alertBellButton = document.getElementById('alertBellButton');
    const alertDropdown = document.getElementById('alertDropdown');
    if (alertBellButton && alertDropdown) {
        alertBellButton.addEventListener('click', function(event) {
            event.stopPropagation();
            alertDropdown.classList.toggle('hidden');
            alertDropdown.classList.toggle('animate-fade-in-down');
            alertBellButton.setAttribute('aria-expanded', alertDropdown.classList.contains('hidden') ? 'false' : 'true');
        });

        alertDropdown.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }

    document.addEventListener('click', function(event) {
        if (alertDropdown && alertBellButton && !alertDropdown.contains(event.target) && !alertBellButton.contains(event.target)) {
            alertDropdown.classList.add('hidden');
            alertDropdown.classList.remove('animate-fade-in-down');
            alertBellButton.setAttribute('aria-expanded', 'false');
        }
    });

    // --- FUNÇÕES DE ARMAZENAMENTO DE DADOS (LocalStorage) ---
    // CENTRALIZADAS para serem as mesmas em todas as páginas
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
        // Notifica outras abas sobre a mudança
        // Usa 'bfm_fleet_channel' para ser mais genérico e evitar conflitos.
        // Certifique-se de que todas as páginas que precisam ser notificadas escutem este canal.
        const channel = new BroadcastChannel('bfm_fleet_channel');
        channel.postMessage({ type: 'dados_atualizados' });
    }

    // --- Broadcast Channel para comunicação entre abas/janelas ---
    const vehicleChannel = new BroadcastChannel('bfm_fleet_channel'); // Usa um nome de canal consistente

    // Listener para mensagens do Broadcast Channel
    vehicleChannel.onmessage = function(event) {
        // Se a mensagem for sobre atualização de dados gerais, renderiza novamente os selects e a tabela
        if (event.data && event.data.type === 'dados_atualizados') {
            console.log('Dados atualizados por outra aba/janela. Recarregando selects e tabela de veículos...');
            // Recarrega todas as variáveis locais e renderiza novamente
            let bfmData = getBFMFleetData();
            vehicles = bfmData.vehicles || [];
            brands = bfmData.brands || [];
            models = bfmData.models || [];
            types = bfmData.customCompartmentTypes || [];
            fuels = bfmData.fuels || [];
            renderAllSelects();
            renderVehiclesTable();
        }
    };

    // --- Início do Script de Gerenciamento de Veículos ---
    const vehicleForm = document.getElementById('vehicleForm');
    const vehiclesTableBody = document.getElementById('vehiclesTableBody');
    const editVehicleForm = document.getElementById('editVehicleForm');
    const editVehicleModal = document.getElementById('editVehicleModal');
    const closeEditVehicleModalButton = document.getElementById('closeEditVehicleModal'); // Added this for explicit close button
    const userFeedback = document.getElementById('userFeedback');

    // Modais para registro dinâmico (Marca, Modelo, Tipo, Combustível)
    const registerModal = document.getElementById('registerModal');
    const registerModalTitle = document.getElementById('registerModalTitle');
    const registerNameInput = document.getElementById('registerName');
    const registerList = document.getElementById('registerList');
    const registerForm = document.getElementById('registerForm'); // Get the form for dynamic registration
    let currentRegisterType = ''; // 'marca', 'modelo', 'tipo', 'combustivel'

    // Armazenamento de dados (AGORA USANDO getBFMFleetData)
    // Inicializa variáveis locais a partir da função centralizada
    let vehicles = getBFMFleetData().vehicles || [];
    let brands = getBFMFleetData().brands || [];
    let models = getBFMFleetData().models || [];
    let types = getBFMFleetData().customCompartmentTypes || []; // Ajustado para 'customCompartmentTypes'
    let fuels = getBFMFleetData().fuels || [];

    // Variáveis globais para controle de edição de veículos e documentos
    let currentEditingVehicleId = null;
    let selectedEditDocuments = [];

    // Funções de feedback (mantido como está)
    function showFeedback(message, type = 'success') {
        userFeedback.textContent = message;
        userFeedback.classList.remove('hidden', 'bg-green-100', 'bg-red-100', 'bg-yellow-100', 'bg-blue-100', 'text-green-800', 'text-red-800', 'text-yellow-800', 'text-blue-800');
        userFeedback.classList.add('p-3', 'rounded-lg', 'mb-4', 'text-center');
        userFeedback.classList.add('show');

        if (type === 'success') {
            userFeedback.classList.add('bg-green-100', 'text-green-800');
        } else if (type === 'error') {
            userFeedback.classList.add('bg-red-100', 'text-red-800');
        } else if (type === 'warning') {
            userFeedback.classList.add('bg-yellow-100', 'text-yellow-800');
        } else if (type === 'info') {
            userFeedback.classList.add('bg-blue-100', 'text-blue-800');
        }

        setTimeout(() => {
            userFeedback.classList.remove('show');
            userFeedback.classList.add('hidden');
        }, 3000);
    }

    // Preenche campos de seleção dinâmica com Select2 (otimizado para tratamento de IDs/Nomes)
    function populateSelect(selectId, dataArray, selectedValue = '') {
        const selectElement = document.getElementById(selectId);
        if (!selectElement) return;

        if ($(selectElement).data('select2')) {
            $(selectElement).select2('destroy');
        }

        let placeholderText = "Selecione um item";
        let enableTags = false;

        if (selectId.includes('marca')) {
            placeholderText = 'Selecione uma Marca ou digite para adicionar';
            enableTags = true;
        } else if (selectId.includes('modelo')) {
            placeholderText = 'Selecione um Modelo ou digite para adicionar';
            enableTags = true;
        } else if (selectId.includes('tipoVeiculo')) {
            placeholderText = 'Selecione o Tipo de Veículo ou digite para adicionar';
            enableTags = true;
        } else if (selectId.includes('combustivel')) {
            placeholderText = 'Selecione o Combustível ou digite para adicionar';
            enableTags = true;
        } else if (selectId.includes('status')) {
            placeholderText = 'Selecione o Status';
            enableTags = false;
        }

        selectElement.innerHTML = `<option value="">${placeholderText}</option>`;

        dataArray.forEach(item => {
            const option = document.createElement('option');
            const value = typeof item === 'object' && item !== null && item.id ? item.id : item;
            const text = typeof item === 'object' && item !== null && item.nome ? item.nome : item;
            option.value = value;
            option.textContent = text;
            selectElement.appendChild(option);
        });

        const select2Options = {
            placeholder: placeholderText,
            allowClear: true,
            // Ensure dropdownParent is correctly set for modals to avoid z-index issues
            dropdownParent: selectElement.closest('.modal-content') || document.body
        };

        if (enableTags) {
            select2Options.tags = true;
            select2Options.createTag = function(params) {
                if (selectId.includes('marca')) {
                    return {
                        id: params.term, // Use term as id for new brands initially to differentiate from existing
                        text: params.term,
                        newOption: true
                    };
                } else {
                    return {
                        id: params.term, // The value will be the name itself for new tags of model, type, fuel
                        text: params.term,
                        newOption: true
                    };
                }
            };
            select2Options.insertTag = function (data, tag) {
                data.unshift(tag);
            };
        } else {
            if (dataArray.length < 10) {
                select2Options.minimumResultsForSearch = Infinity;
            }
        }

        $(selectElement).select2(select2Options);

        // Set the selected value after Select2 initialization
        if (selectedValue) {
            // If the selectedValue is an ID for brands, find the corresponding name
            if (selectId.includes('marca')) {
                const brand = dataArray.find(b => b.id === selectedValue);
                if (brand) {
                    $(selectElement).val(brand.id).trigger('change');
                } else if (typeof selectedValue === 'string') { // Handle cases where saved brand might be just a name
                    $(selectElement).val(selectedValue).trigger('change');
                }
            } else if (enableTags && typeof selectedValue === 'string' && !dataArray.some(item => (typeof item === 'object' ? item.nome : item) === selectedValue)) {
                 // If the value is a string and it's not in the dataArray, add it as a new option
                const newOption = new Option(selectedValue, selectedValue, true, true);
                $(selectElement).append(newOption).trigger('change');
            }
            else {
                $(selectElement).val(selectedValue).trigger('change');
            }
        }
    }

    // Renderiza todos os selects dinâmicos na página principal e no modal de edição
    function renderAllSelects(selectedVehicle = {}) {
        // Atualiza as variáveis locais com os dados mais recentes do localStorage
        const bfmData = getBFMFleetData();
        brands = bfmData.brands || [];
        models = bfmData.models || [];
        types = bfmData.customCompartmentTypes || []; // Ajustado para 'customCompartmentTypes'
        fuels = bfmData.fuels || [];

        // Campos do formulário principal
        populateSelect('marca', brands, selectedVehicle.marcaId); // Usar marcaId para a seleção
        populateSelect('modelo', models, selectedVehicle.modelo);
        populateSelect('tipoVeiculo', types, selectedVehicle.tipoVeiculo);
        populateSelect('combustivel', fuels, selectedVehicle.combustivel);
        populateSelect('status', ['ATIVO', 'INATIVO'], selectedVehicle.status); // Adicionado "MANUTENÇÃO"

        // Campos do modal de edição
        populateSelect('edit-marca', brands, selectedVehicle.marcaId); // Usar marcaId para a seleção
        populateSelect('edit-modelo', models, selectedVehicle.modelo);
        populateSelect('edit-tipoVeiculo', types, selectedVehicle.tipoVeiculo);
        populateSelect('edit-combustivel', fuels, selectedVehicle.combustivel);
        populateSelect('edit-status', ['ATIVO', 'INATIVO', 'MANUTENÇÃO'], selectedVehicle.status); // Added "MANUTENÇÃO"
    }

    // Chamada inicial para renderizar selects e tabela ao carregar a página
    renderAllSelects();
    renderVehiclesTable();

    // Lidar com a submissão do formulário de Cadastro de Veículos
    vehicleForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const currentKm = parseInt(document.getElementById('quilometragemAtual').value, 10) || 0;
        const currentHr = parseInt(document.getElementById('horimetroAtual').value, 10) || 0;
        const lastRevKm = parseInt(document.getElementById('quilometragemRevisao').value, 10) || 0;
        const lastRevHr = parseInt(document.getElementById('horimetroRevisao').value, 10) || 0;

        if (lastRevKm > currentKm) {
            showFeedback('Quilometragem da última revisão não pode ser maior que a quilometragem atual.', 'error');
            return;
        }
        if (lastRevHr > currentHr) {
            showFeedback('Horímetro da última revisão não pode ser maior que o horímetro atual.', 'error');
            return;
        }

        // --- Lógica para Marca (com ID e Nome) ---
        const rawMarcaValue = document.getElementById('marca').value;
        let selectedMarcaId;
        let selectedMarcaNome;

        // Try to find an existing brand by ID or name
        const existingBrandById = brands.find(b => b.id == rawMarcaValue); // Use == for comparison with string value from select
        const existingBrandByName = brands.find(b => b.nome.toLowerCase() === rawMarcaValue.toLowerCase());

        if (existingBrandById) {
            selectedMarcaId = existingBrandById.id;
            selectedMarcaNome = existingBrandById.nome;
        } else if (existingBrandByName) {
             selectedMarcaId = existingBrandByName.id;
             selectedMarcaNome = existingBrandByName.nome;
        } else {
            // It's a new brand typed (tag)
            selectedMarcaId = Date.now(); // Generate a new numeric ID for the new brand
            selectedMarcaNome = rawMarcaValue; // The name is what was typed

            // Add this new brand to bfmData if it doesn't exist
            let bfmDataTemp = getBFMFleetData();
            if (!bfmDataTemp.brands.some(b => b.nome.toLowerCase() === selectedMarcaNome.toLowerCase())) {
                bfmDataTemp.brands.push({ id: selectedMarcaId, nome: selectedMarcaNome });
                saveBFMFleetData(bfmDataTemp); // Save immediately so 'brands' is updated
                brands = bfmDataTemp.brands; // Update the local brands variable
            } else {
                // If it exists by name but not ID (e.g., re-typed), use the existing one's ID
                const existing = bfmDataTemp.brands.find(b => b.nome.toLowerCase() === selectedMarcaNome.toLowerCase());
                selectedMarcaId = existing.id;
            }
        }

        // --- Lógica para Modelo, Tipo Veículo, Combustível (salvando apenas o Nome) ---
        // The select value for these will be the tag name (string), according to createTag
        const selectedModeloNome = document.getElementById('modelo').value;
        const selectedTipoVeiculoNome = document.getElementById('tipoVeiculo').value;
        const selectedCombustivelNome = document.getElementById('combustivel').value;

        const newVehicle = {
            id: Date.now(),
            registrationDate: new Date().toISOString().slice(0, 10),
            Nome: document.getElementById('Nome').value,
            placa: document.getElementById('placa').value.toUpperCase(),
            chassi: document.getElementById('chassi').value.toUpperCase(),
            marcaId: selectedMarcaId, // ID da marca
            marca: selectedMarcaNome, // Nome da marca (para exibição na tabela)
            modelo: selectedModeloNome, // Nome do modelo
            anoFabricacao: document.getElementById('anoFabricacao').value,
            tipoVeiculo: selectedTipoVeiculoNome, // Nome do tipo de veículo
            combustivel: selectedCombustivelNome, // Nome do combustível
            cor: document.getElementById('cor').value,
            renavam: document.getElementById('renavam').value,
            quilometragemAtual: currentKm,
            horimetroAtual: currentHr,
            status: document.getElementById('status').value,
            ultimaRevisao: document.getElementById('ultimaRevisao').value,
            quilometragemRevisao: lastRevKm,
            horimetroRevisao: lastRevHr,
            hasPMP: document.getElementById('hasPMP').checked,
            hasPL: document.getElementById('hasPL').checked,
            documents: [],
        };

        const documentUploadInput = document.getElementById('documentUpload');
        if (documentUploadInput && documentUploadInput.files.length > 0) {
            Array.from(documentUploadInput.files).forEach(file => {
                newVehicle.documents.push(file.name);
            });
        }

        let bfmData = getBFMFleetData(); // Re-fetch to ensure latest data after potential brand addition

        bfmData.vehicles.push(newVehicle); // Adds the new vehicle

        // --- Add new tags (models, types, fuels) if they don't exist ---
        // Ensure they are stored as objects { id: Date.now(), nome: name }
        if (selectedModeloNome && !bfmData.models.some(m => m.nome.toLowerCase() === selectedModeloNome.toLowerCase())) {
            bfmData.models.push({ id: Date.now(), nome: selectedModeloNome });
        }
        if (selectedTipoVeiculoNome && !bfmData.customCompartmentTypes.some(t => t.nome.toLowerCase() === selectedTipoVeiculoNome.toLowerCase())) {
            bfmData.customCompartmentTypes.push({ id: Date.now(), nome: selectedTipoVeiculoNome });
        }
        if (selectedCombustivelNome && !bfmData.fuels.some(f => f.nome.toLowerCase() === selectedCombustivelNome.toLowerCase())) {
            bfmData.fuels.push({ id: Date.now(), nome: selectedCombustivelNome });
        }

        saveBFMFleetData(bfmData); // Saves all updated data

        // Update local variables to reflect saved data
        vehicles = bfmData.vehicles;
        brands = bfmData.brands;
        models = bfmData.models; // Update this local variable
        types = bfmData.customCompartmentTypes; // Update this local variable
        fuels = bfmData.fuels; // Update this local variable

        showFeedback('Veículo cadastrado com sucesso!', 'success');
        vehicleForm.reset();
        renderAllSelects();
        renderVehiclesTable();

        if (documentUploadInput) {
            documentUploadInput.value = '';
            const fileNameSpan = document.getElementById('file-name');
            if (fileNameSpan) fileNameSpan.textContent = 'Nenhum arquivo selecionado.';
        }
    });

    // Renderiza a Tabela de Veículos (ajustado para buscar nomes consistentemente)
    function renderVehiclesTable() {
        vehiclesTableBody.innerHTML = '';

        vehicles = getBFMFleetData().vehicles || []; // Ensures vehicles is updated
        brands = getBFMFleetData().brands || []; // Ensures brands is updated
        models = getBFMFleetData().models || [];
        types = getBFMFleetData().customCompartmentTypes || [];
        fuels = getBFMFleetData().fuels || [];

        if (vehicles.length === 0) {
            // Adjusted colspan to 15 to account for separated KM and HR Atual columns
            const row = vehiclesTableBody.insertRow();
            row.innerHTML = `<td colspan="15" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">Nenhum veículo cadastrado.</td>`;
            return;
        }

       vehicles.forEach(vehicle => {
    const row = vehiclesTableBody.insertRow();
  const documentCount = (vehicle.documents && vehicle.documents.length > 0) ? vehicle.documents.length : 0;

    const marcaNome = brands.find(b => b.id === vehicle.marcaId)?.nome || vehicle.marca || 'Desconhecida';
    const tipoVeiculoNome = types.find(t => t.nome === vehicle.tipoVeiculo)?.nome || vehicle.tipoVeiculo || 'Desconhecido';
    const modeloNome = models.find(m => m.nome === vehicle.modelo)?.nome || vehicle.modelo || 'Desconhecido';
    const combustivelNome = fuels.find(f => f.nome === vehicle.combustivel)?.nome || vehicle.combustivel || 'Desconhecido';
    const formattedUltimaRevisao = vehicle.ultimaRevisao || 'N/A'; // ✅ Adicionado para evitar erro

   


            row.innerHTML = `
    <td class="px-6 py-4 whitespace-nowrap">${formattedRegistrationDate || ''}</td>

    <td class="px-6 py-4 whitespace-nowrap">${vehicle.Nome || 'ID: ' + vehicle.id}</td>

    <td class="px-6 py-4 whitespace-nowrap">${vehicle.placa || ''}</td>

    <td class="px-6 py-4 whitespace-nowrap">${modeloNome || 'N/A'}</td>

    <td class="px-6 py-4 whitespace-nowrap">${marcaNome || 'N/A'}</td>

    <td class="px-6 py-4 whitespace-nowrap">${vehicle.anoFabricacao || ''}</td>

    <td class="px-6 py-4 whitespace-nowrap">${tipoVeiculoNome || 'N/A'}</td>

    <td class="px-6 py-4 whitespace-nowrap">${vehicle.quilometragemAtual || '0'} KM</td>

    <td class="px-6 py-4 whitespace-nowrap">${vehicle.horimetroAtual || '0'} HR</td>

    <td class="px-6 py-4 whitespace-nowrap">${vehicle.renavam || ''}</td>

    <td class="px-6 py-4 whitespace-nowrap">
        ${vehicle.hasPMP ? '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 mr-1">PMP</span>' : ''}
        ${vehicle.hasPL ? '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">PL</span>' : ''}
    </td>

    <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vehicle.status === 'ATIVO' ? 'bg-green-100 text-green-800' : vehicle.status === 'MANUTENÇÃO' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
            ${vehicle.status || ''}
        </span>
    </td>

    <td class="px-6 py-4 whitespace-nowrap">${formattedUltimaRevisao || 'N/A'}</td>

    <td class="px-6 py-4 whitespace-nowrap">${vehicle.quilometragemRevisao || 'N/A'} KM</td>

    <td class="px-6 py-4 whitespace-nowrap">${vehicle.horimetroRevisao || 'N/A'} HR</td>

    <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex flex-col items-start space-y-2">
            ${documentCount > 0 ? // Usando documentCount para verificar se há documentos
                `<button onclick="viewDocuments(${vehicle.id})" class="btn-info text-left">
                    <i class="ph ph-file-text"></i>
                    Doc. ${documentCount}
                </button>` :
                `<span class="text-gray-400 text-sm">0 Docs.</span>` // Exibe "0 Docs." se não houver documentos
            }
        </div>
    </td>

    <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex flex-col items-start space-y-2">
            <button onclick="openEditVehicleModal(${vehicle.id})" class="btn-edit text-left">
                <i class="ph ph-pencil"></i>
                Editar
            </button>
            <button onclick="deleteVehicle(${vehicle.id})" class="btn-delete text-left">
                <i class="ph ph-trash"></i>
                Excluir
            </button>
        </div>
    </td>
`;
            vehiclesTableBody.appendChild(row);
        });
    }

    // Modal de visualização de documentos (kept as is, ensure corresponding HTML is present)
    const viewDocumentsModal = document.getElementById('viewDocumentsModal');
    const viewDocumentsList = document.getElementById('viewDocumentsList');
    const closeViewDocumentsModal = document.getElementById('closeViewDocumentsModal');

    window.viewDocuments = function(vehicleId) {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (vehicle && vehicle.documents && vehicle.documents.length > 0) {
            viewDocumentsList.innerHTML = '';
            vehicle.documents.forEach(docName => {
                const li = document.createElement('li');
                li.className = 'flex items-center justify-between p-2 border-b border-gray-200 last:border-b-0';
                li.innerHTML = `
                    <span>${docName}</span>
                    <a href="#" class="text-blue-500 hover:text-blue-700" download="${docName}">
                        <i class="ph ph-download-simple"></i>
                    </a>
                `;
                viewDocumentsList.appendChild(li);
            });
            viewDocumentsModal.classList.add('active', 'flex');
            viewDocumentsModal.classList.remove('hidden');
        } else {
            showFeedback('Nenhum documento encontrado para este veículo.', 'info');
        }
    };

    if (closeViewDocumentsModal) {
        closeViewDocumentsModal.addEventListener('click', () => {
            viewDocumentsModal.classList.add('hidden');
            viewDocumentsModal.classList.remove('active', 'flex');
        });
    }

    window.openEditVehicleModal = function(id) {
        currentEditingVehicleId = id;
        const vehicleToEdit = vehicles.find(v => v.id === id);

        if (vehicleToEdit) {
            document.getElementById('edit-Nome').value = vehicleToEdit.Nome || '';
            document.getElementById('edit-placa').value = vehicleToEdit.placa;
            document.getElementById('edit-chassi').value = vehicleToEdit.chassi;
            document.getElementById('edit-anoFabricacao').value = vehicleToEdit.anoFabricacao;
            document.getElementById('edit-cor').value = vehicleToEdit.cor;
            document.getElementById('edit-renavam').value = vehicleToEdit.renavam;
            document.getElementById('edit-quilometragemAtual').value = vehicleToEdit.quilometragemAtual || '';
            document.getElementById('edit-horimetroAtual').value = vehicleToEdit.horimetroAtual || '';
            document.getElementById('edit-status').value = vehicleToEdit.status;
            document.getElementById('edit-ultimaRevisao').value = vehicleToEdit.ultimaRevisao;
            document.getElementById('edit-quilometragemRevisao').value = vehicleToEdit.quilometragemRevisao || '';
            document.getElementById('edit-horimetroRevisao').value = vehicleToEdit.horimetroRevisao || '';
            document.getElementById('edit-hasPMP').checked = vehicleToEdit.hasPMP;
            document.getElementById('edit-hasPL').checked = vehicleToEdit.hasPL;

            selectedEditDocuments = [...(vehicleToEdit.documents || [])];
            renderEditDocumentList(selectedEditDocuments);

            // Pass the ID of the brand for renderAllSelects
            renderAllSelects({
                ...vehicleToEdit,
                marcaId: vehicleToEdit.marcaId, // Pass the brand ID
                tipoVeiculo: vehicleToEdit.tipoVeiculo, // Pass the vehicle type ID/name
                modelo: vehicleToEdit.modelo, // Pass the model name
                combustivel: vehicleToEdit.combustivel // Pass the fuel name
            });

            editVehicleModal.classList.add('active', 'flex');
            editVehicleModal.classList.remove('hidden');
        } else {
            showFeedback('Veículo não encontrado para edição.', 'error');
        }
    };

    window.closeEditVehicleModal = function() {
        editVehicleModal.classList.remove('active', 'flex');
        editVehicleModal.classList.add('hidden');
        // Clear any previous feedback when closing the modal
        userFeedback.classList.add('hidden');
        userFeedback.classList.remove('show');
    };

    if (closeEditVehicleModalButton) { // Event listener for the explicit close button
        closeEditVehicleModalButton.addEventListener('click', window.closeEditVehicleModal);
    }

    // Close modal when clicking outside of it (for editVehicleModal)
    editVehicleModal.addEventListener('click', function(event) {
        if (event.target === editVehicleModal) {
            window.closeEditVehicleModal();
        }
    });

    function renderEditDocumentList(documentNames) {
        const editDocumentList = document.getElementById('edit-documentList');
        if (!editDocumentList) return; // Add check for element existence

        editDocumentList.innerHTML = '';
        if (documentNames.length === 0) {
            editDocumentList.innerHTML = '<p class="text-gray-500 text-sm">Nenhum documento anexado.</p>';
            return;
        }
        documentNames.forEach((docName, index) => {
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between p-2 border-b border-gray-200 last:border-b-0 text-sm';
            li.innerHTML = `
                <span>${docName}</span>
                <div class="flex items-center">
                    <button type="button" onclick="removeEditDocument(${index})" class="text-red-500 hover:text-red-700 ml-2 p-1 rounded-full hover:bg-red-100 transition-colors" title="Remover documento">
                        <i class="ph ph-x-circle text-lg"></i>
                    </button>
                </div>
            `;
            editDocumentList.appendChild(li);
        });
    }

    window.removeEditDocument = function(indexToRemove) {
        if (selectedEditDocuments.length > indexToRemove) {
            selectedEditDocuments.splice(indexToRemove, 1);
            renderEditDocumentList(selectedEditDocuments);
        }
    };

    document.getElementById('edit-documentUpload').addEventListener('change', function(event) {
        const files = event.target.files;
        if (files.length > 0) {
            Array.from(files).forEach(file => {
                // Check if file already exists by name to prevent duplicates
                if (!selectedEditDocuments.includes(file.name)) {
                    selectedEditDocuments.push(file.name);
                } else {
                    showFeedback(`O arquivo "${file.name}" já foi adicionado.`, 'warning');
                }
            });
            renderEditDocumentList(selectedEditDocuments);
            // Clear the input value so the same file can be selected again if needed
            event.target.value = '';
        }
    });

    editVehicleForm.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!currentEditingVehicleId) return;

        const vehicleIndex = vehicles.findIndex(v => v.id === currentEditingVehicleId);
        if (vehicleIndex > -1) {
            const currentKm = parseInt(document.getElementById('edit-quilometragemAtual').value, 10) || 0;
            const currentHr = parseInt(document.getElementById('edit-horimetroAtual').value, 10) || 0;
            const lastRevKm = parseInt(document.getElementById('edit-quilometragemRevisao').value, 10) || 0;
            const lastRevHr = parseInt(document.getElementById('edit-horimetroRevisao').value, 10) || 0;

            if (lastRevKm > currentKm) {
                showFeedback('Quilometragem da última revisão não pode ser maior que a quilometragem atual.', 'error');
                return;
            }
            if (lastRevHr > currentHr) {
                showFeedback('Horímetro da última revisão não pode ser maior que o horímetro atual.', 'error');
                return;
            }

            // --- Lógica para Marca (com ID e Nome) no modal de edição ---
            const rawEditedMarcaValue = document.getElementById('edit-marca').value;
            let editedMarcaId;
            let editedMarcaNome;

            const existingEditedBrandById = brands.find(b => b.id == rawEditedMarcaValue);
            const existingEditedBrandByName = brands.find(b => b.nome.toLowerCase() === rawEditedMarcaValue.toLowerCase());

            if (existingEditedBrandById) {
                editedMarcaId = existingEditedBrandById.id;
                editedMarcaNome = existingEditedBrandById.nome;
            } else if (existingEditedBrandByName) {
                 editedMarcaId = existingEditedBrandByName.id;
                 editedMarcaNome = existingEditedBrandByName.nome;
            } else {
                editedMarcaId = Date.now();
                editedMarcaNome = rawEditedMarcaValue;

                let bfmDataTemp = getBFMFleetData();
                if (!bfmDataTemp.brands.some(b => b.nome.toLowerCase() === editedMarcaNome.toLowerCase())) {
                    bfmDataTemp.brands.push({ id: editedMarcaId, nome: editedMarcaNome });
                    saveBFMFleetData(bfmDataTemp);
                    brands = bfmDataTemp.brands;
                } else {
                    const existing = bfmDataTemp.brands.find(b => b.nome.toLowerCase() === editedMarcaNome.toLowerCase());
                    editedMarcaId = existing.id;
                }
            }

            // --- Lógica para Modelo, Tipo Veículo, Combustível (nomes) no modal de edição ---
            const editedModeloNome = document.getElementById('edit-modelo').value;
            const editedTipoVeiculoNome = document.getElementById('edit-tipoVeiculo').value;
            const editedCombustivelNome = document.getElementById('edit-combustivel').value;

            // Update vehicle properties
            vehicles[vehicleIndex] = {
                ...vehicles[vehicleIndex],
                Nome: document.getElementById('edit-Nome').value,
                placa: document.getElementById('edit-placa').value.toUpperCase(),
                chassi: document.getElementById('edit-chassi').value.toUpperCase(),
                marcaId: editedMarcaId, // Stores the ID
                marca: editedMarcaNome, // Stores the name (for table display)
                modelo: editedModeloNome, // Model Name
                anoFabricacao: document.getElementById('edit-anoFabricacao').value,
                tipoVeiculo: editedTipoVeiculoNome, // Vehicle Type Name
                combustivel: editedCombustivelNome, // Fuel Name
                cor: document.getElementById('edit-cor').value,
                renavam: document.getElementById('edit-renavam').value,
                quilometragemAtual: currentKm,
                horimetroAtual: currentHr,
                status: document.getElementById('edit-status').value,
                ultimaRevisao: document.getElementById('edit-ultimaRevisao').value,
                quilometragemRevisao: lastRevKm,
                horimetroRevisao: lastRevHr,
                hasPMP: document.getElementById('edit-hasPMP').checked,
                hasPL: document.getElementById('edit-hasPL').checked,
                documents: selectedEditDocuments,
            };

            let bfmData = getBFMFleetData();
            bfmData.vehicles = vehicles; // Update the vehicles array in the data object

            // Add new brands/models/types/fuels if edited as "tags"
            // Ensure they are stored as objects { id: Date.now(), nome: name }
            if (editedModeloNome && !bfmData.models.some(m => m.nome.toLowerCase() === editedModeloNome.toLowerCase())) {
                bfmData.models.push({ id: Date.now(), nome: editedModeloNome });
            }
            if (editedTipoVeiculoNome && !bfmData.customCompartmentTypes.some(t => t.nome.toLowerCase() === editedTipoVeiculoNome.toLowerCase())) {
                bfmData.customCompartmentTypes.push({ id: Date.now(), nome: editedTipoVeiculoNome });
            }
            if (editedCombustivelNome && !bfmData.fuels.some(f => f.nome.toLowerCase() === editedCombustivelNome.toLowerCase())) {
                bfmData.fuels.push({ id: Date.now(), nome: editedCombustivelNome });
            }

            saveBFMFleetData(bfmData); // Save all updated data
            showFeedback('Veículo atualizado com sucesso!', 'success');
            renderVehiclesTable();
            closeEditVehicleModal();
        } else {
            showFeedback('Erro ao atualizar veículo.', 'error');
        }
    });

    window.deleteVehicle = function(id) {
        if (confirm('Tem certeza que deseja excluir este veículo? Esta ação é irreversível.')) {
            let bfmData = getBFMFleetData();
            bfmData.vehicles = bfmData.vehicles.filter(v => v.id !== id);
            saveBFMFleetData(bfmData); // Save updated data
            vehicles = bfmData.vehicles; // Update local variable
            renderVehiclesTable();
            showFeedback('Veículo excluído com sucesso!', 'info');
        }
    };

    // Modals for dynamic registration (Brand, Model, Type, Fuel)
    window.openRegisterModal = function(type) {
        currentRegisterType = type;
        let title = 'Novo Item';
        let placeholder = 'Digite o nome';
        if (type === 'marca') { title = 'Cadastrar Nova Marca'; placeholder = 'Digite o nome da Marca'; }
        else if (type === 'modelo') { title = 'Cadastrar Novo Modelo'; placeholder = 'Digite o nome do Modelo'; }
        else if (type === 'tipo') { title = 'Cadastrar Novo Tipo'; placeholder = 'Digite o nome do Tipo'; }
        else if (type === 'combustivel') { title = 'Cadastrar Novo Combustível'; placeholder = 'Digite o nome do Combustível'; }

        registerModalTitle.textContent = title;
        registerNameInput.placeholder = placeholder;
        registerNameInput.value = '';
        populateRegisterList(type);
        registerModal.classList.add('active', 'flex');
        registerModal.classList.remove('hidden');
    };

    // Close dynamic registration modal
    window.closeRegisterModal = function() {
        registerModal.classList.remove('active', 'flex');
        registerModal.classList.add('hidden');
        registerNameInput.value = '';
        // Clear feedback when closing the modal
        userFeedback.classList.add('hidden');
        userFeedback.classList.remove('show');
    };

    // Close register modal when clicking outside of it
    registerModal.addEventListener('click', function(event) {
        if (event.target === registerModal) {
            window.closeRegisterModal();
        }
    });

    // Add new item (brand, model, type, fuel)
    registerForm.addEventListener('submit', function(e) { // Changed to use registerForm directly
        e.preventDefault();
        const nome = registerNameInput.value.trim();

        if (!nome) {
            showFeedback('Por favor, insira um nome.', 'error');
            return;
        }

        let bfmData = getBFMFleetData();
        let currentArray = [];
        let itemExists = false;

        // Determine which array to update and check for duplicates
        if (currentRegisterType === 'marca') {
            currentArray = bfmData.brands;
            itemExists = currentArray.some(item => item.nome.toLowerCase() === nome.toLowerCase());
        } else if (currentRegisterType === 'modelo') {
            currentArray = bfmData.models;
            itemExists = currentArray.some(item => item.nome.toLowerCase() === nome.toLowerCase());
        } else if (currentRegisterType === 'tipo') {
            currentArray = bfmData.customCompartmentTypes;
            itemExists = currentArray.some(item => item.nome.toLowerCase() === nome.toLowerCase());
        } else if (currentRegisterType === 'combustivel') {
            currentArray = bfmData.fuels;
            itemExists = currentArray.some(item => item.nome.toLowerCase() === nome.toLowerCase());
        }

        if (itemExists) {
            showFeedback(`${nome} já está cadastrado como ${currentRegisterType}.`, 'warning');
            return;
        }

        // Adiciona o novo item com um ID único
        const newItem = { id: Date.now(), nome: nome };
        currentArray.push(newItem);

        // Atualiza a propriedade correspondente no objeto bfmData
        if (currentRegisterType === 'marca') {
            bfmData.brands = currentArray;
        } else if (currentRegisterType === 'modelo') {
            bfmData.models = currentArray;
        } else if (currentRegisterType === 'tipo') {
            bfmData.customCompartmentTypes = currentArray;
        } else if (currentRegisterType === 'combustivel') {
            bfmData.fuels = currentArray;
        }

        saveBFMFleetData(bfmData); // Salva os dados atualizados
        showFeedback(`${nome} adicionado com sucesso!`, 'success');
        registerNameInput.value = ''; // Limpa o input
        populateRegisterList(currentRegisterType); // Recarrega a lista no modal
        renderAllSelects(); // Recarrega os Select2 nos formulários principais
    });

    // Função para popular a lista de itens no modal de registro dinâmico
    function populateRegisterList(type) {
        let itemsArray = [];
        const bfmData = getBFMFleetData();

        if (type === 'marca') {
            itemsArray = bfmData.brands;
        } else if (type === 'modelo') {
            itemsArray = bfmData.models;
        } else if (type === 'tipo') {
            itemsArray = bfmData.customCompartmentTypes; // Adjusted
        } else if (type === 'combustivel') {
            itemsArray = bfmData.fuels;
        }

        registerList.innerHTML = ''; // Limpa a lista existente

        if (itemsArray.length === 0) {
            registerList.innerHTML = '<p class="text-gray-500">Nenhum item cadastrado.</p>';
            return;
        }

        itemsArray.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'flex items-center justify-between p-2 hover:bg-gray-50 rounded-md';
            listItem.innerHTML = `
                <span>${item.nome}</span>
                <button type="button" onclick="deleteRegisterItem('${type}', ${item.id})" class="text-red-500 hover:text-red-700 ml-2">
                    <i class="ph ph-trash"></i>
                </button>
            `;
            registerList.appendChild(listItem);
        });
    }

    // Função para deletar item do registro dinâmico (marca, modelo, tipo, combustível)
    window.deleteRegisterItem = function(type, idToDelete) {
        let bfmData = getBFMFleetData();
        let currentArray;
        let relatedVehiclesExist = false;
        let itemName = '';

        if (type === 'marca') {
            currentArray = bfmData.brands;
            const marca = currentArray.find(item => item.id === idToDelete);
            itemName = marca ? marca.nome : 'Marca desconhecida';
            relatedVehiclesExist = bfmData.vehicles.some(v => v.marcaId === idToDelete);
        } else if (type === 'modelo') {
            currentArray = bfmData.models;
            const modelo = currentArray.find(item => item.id === idToDelete);
            itemName = modelo ? modelo.nome : 'Modelo desconhecido';
            relatedVehiclesExist = bfmData.vehicles.some(v => v.modelo === modelo?.nome);
        } else if (type === 'tipo') {
            currentArray = bfmData.customCompartmentTypes; // Adjusted
            const tipo = currentArray.find(item => item.id === idToDelete);
            itemName = tipo ? tipo.nome : 'Tipo desconhecido';
            relatedVehiclesExist = bfmData.vehicles.some(v => v.tipoVeiculo === tipo?.nome);
        } else if (type === 'combustivel') {
            currentArray = bfmData.fuels;
            const combustivel = currentArray.find(item => item.id === idToDelete);
            itemName = combustivel ? combustivel.nome : 'Combustível desconhecido';
            relatedVehiclesExist = bfmData.vehicles.some(v => v.combustivel === combustivel?.nome);
        }

        if (relatedVehiclesExist) {
            showFeedback(`Não é possível excluir "${itemName}" porque está sendo utilizado por um ou mais veículos.`, 'error');
            return;
        }

        if (confirm(`Tem certeza que deseja excluir "${itemName}"?`)) {
            const updatedArray = currentArray.filter(item => item.id !== idToDelete);

            if (type === 'marca') {
                bfmData.brands = updatedArray;
            } else if (type === 'modelo') {
                bfmData.models = updatedArray;
            } else if (type === 'tipo') {
                bfmData.customCompartmentTypes = updatedArray;
            }
            else if (type === 'combustivel') {
                bfmData.fuels = updatedArray;
            }

            saveBFMFleetData(bfmData); // Salva os dados atualizados
            showFeedback(`${itemName} excluído com sucesso!`, 'info');
            populateRegisterList(type); // Recarrega a lista no modal
            renderAllSelects(); // Recarrega os Select2 nos formulários principais
        }
    };
});