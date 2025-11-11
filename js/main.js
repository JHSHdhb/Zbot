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
            dropdown.addEventListener('mouseenter', openDropdown);
            dropdown.addEventListener('mouseleave', closeDropdown);
            toggle.addEventListener('focus', openDropdown);
            dropdown.addEventListener('focusout', (event) => {
                if (!dropdown.contains(event.relatedTarget)) {
                    closeDropdown();
                }
            });
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
