document.addEventListener('DOMContentLoaded', function() {
    window.logout = function() {
        alert('Você foi desconectado!');
        // window.location.href = 'login.html';
    };
});
// --- Script para Dropdowns do Header ---
document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('button[aria-haspopup="true"]');
        const dropdownContent = dropdown.querySelector('.dropdown-content');

        if (button && dropdownContent) {
            button.addEventListener('click', function(event) {
                event.stopPropagation(); // Previna que o clique no documento feche imediatamente
                // Feche outros dropdowns principais abertos
                dropdowns.forEach(otherDropdown => {
                    const otherDropdownContent = otherDropdown.querySelector('.dropdown-content');
                    const otherButton = otherDropdown.querySelector('button[aria-haspopup="true"]');
                    if (otherDropdown !== dropdown && otherDropdownContent && !otherDropdownContent.classList.contains('hidden')) {
                        otherDropdownContent.classList.add('hidden');
                        otherDropdownContent.classList.remove('animate-fade-in-down'); // O menu principal usa fadeInDown
                        if (otherButton) {
                            otherButton.setAttribute('aria-expanded', 'false');
                        }
                    }
                });

                // Alternar o dropdown principal atual
                dropdownContent.classList.toggle('hidden');
                dropdownContent.classList.toggle('animate-fade-in-down'); // O menu principal usa fadeInDown
                button.setAttribute('aria-expanded', dropdownContent.classList.contains('hidden') ? 'false' : 'true');

                // Feche quaisquer submenus abertos dentro deste dropdown principal quando seu menu principal for alternado
                const openSubmenus = dropdownContent.querySelectorAll('.submenu-content:not(.hidden)');
                openSubmenus.forEach(submenu => {
                    submenu.classList.add('hidden');
                    submenu.classList.remove('animate-fade-in-right'); // O submenu usa fadeInRight
                    const submenuTrigger = submenu.previousElementSibling;
                    if (submenuTrigger && submenuTrigger.hasAttribute('aria-expanded')) {
                        submenuTrigger.setAttribute('aria-expanded', 'false');
                    }
                });
            });

            // Previna que cliques dentro do dropdown o fechem
            dropdownContent.addEventListener('click', function(event) {
                event.stopPropagation();
            });
        }
    });

    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', function(event) {
        dropdowns.forEach(dropdown => {
            const dropdownContent = dropdown.querySelector('.dropdown-content');
            const button = dropdown.querySelector('button[aria-haspopup="true]');
            // Verifique se o clique foi fora do botão e do conteúdo do dropdown
            if (dropdownContent && button && !dropdown.contains(event.target)) {
                dropdownContent.classList.add('hidden');
                dropdownContent.classList.remove('animate-fade-in-down'); // O menu principal usa fadeInDown
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
                event.stopPropagation(); // Previna o fechamento do dropdown pai

                // Feche outros submenus abertos dentro do mesmo dropdown pai
                const parentDropdownContent = trigger.closest('.dropdown-content');
                if (parentDropdownContent) {
                    const otherSubmenus = parentDropdownContent.querySelectorAll('.submenu-content:not(.hidden)');
                    otherSubmenus.forEach(otherSubmenu => {
                        const otherTrigger = otherSubmenu.previousElementSibling;
                        if (otherSubmenu !== submenuContent && otherTrigger) {
                            otherSubmenu.classList.add('hidden');
                            otherSubmenu.classList.remove('animate-fade-in-right'); // O submenu usa fadeInRight
                            otherTrigger.setAttribute('aria-expanded', 'false');
                        }
                    });
                }

                // Alternar o submenu atual
                submenuContent.classList.toggle('hidden');
                submenuContent.classList.toggle('animate-fade-in-right'); // O submenu usa fadeInRight
                trigger.setAttribute('aria-expanded', submenuContent.classList.contains('hidden') ? 'false' : 'true');
            });

            // Previna cliques dentro do submenu de fechá-lo
            submenuContent.addEventListener('click', function(event) {
                event.stopPropagation();
            });
        }
    });

    // Lógica do botão de sino de alerta
    const alertBellButton = document.getElementById('alertBellButton');
    const alertDropdown = document.getElementById('alertDropdown');
    if (alertBellButton && alertDropdown) {
        alertBellButton.addEventListener('click', function(event) {
            event.stopPropagation(); // Impede que este clique suba para o documento
            alertDropdown.classList.toggle('hidden');
            alertDropdown.classList.toggle('animate-fade-in-down'); // Este provavelmente ainda abre para baixo
            alertBellButton.setAttribute('aria-expanded', alertDropdown.classList.contains('hidden') ? 'false' : 'true');
        });

        alertDropdown.addEventListener('click', function(event) {
            event.stopPropagation(); // Impede que cliques dentro do dropdown o fechem
        });
    }
});

function logout() {
    localStorage.removeItem('logado');
    window.location.replace('login.html');
}