$(document).ready(function() {
    // --- Lógica do Cabeçalho (Dropdowns e Submenus) ---

    // Função para fechar todos os dropdowns abertos
    function closeAllDropdowns() {
        $('.dropdown-content').addClass('hidden');
        $('.dropdown button[aria-expanded="true"]').attr('aria-expanded', 'false');
        $('.submenu-content').addClass('hidden');
        $('.submenu-trigger[aria-expanded="true"]').attr('aria-expanded', 'false');
    }

    // Gerenciar dropdowns principais (Configurações, Plano de Manutenção, Ordem de Serviço, Gerenciamento, Alertas)
    $('.dropdown > button').on('click', function(event) {
        const $thisButton = $(this);
        const $dropdownContent = $thisButton.next('.dropdown-content');
        const isExpanded = $thisButton.attr('aria-expanded') === 'true';

        closeAllDropdowns(); // Fecha todos os outros dropdowns

        if (!isExpanded) {
            $dropdownContent.removeClass('hidden');
            $thisButton.attr('aria-expanded', 'true');
        } else {
            $dropdownContent.addClass('hidden');
            $thisButton.attr('aria-expanded', 'false');
        }
        event.stopPropagation(); // Impede que o clique se propague para o document e feche imediatamente
    });

    // Gerenciar submenus (Veículos, Serviços, Oficina, Cadastro de Produtos)
    $('.submenu-trigger').on('click', function(event) {
        const $thisButton = $(this);
        const $submenuContent = $thisButton.next('.submenu-content');
        const isExpanded = $thisButton.attr('aria-expanded') === 'true';

        // Fecha apenas outros submenus no mesmo nível, mas mantém o dropdown pai aberto
        $(this).closest('.dropdown-content').find('.submenu-content').not($submenuContent).addClass('hidden');
        $(this).closest('.dropdown-content').find('.submenu-trigger').not($thisButton).attr('aria-expanded', 'false');

        if (!isExpanded) {
            $submenuContent.removeClass('hidden');
            $thisButton.attr('aria-expanded', 'true');
        } else {
            $submenuContent.addClass('hidden');
            $thisButton.attr('aria-expanded', 'false');
        }
        event.stopPropagation(); // Impede que o clique se propague para o dropdown pai ou document
    });

    // Fechar dropdowns/submenus quando clicar fora
    $(document).on('click', function(event) {
        if (!$(event.target).closest('.dropdown').length) {
            closeAllDropdowns();
        }
    });

    // --- Lógica do Formulário de Inspeção ---

    // Inicializa Select2 para o campo de veículo
    $('#vehicleSelect').select2({
        placeholder: "Selecione um veículo",
        allowClear: true,
        width: '100%', // Garante que o Select2 use a largura total do elemento pai
        data: [] // Inicialmente vazio, preenchido por fetchVehicles
    });

    // Função para exibir feedback ao usuário
    function showFeedback(message, type = 'success') {
        const $feedbackDiv = $('#userFeedback');
        $feedbackDiv.removeClass('hidden success error').text(message);
        if (type === 'success') {
            $feedbackDiv.addClass('bg-green-100 border border-green-400 text-green-700');
        } else if (type === 'error') {
            $feedbackDiv.addClass('bg-red-100 border border-red-400 text-red-700');
        }
        $feedbackDiv.fadeIn().delay(3000).fadeOut(); // Mostra, espera 3s, depois esconde
    }

    // Função para carregar veículos (simulação, substituir por chamada AJAX real)
    function fetchVehicles() {
        // Simulação de dados de veículos
        const vehicles = [
            { id: '1', text: 'ABC-1234 - Fiat Strada' },
            { id: '2', text: 'XYZ-5678 - Ford Ranger' },
            { id: '3', text: 'DEF-9012 - VW Amarok' }
        ];
        // Adiciona os veículos ao Select2
        $('#vehicleSelect').select2('destroy').empty().select2({
            placeholder: "Selecione um veículo",
            allowClear: true,
            width: '100%',
            data: vehicles
        });
        // Se houver um veículo selecionado salvo, garanta que ele seja selecionado após o carregamento
        const savedVehicleId = localStorage.getItem('lastSelectedVehicleId');
        if (savedVehicleId) {
            $('#vehicleSelect').val(savedVehicleId).trigger('change');
        }
    }

    // Carregar veículos ao iniciar
    fetchVehicles();

    // Adiciona evento para o botão de observação
    $('.add-obs-btn').on('click', function() {
        const targetId = $(this).data('target');
        $(`#${targetId}`).toggleClass('hidden');
    });

    // Lida com o envio do formulário
    $('#inspectionForm').on('submit', function(e) {
        e.preventDefault(); // Impede o envio padrão do formulário

        const formData = {
            id: Date.now(), // ID único para a inspeção
            inspectionDate: $('#inspectionDate').val(),
            vehicle: $('#vehicleSelect').val() ? $('#vehicleSelect').find(':selected').text() : '', // Pega o texto do Select2
            inspectionType: $('#inspectionType').val(),
            inspectorName: $('#inspectorName').val(),
            odometerReading: $('#odometerReading').val(),
            hourmeterReading: $('#hourmeterReading').val(),
            inspectionOverallStatus: $('#inspectionOverallStatus').val(),
            docVehicleStatus: $('#docVehicleStatus').val(),
            docVehicleNotes: $('textarea[name="docVehicleNotes"]').val(),
            vehicleIdStatus: $('#vehicleIdStatus').val(),
            vehicleIdNotes: $('textarea[name="vehicleIdNotes"]').val(),
            triangle: $('input[name="triangle"]:checked').val(),
            reflectiveVest: $('input[name="reflectiveVest"]:checked').val(),
            extinguisher: $('input[name="extinguisher"]:checked').val(),
            jackWheelWrench: $('input[name="jackWheelWrench"]:checked').val(),
            equipNotes: $('textarea[name="equipNotes"]').val(),
            headlights: $('input[name="headlights"]:checked').val(),
            brakeLights: $('input[name="brakeLights"]:checked').val(),
            mirrors: $('input[name="mirrors"]:checked').val(),
            lightingNotes: $('textarea[name="lightingNotes"]').val(),
            tireCondition: $('input[name="tireCondition"]:checked').val(),
            tireNotes: $('textarea[name="tireNotes"]').val(),
            brakePerformance: $('input[name="brakePerformance"]:checked').val(),
            // Adicione aqui todos os outros campos de rádio e observações conforme o HTML
        };

        // Validação básica
        if (!formData.inspectionDate || !formData.vehicle || !formData.inspectionType || !formData.inspectorName || !formData.inspectionOverallStatus ||
            !formData.docVehicleStatus || !formData.vehicleIdStatus || !formData.triangle || !formData.reflectiveVest || !formData.extinguisher ||
            !formData.jackWheelWrench || !formData.headlights || !formData.brakeLights || !formData.mirrors || !formData.tireCondition ||
            !formData.brakePerformance) {
            showFeedback('Por favor, preencha todos os campos obrigatórios (marcados com *).', 'error');
            return;
        }

        // Salvar no Local Storage
        let inspections = JSON.parse(localStorage.getItem('inspections')) || [];
        inspections.push(formData);
        localStorage.setItem('inspections', JSON.stringify(inspections));

        // Adicionar à tabela
        addInspectionToTable(formData);

        // Feedback e reset do formulário
        showFeedback('Inspeção registrada com sucesso!');
        $('#inspectionForm')[0].reset();
        $('#vehicleSelect').val(null).trigger('change'); // Reseta o Select2
        $('.observation-area').addClass('hidden').find('textarea').val(''); // Esconde e limpa observações
        $('.add-obs-btn').removeClass('active'); // Remove estado ativo dos botões de obs
    });

    // --- Lógica da Tabela de Inspeções ---

    const $inspectionsTableBody = $('#inspectionsTableBody');

    function addInspectionToTable(inspection) {
        const row = `
            <tr id="inspection-${inspection.id}" class="hover:bg-gray-50 border-b border-gray-200">
                <td class="py-2 px-4 text-sm text-gray-700">${inspection.inspectionDate}</td>
                <td class="py-2 px-4 text-sm text-gray-700">${inspection.vehicle}</td>
                <td class="py-2 px-4 text-sm text-gray-700">${inspection.inspectorName}</td>
                <td class="py-2 px-4 text-sm text-gray-700">${inspection.odometerReading}</td>
                <td class="py-2 px-4 text-sm text-gray-700">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        inspection.inspectionOverallStatus === 'APROVADO' ? 'bg-green-100 text-green-800' :
                        inspection.inspectionOverallStatus === 'REPROVADO' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }">
                        ${inspection.inspectionOverallStatus}
                    </span>
                </td>
                <td class="py-2 px-4 text-sm text-gray-700">
                    <button class="view-details-btn text-blue-600 hover:text-blue-800 mr-2" data-id="${inspection.id}">
                        Detalhes
                    </button>
                    <button class="edit-inspection-btn text-yellow-600 hover:text-yellow-800 mr-2" data-id="${inspection.id}">
                        Editar
                    </button>
                    <button class="delete-inspection-btn text-red-600 hover:text-red-800" data-id="${inspection.id}">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
        $inspectionsTableBody.append(row);
    }

    // Carregar inspeções salvas ao carregar a página
    function loadInspections() {
        const inspections = JSON.parse(localStorage.getItem('inspections')) || [];
        $inspectionsTableBody.empty(); // Limpa a tabela antes de carregar
        inspections.forEach(inspection => addInspectionToTable(inspection));
    }

    loadInspections(); // Chama para carregar ao iniciar a página

    // Lógica para exclusão de inspeção
    $inspectionsTableBody.on('click', '.delete-inspection-btn', function() {
        const idToDelete = $(this).data('id');
        if (confirm('Tem certeza que deseja excluir esta inspeção?')) {
            let inspections = JSON.parse(localStorage.getItem('inspections')) || [];
            inspections = inspections.filter(inspection => inspection.id !== idToDelete);
            localStorage.setItem('inspections', JSON.stringify(inspections));
            $(`#inspection-${idToDelete}`).remove(); // Remove a linha da tabela
            showFeedback('Inspeção excluída com sucesso.', 'success');
        }
    });

    // Lógica para visualizar detalhes (exemplo: pode abrir um modal)
    $inspectionsTableBody.on('click', '.view-details-btn', function() {
        const idToView = $(this).data('id');
        const inspections = JSON.parse(localStorage.getItem('inspections')) || [];
        const inspection = inspections.find(i => i.id === idToView);

        if (inspection) {
            // Exemplo simples: alerta com detalhes. Para uma UI melhor, use um modal.
            let details = `Detalhes da Inspeção #${inspection.id}\n\n`;
            for (const key in inspection) {
                if (inspection.hasOwnProperty(key)) {
                    details += `${key}: ${inspection[key]}\n`;
                }
            }
            alert(details);
            // Em um ambiente real, você preencheria um modal com estes dados
        } else {
            showFeedback('Inspeção não encontrada.', 'error');
        }
    });

    // Lógica para editar inspeção (aqui você carregaria o formulário com os dados)
    $inspectionsTableBody.on('click', '.edit-inspection-btn', function() {
        const idToEdit = $(this).data('id');
        const inspections = JSON.parse(localStorage.getItem('inspections')) || [];
        const inspection = inspections.find(i => i.id === idToEdit);

        if (inspection) {
            // Preenche o formulário com os dados da inspeção para edição
            $('#inspectionDate').val(inspection.inspectionDate);
            $('#vehicleSelect').val(inspection.vehicle ? inspection.vehicle.split(' - ')[0] : '').trigger('change'); // Assume que 'vehicle' é 'ID - Texto'
            $('#inspectionType').val(inspection.inspectionType);
            $('#inspectorName').val(inspection.inspectorName);
            $('#odometerReading').val(inspection.odometerReading);
            $('#hourmeterReading').val(inspection.hourmeterReading);
            $('#inspectionOverallStatus').val(inspection.inspectionOverallStatus);

            // Preenche e mostra campos de status e observações
            $('#docVehicleStatus').val(inspection.docVehicleStatus);
            $('textarea[name="docVehicleNotes"]').val(inspection.docVehicleNotes || '');
            if (inspection.docVehicleNotes) $('#docVehicleObs').removeClass('hidden');

            $('#vehicleIdStatus').val(inspection.vehicleIdStatus);
            $('textarea[name="vehicleIdNotes"]').val(inspection.vehicleIdNotes || '');
            if (inspection.vehicleIdNotes) $('#vehicleIdObs').removeClass('hidden');

            // Preenche os rádios para equipamentos
            $('input[name="triangle"][value="' + inspection.triangle + '"]').prop('checked', true);
            $('input[name="reflectiveVest"][value="' + inspection.reflectiveVest + '"]').prop('checked', true);
            $('input[name="extinguisher"][value="' + inspection.extinguisher + '"]').prop('checked', true);
            $('input[name="jackWheelWrench"][value="' + inspection.jackWheelWrench + '"]').prop('checked', true);
            $('textarea[name="equipNotes"]').val(inspection.equipNotes || '');
            if (inspection.equipNotes) $('#equipObs').removeClass('hidden');

            // Preenche os rádios para iluminação
            $('input[name="headlights"][value="' + inspection.headlights + '"]').prop('checked', true);
            $('input[name="brakeLights"][value="' + inspection.brakeLights + '"]').prop('checked', true);
            $('input[name="mirrors"][value="' + inspection.mirrors + '"]').prop('checked', true);
            $('textarea[name="lightingNotes"]').val(inspection.lightingNotes || '');
            if (inspection.lightingNotes) $('#lightingObs').removeClass('hidden');

            // Preenche os rádios para pneus
            $('input[name="tireCondition"][value="' + inspection.tireCondition + '"]').prop('checked', true);
            $('textarea[name="tireNotes"]').val(inspection.tireNotes || '');
            if (inspection.tireNotes) $('#tireObs').removeClass('hidden');

            // Preenche os rádios para freios
            $('input[name="brakePerformance"][value="' + inspection.brakePerformance + '"]').prop('checked', true);
            // ... (continuar para todos os campos)

            // Mudar o botão de submit para "Atualizar" e adicionar lógica de atualização
            $('#inspectionForm button[type="submit"]').text('Atualizar Inspeção').off('click').on('click', function(e) {
                e.preventDefault();
                // Lógica de atualização aqui
                let inspections = JSON.parse(localStorage.getItem('inspections')) || [];
                const updatedInspections = inspections.map(item => {
                    if (item.id === idToEdit) {
                        return {
                            id: idToEdit, // Mantém o mesmo ID
                            inspectionDate: $('#inspectionDate').val(),
                            vehicle: $('#vehicleSelect').val() ? $('#vehicleSelect').find(':selected').text() : '',
                            inspectionType: $('#inspectionType').val(),
                            inspectorName: $('#inspectorName').val(),
                            odometerReading: $('#odometerReading').val(),
                            hourmeterReading: $('#hourmeterReading').val(),
                            inspectionOverallStatus: $('#inspectionOverallStatus').val(),
                            docVehicleStatus: $('#docVehicleStatus').val(),
                            docVehicleNotes: $('textarea[name="docVehicleNotes"]').val(),
                            vehicleIdStatus: $('#vehicleIdStatus').val(),
                            vehicleIdNotes: $('textarea[name="vehicleIdNotes"]').val(),
                            triangle: $('input[name="triangle"]:checked').val(),
                            reflectiveVest: $('input[name="reflectiveVest"]:checked').val(),
                            extinguisher: $('input[name="extinguisher"]:checked').val(),
                            jackWheelWrench: $('input[name="jackWheelWrench"]:checked').val(),
                            equipNotes: $('textarea[name="equipNotes"]').val(),
                            headlights: $('input[name="headlights"]:checked').val(),
                            brakeLights: $('input[name="brakeLights"]:checked').val(),
                            mirrors: $('input[name="mirrors"]:checked').val(),
                            lightingNotes: $('textarea[name="lightingNotes"]').val(),
                            tireCondition: $('input[name="tireCondition"]:checked').val(),
                            tireNotes: $('textarea[name="tireNotes"]').val(),
                            brakePerformance: $('input[name="brakePerformance"]:checked').val(),
                            // ... (adicione todos os campos aqui)
                        };
                    }
                    return item;
                });
                localStorage.setItem('inspections', JSON.stringify(updatedInspections));
                loadInspections(); // Recarrega a tabela para mostrar as alterações
                showFeedback('Inspeção atualizada com sucesso!', 'success');
                $('#inspectionForm')[0].reset();
                $('#vehicleSelect').val(null).trigger('change');
                $('.observation-area').addClass('hidden').find('textarea').val('');
                $('#inspectionForm button[type="submit"]').text('Registrar Inspeção').off('click').on('click', function(e){$('#inspectionForm').trigger('submit', e);}); // Restaura o comportamento de submissão
            });
        } else {
            showFeedback('Inspeção não encontrada para edição.', 'error');
        }
    });

    // Função dummy para logout (substituir por lógica real)
    window.logout = function() {
        alert('Fazendo logout...');
        // Redirecionar para a página de login ou limpar sessão
        // window.location.href = 'login.html';
    };

    // --- Lógica de Alertas (Exemplo) ---
    const $alertBellButton = $('#alertBellButton');
    const $alertCount = $('#alertCount');
    const $alertDropdown = $('#alertDropdown');
    const $alertList = $('#alertList');

    let alerts = []; // Array para armazenar alertas

    function updateAlertCount() {
        if (alerts.length > 0) {
            $alertCount.text(alerts.length).show();
        } else {
            $alertCount.hide();
        }
    }

    function renderAlerts() {
        $alertList.empty();
        if (alerts.length === 0) {
            $alertList.append('<p class="text-sm text-gray-500">Nenhum alerta no momento.</p>');
        } else {
            alerts.forEach((alert, index) => {
                $alertList.append(`
                    <div class="p-2 border-b last:border-b-0 border-gray-100 flex justify-between items-center">
                        <span class="text-gray-800 text-sm">${alert.message}</span>
                        <button class="text-red-500 hover:text-red-700 text-xs ml-2 dismiss-alert" data-index="${index}">Ignorar</button>
                    </div>
                `);
            });
        }
        updateAlertCount();
    }

    // Exemplo: Adicionar um alerta (você pode chamar isso de outras partes do seu sistema)
    function addAlert(message) {
        alerts.push({ message: message, timestamp: Date.now() });
        renderAlerts();
    }

    // Adiciona alguns alertas de exemplo ao carregar
    addAlert('Manutenção preventiva para ABC-1234 em 5 dias!');
    addAlert('Nível de óleo baixo no veículo XYZ-5678.');

    // Evento para abrir/fechar o dropdown de alertas
    $alertBellButton.on('click', function(event) {
        $alertDropdown.toggleClass('hidden');
        event.stopPropagation(); // Impede que o clique se propague para o document
    });

    // Evento para descartar alertas
    $alertDropdown.on('click', '.dismiss-alert', function() {
        const indexToDismiss = $(this).data('index');
        alerts.splice(indexToDismiss, 1); // Remove o alerta do array
        renderAlerts(); // Atualiza a exibição dos alertas
        showFeedback('Alerta descartado.', 'success');
    });

    // Fecha o dropdown de alertas se clicar fora
    $(document).on('click', function(event) {
        if (!$alertDropdown.is(event.target) && $alertDropdown.has(event.target).length === 0 &&
            !$alertBellButton.is(event.target) && $alertBellButton.has(event.target).length === 0) {
            $alertDropdown.addClass('hidden');
        }
    });

});