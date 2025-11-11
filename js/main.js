const setupNav = () => {
    const navToggle = document.getElementById('navToggle');
    const primaryNav = document.getElementById('primaryNav');
    const dropdown = document.querySelector('[data-dropdown]');

    if (navToggle && primaryNav) {
        navToggle.addEventListener('click', () => {
            const open = primaryNav.classList.toggle('is-open');
            navToggle.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
        });

        document.addEventListener('click', (event) => {
            if (!primaryNav.contains(event.target) && !navToggle.contains(event.target)) {
                primaryNav.classList.remove('is-open');
                navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            }
        }, true);

        document.querySelectorAll('.nav-links a, .dropdown-menu a').forEach(link => {
            link.addEventListener('click', () => {
                primaryNav.classList.remove('is-open');
                navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            });
        });
    }

    if (dropdown) {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        const supportsHover = window.matchMedia('(hover: hover)').matches;

        const openDropdown = () => {
            dropdown.classList.add('is-open');
            toggle.setAttribute('aria-expanded', 'true');
        };

        const closeDropdown = () => {
            dropdown.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        };

        if (supportsHover) {
            let hoverTimer;

            const scheduleClose = () => {
                clearTimeout(hoverTimer);
                hoverTimer = setTimeout(closeDropdown, 200); // 200ms 容错
            };
            const cancelClose = () => clearTimeout(hoverTimer);

            dropdown.addEventListener('mouseenter', () => {
                cancelClose();
                openDropdown();
            });

            dropdown.addEventListener('mouseleave', scheduleClose);

            // 键盘可达性
            toggle.addEventListener('focus', () => {
                cancelClose();
                openDropdown();
            });
            dropdown.addEventListener('focusout', (event) => {
                if (!dropdown.contains(event.relatedTarget)) scheduleClose();
            });

            // 鼠标滑到菜单时不关闭
            const menu = dropdown.querySelector('.dropdown-menu');
            menu.addEventListener('mouseenter', cancelClose);
            menu.addEventListener('mouseleave', scheduleClose);
        }


        toggle.addEventListener('click', (event) => {
            if (!supportsHover) {
                event.preventDefault();
                const willOpen = !dropdown.classList.contains('is-open');
                dropdown.classList.toggle('is-open', willOpen);
                toggle.setAttribute('aria-expanded', willOpen.toString());
            }
        });

        menu.addEventListener('click', closeDropdown);

        document.addEventListener('click', (event) => {
            if (!dropdown.contains(event.target) && !toggle.contains(event.target)) {
                closeDropdown();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeDropdown();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', setupNav);
