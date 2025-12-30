/**
 * Zbot i18n - Internationalization System
 * Supports: zh (Chinese), vi (Vietnamese), en (English)
 */

const ZbotI18n = {
    currentLang: 'zh',
    translations: {},
    supportedLangs: ['zh', 'vi', 'en'],
    
    /**
     * Initialize i18n system
     */
    async init() {
        // Get saved language or detect from browser
        const savedLang = localStorage.getItem('zbot-lang');
        const browserLang = navigator.language.split('-')[0];
        
        // Determine initial language
        if (savedLang && this.supportedLangs.includes(savedLang)) {
            this.currentLang = savedLang;
        } else if (this.supportedLangs.includes(browserLang)) {
            this.currentLang = browserLang;
        }
        
        // Load translation
        await this.loadTranslation(this.currentLang);
        
        // Apply translations
        this.applyTranslations();
        
        // Update language switcher UI
        this.updateLangSwitcher();
        
        console.log(`[i18n] Initialized with language: ${this.currentLang}`);
    },
    
    /**
     * Load translation JSON file
     */
    async loadTranslation(lang) {
        try {
            const response = await fetch(`js/i18n/${lang}.json`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.translations = await response.json();
            return true;
        } catch (error) {
            console.error(`[i18n] Failed to load ${lang}.json:`, error);
            // Fallback to Chinese
            if (lang !== 'zh') {
                return this.loadTranslation('zh');
            }
            return false;
        }
    },
    
    /**
     * Switch language
     */
    async switchLang(lang) {
        if (!this.supportedLangs.includes(lang)) {
            console.error(`[i18n] Unsupported language: ${lang}`);
            return;
        }
        
        if (lang === this.currentLang) return;
        
        // Show loading state
        document.body.style.opacity = '0.7';
        
        // Load new translation
        await this.loadTranslation(lang);
        this.currentLang = lang;
        
        // Save preference
        localStorage.setItem('zbot-lang', lang);
        
        // Apply translations
        this.applyTranslations();
        
        // Update UI
        this.updateLangSwitcher();
        
        // Update HTML lang attribute
        document.documentElement.lang = this.translations.lang || lang;
        
        // Update meta tags
        this.updateMeta();
        
        // Restore opacity
        document.body.style.opacity = '1';
        
        console.log(`[i18n] Switched to: ${lang}`);
    },
    
    /**
     * Get translation by key path (e.g., "hero.title1")
     */
    t(keyPath) {
        const keys = keyPath.split('.');
        let value = this.translations;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                console.warn(`[i18n] Missing translation: ${keyPath}`);
                return keyPath;
            }
        }
        
        return value;
    },
    
    /**
     * Apply translations to all elements with data-i18n attribute
     */
    applyTranslations() {
        // Text content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation !== key) {
                el.innerHTML = translation;
            }
        });
        
        // Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            if (translation !== key) {
                el.placeholder = translation;
            }
        });
        
        // Title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translation = this.t(key);
            if (translation !== key) {
                el.title = translation;
            }
        });
        
        // Re-initialize Lucide icons if available (in case DOM changed)
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },
    
    /**
     * Update page meta tags
     */
    updateMeta() {
        const title = this.t('meta.title');
        const description = this.t('meta.description');
        
        if (title !== 'meta.title') {
            document.title = title;
        }
        
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && description !== 'meta.description') {
            metaDesc.content = description;
        }
    },
    
    /**
     * Update language switcher UI
     */
    updateLangSwitcher() {
        // Update dropdown style switcher
        const currentLangText = document.getElementById('current-lang-text');
        if (currentLangText) {
            const langNames = { zh: '中文', vi: 'Tiếng Việt', en: 'English' };
            currentLangText.textContent = langNames[this.currentLang] || this.currentLang;
        }
        
        // Update inline button style switcher
        const switcher = document.getElementById('langSwitcher');
        if (!switcher) return;
        
        // Update active state
        switcher.querySelectorAll('[data-lang]').forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            if (lang === this.currentLang) {
                btn.classList.add('bg-aurora-400', 'text-aurora-950');
                btn.classList.remove('text-white/70', 'hover:text-white');
            } else {
                btn.classList.remove('bg-aurora-400', 'text-aurora-950');
                btn.classList.add('text-white/70', 'hover:text-white');
            }
        });
    },
    
    /**
     * Get current language info
     */
    getLangInfo() {
        return {
            code: this.currentLang,
            name: this.translations.langName || this.currentLang,
            currency: this.translations.currency || 'CNY',
            symbol: this.translations.currencySymbol || '¥'
        };
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ZbotI18n.init();
    
    // Setup dropdown language switcher
    const langSwitcher = document.getElementById('language-switcher');
    const langDropdown = document.getElementById('language-dropdown');
    
    if (langSwitcher && langDropdown) {
        // Toggle dropdown
        langSwitcher.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('hidden');
        });
        
        // Language selection
        langDropdown.querySelectorAll('[data-lang]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = item.getAttribute('data-lang');
                ZbotI18n.switchLang(lang);
                langDropdown.classList.add('hidden');
            });
        });
        
        // Close on outside click
        document.addEventListener('click', () => {
            langDropdown.classList.add('hidden');
        });
    }
});

// Global function for language switching
function switchLanguage(lang) {
    ZbotI18n.switchLang(lang);
}

