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

const setupWeChatQrModal = () => {
    const modalId = 'wechatQrModal';
    if (document.getElementById(modalId)) return;

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'wechat-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'wechatQrModalTitle');
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
        <div class="wechat-modal__backdrop" data-wechat-qr-close></div>
        <div class="wechat-modal__panel" role="document">
            <button type="button" class="wechat-modal__close" aria-label="关闭" data-wechat-qr-close>
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="wechat-modal__content">
                <div class="wechat-modal__header">
                    <i class="fa-brands fa-weixin wechat-modal__icon" aria-hidden="true"></i>
                    <h2 class="wechat-modal__title" id="wechatQrModalTitle">微信</h2>
                </div>
                <p class="wechat-modal__desc">添加企业顾问微信，备注“公司+职位”，即可加入行业交流群，获取实时动态。</p>
	                <img src="media/wechat.jpg" alt="企业微信二维码" class="wechat-modal__qr" loading="lazy" decoding="async"/>
                <p class="wechat-modal__cta">扫码添加企业微信</p>
            </div>
        </div>
    `.trim();

    document.body.appendChild(modal);

    let lastFocused = null;

    const openModal = () => {
        if (modal.classList.contains('is-open')) return;
        lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('is-modal-open');
        modal.querySelector('.wechat-modal__close')?.focus?.();
    };

    const closeModal = () => {
        if (!modal.classList.contains('is-open')) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('is-modal-open');
        lastFocused?.focus?.();
    };

    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('.wechat-qr-trigger');
        if (!trigger) return;
        event.preventDefault();
        openModal();
    });

    modal.addEventListener('click', (event) => {
        const closeTarget = event.target.closest('[data-wechat-qr-close]');
        if (!closeTarget) return;
        event.preventDefault();
        closeModal();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        closeModal();
    });
};

document.addEventListener('DOMContentLoaded', setupWeChatQrModal);
