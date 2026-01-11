/**
 * Şifre Yöneticisi - Core Logic
 */

// --- State Management ---
let state = {
    key: null,          // CryptoKey object (In Memory Only)
    passwords: [],      // Decrypted password list
    salt: null          // Uint8Array
};

const STORAGE_KEY = 'vault_data';

// --- Crypto Utils (Web Crypto API) ---

async function generateSalt() {
    return window.crypto.getRandomValues(new Uint8Array(16));
}

async function generateIV() {
    return window.crypto.getRandomValues(new Uint8Array(12));
}

// Password -> Key (PBKDF2)
async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false, // Key is non-extractable
        ["encrypt", "decrypt"]
    );
}

// Encrypt Data (AES-GCM)
async function encryptData(dataObject, key) {
    const enc = new TextEncoder();
    const encodedData = enc.encode(JSON.stringify(dataObject));
    const iv = await generateIV();

    const encryptedContent = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encodedData
    );

    return {
        iv: Array.from(iv),
        content: Array.from(new Uint8Array(encryptedContent))
    };
}

// Decrypt Data (AES-GCM)
async function decryptData(encryptedData, iv, key) {
    try {
        const decryptedContent = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(iv) },
            key,
            new Uint8Array(encryptedData)
        );

        const dec = new TextDecoder();
        return JSON.parse(dec.decode(decryptedContent));
    } catch (e) {
        throw new Error("Şifre çözülemedi. Yanlış anahtar veya bozuk veri.");
    }
}

// --- App Logic ---

document.addEventListener('DOMContentLoaded', () => {
    checkVaultStatus();
    setupEventListeners();
});

function checkVaultStatus() {
    const vaultData = localStorage.getItem(STORAGE_KEY);
    const subtitle = document.getElementById('auth-subtitle');
    const authBtn = document.getElementById('auth-btn');
    const confirmGroup = document.getElementById('confirm-password-group');

    if (vaultData) {
        // Vault exists -> Login Mode
        subtitle.textContent = "Kasanıza erişmek için şifrenizi girin.";
        authBtn.innerHTML = 'Giriş Yap <i class="fa-solid fa-arrow-right"></i>';
        confirmGroup.style.display = 'none';
        document.getElementById('confirm-password').removeAttribute('required');
        document.getElementById('import-btn-auth').style.display = 'none'; // Can't restore over existing without clearing
    } else {
        // No Vault -> Create Mode
        subtitle.textContent = "Kasanızı oluşturmak için bir ana şifre belirleyin.";
        authBtn.innerHTML = 'Kasayı Oluştur <i class="fa-solid fa-arrow-right"></i>';
        confirmGroup.style.display = 'block';
        document.getElementById('confirm-password').setAttribute('required', 'true');
        document.getElementById('import-btn-auth').style.display = 'inline-block';
    }
}

async function handleAuth(e) {
    e.preventDefault();
    const masterPass = document.getElementById('master-password').value;
    const confirmPass = document.getElementById('confirm-password').value;
    const vaultDataRaw = localStorage.getItem(STORAGE_KEY);

    if (!masterPass) return showToast("Lütfen şifre girin.", "error");

    try {
        if (vaultDataRaw) {
            // LOGIN FLOW
            const vault = JSON.parse(vaultDataRaw);
            const salt = new Uint8Array(vault.salt);
            const key = await deriveKey(masterPass, salt);

            // Try to decrypt to verify password
            const passwords = await decryptData(vault.content, vault.iv, key);

            // Success
            state.key = key;
            state.salt = salt;
            state.passwords = passwords;

            loginSuccess();

        } else {
            // CREATE FLOW
            if (masterPass !== confirmPass) {
                return showToast("Şifreler eşleşmiyor!", "error");
            }
            if (masterPass.length < 6) {
                return showToast("Şifre en az 6 karakter olmalı.", "error");
            }

            const salt = await generateSalt();
            const key = await deriveKey(masterPass, salt);

            // Initial save (Empty encrypted list)
            state.key = key;
            state.salt = salt;
            state.passwords = [];

            await saveVault();
            loginSuccess();
            showToast("Kasa başarıyla oluşturuldu!", "success");
        }
    } catch (err) {
        console.error(err);
        showToast("Giriş başarısız! Şifre yanlış olabilir.", "error");
        document.getElementById('master-password').classList.add('shake');
        setTimeout(() => document.getElementById('master-password').classList.remove('shake'), 500);
    }
}

function loginSuccess() {
    document.getElementById('auth-view').style.display = 'none';
    document.getElementById('dashboard-view').style.display = 'block';
    renderPasswords();
    document.getElementById('master-password').value = '';
    document.getElementById('confirm-password').value = '';
}

async function saveVault() {
    if (!state.key) return;

    // Encrypt current passwords list
    const encrypted = await encryptData(state.passwords, state.key);

    // Store: { salt: [], iv: [], content: [] }
    const vaultObject = {
        salt: Array.from(state.salt),
        iv: encrypted.iv,
        content: encrypted.content
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(vaultObject));
}

// --- Dashboard Functions ---

function renderPasswords(filter = '') {
    const listEl = document.getElementById('password-list');
    const emptyState = document.getElementById('empty-state');
    listEl.innerHTML = '';

    const filtered = state.passwords.filter(p =>
        p.title.toLowerCase().includes(filter.toLowerCase()) ||
        (p.username && p.username.toLowerCase().includes(filter.toLowerCase()))
    );

    if (filtered.length === 0) {
        emptyState.style.display = 'flex';
        listEl.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    listEl.style.display = 'block';

    filtered.forEach(p => {
        const li = document.createElement('li');
        li.className = 'password-item';
        li.onclick = (e) => {
            // Prevent if clicked on action buttons
            if (e.target.closest('.copy-btn')) return;
            openDetailModal(p.id);
        };

        li.innerHTML = `
            <div class="item-info">
                <div class="item-icon">
                    <i class="fa-solid fa-key"></i>
                </div>
                <div class="item-details">
                    <h4>${escapeHtml(p.title)}</h4>
                    <p>${escapeHtml(p.username || 'Kullanıcı adı yok')}</p>
                </div>
            </div>
            <div class="item-actions">
                <button class="icon-btn copy-btn" data-copy="${escapeHtml(p.password)}" title="Şifreyi Kopyala">
                    <i class="fa-regular fa-copy"></i>
                </button>
            </div>
        `;
        listEl.appendChild(li);
    });

    // Re-attach copy listeners for the list
    document.querySelectorAll('.copy-btn[data-copy]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            copyToClipboard(btn.dataset.copy);
        });
    });
}

// --- Modal Functions ---

function openAddModal(editId = null) {
    const modal = document.getElementById('password-modal');
    const form = document.getElementById('password-form');
    const titleEl = document.getElementById('modal-title');

    form.reset();
    document.getElementById('edit-id').value = '';

    if (editId) {
        const entry = state.passwords.find(p => p.id === editId);
        if (entry) {
            titleEl.textContent = "Kaydı Düzenle";
            document.getElementById('edit-id').value = entry.id;
            document.getElementById('entry-title').value = entry.title;
            document.getElementById('entry-username').value = entry.username;
            document.getElementById('entry-password').value = entry.password;
            document.getElementById('entry-notes').value = entry.notes || '';
        }
    } else {
        titleEl.textContent = "Yeni Kayıt";
    }

    modal.style.display = 'flex';
}

function handleSavePassword(e) {
    e.preventDefault();

    const id = document.getElementById('edit-id').value;
    const title = document.getElementById('entry-title').value;
    const username = document.getElementById('entry-username').value;
    const password = document.getElementById('entry-password').value;
    const notes = document.getElementById('entry-notes').value;

    if (!title || !password) return;

    if (id) {
        // Update
        const index = state.passwords.findIndex(p => p.id === id);
        if (index !== -1) {
            state.passwords[index] = { ...state.passwords[index], title, username, password, notes, updatedAt: Date.now() };
            showToast("Kayıt güncellendi.", "success");
        }
    } else {
        // Create
        const newEntry = {
            id: crypto.randomUUID(),
            title,
            username,
            password,
            notes,
            createdAt: Date.now()
        };
        state.passwords.push(newEntry);
        showToast("Yeni şifre eklendi.", "success");
    }

    saveVault();
    renderPasswords();
    closeAllModals();
}

function openDetailModal(id) {
    const entry = state.passwords.find(p => p.id === id);
    if (!entry) return;

    document.getElementById('detail-title').textContent = entry.title;
    document.getElementById('detail-username').textContent = entry.username || '-';
    document.getElementById('detail-password').textContent = entry.password;
    document.getElementById('detail-password').classList.add('masked');
    document.getElementById('detail-toggle-pass').innerHTML = '<i class="fa-solid fa-eye"></i>';

    const notesEl = document.getElementById('detail-notes');
    if (entry.notes) {
        notesEl.textContent = entry.notes;
        document.getElementById('detail-notes-container').style.display = 'block';
    } else {
        document.getElementById('detail-notes-container').style.display = 'none';
    }

    // Set actions
    document.getElementById('edit-entry-btn').onclick = () => {
        closeAllModals();
        openAddModal(id);
    };

    document.getElementById('delete-entry-btn').onclick = () => {
        if (confirm(`"${entry.title}" kaydını silmek istediğinize emin misiniz?`)) {
            state.passwords = state.passwords.filter(p => p.id !== id);
            saveVault();
            renderPasswords();
            closeAllModals();
            showToast("Kayıt silindi.", "success");
        }
    };

    document.getElementById('detail-modal').style.display = 'flex';
}

// --- Import / Export ---

function exportVault() {
    if (!state.key) return;

    // We export the raw encrypted vault structure from localStorage
    // This allows importing it back without re-encrypting if we don't want to change the password
    // However, to be safe and consistent with the current in-memory state, we should generate fresh encryption
    // Logic: The saveVault() updates localStorage. We can just download that string.

    const vaultDataStr = localStorage.getItem(STORAGE_KEY);
    if (!vaultDataStr) return;

    const blob = new Blob([vaultDataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sifre_yedegi_${new Date().toISOString().slice(0, 10)}.json`; // or .enc
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Yedek dosyası indirildi.", "success");
}

function handleRestore(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const content = e.target.result;
            // Validate JSON structure
            const json = JSON.parse(content);
            if (!json.salt || !json.iv || !json.content) {
                throw new Error("Geçersiz yedek dosyası formatı.");
            }

            // Allow restoration check:
            // If already logged in, we might want to merge or replace?
            // For simplicity: Replace currently stored vault

            if (confirm("Bu işlem mevcut kasanızın üzerine yazacaktır. Devam etmek istiyor musunuz?")) {
                localStorage.setItem(STORAGE_KEY, content);
                alert("Yedek geri yüklendi. Sayfa yenileniyor...");
                location.reload();
            }
        } catch (err) {
            showToast("Dosya okunamadı veya hatalı.", "error");
            console.error(err);
        }
    };
    reader.readAsText(file);
}

// --- Helper Functions ---

function generatePassword(length = 16, useUpper = true, useNumbers = true, useSymbols = true) {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let chars = lower;
    if (useUpper) chars += upper;
    if (useNumbers) chars += numbers;
    if (useSymbols) chars += symbols;

    let pass = "";
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        pass += chars[array[i] % chars.length];
    }
    return pass;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast("Kopyalandı!", "success");
    }).catch(() => {
        showToast("Kopyalama başarısız.", "error");
    });
}

function showToast(msg, type = "info") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-circle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(el => el.style.display = 'none');
}

function setupEventListeners() {
    // Auth
    document.getElementById('auth-form').addEventListener('submit', handleAuth);

    // Toggle Password Visibility (General)
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.add('fa-eye');
                icon.classList.remove('fa-eye-slash');
            }
        });
    });

    // Dashboard Actions
    document.getElementById('logout-btn').addEventListener('click', () => {
        location.reload(); // Simple logout by reload
    });

    document.getElementById('add-fab').addEventListener('click', () => openAddModal());

    document.getElementById('search-input').addEventListener('input', (e) => {
        renderPasswords(e.target.value);
    });

    // Modal Actions
    document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    document.getElementById('password-form').addEventListener('submit', handleSavePassword);

    // Password Generator
    const genBtn = document.getElementById('generate-pass-btn');
    const genOptions = document.getElementById('generator-options');

    genBtn.addEventListener('click', () => {
        if (genOptions.style.display === 'none') {
            genOptions.style.display = 'block';
        } else {
            // Generate
            const len = parseInt(document.getElementById('pass-length').value);
            const useUpper = document.getElementById('inc-upper').checked;
            const useNum = document.getElementById('inc-numbers').checked;
            const useSym = document.getElementById('inc-symbols').checked;

            const newPass = generatePassword(len, useUpper, useNum, useSym);
            document.getElementById('entry-password').value = newPass;
            document.getElementById('entry-password').type = 'text'; // Show it
        }
    });

    document.getElementById('pass-length').addEventListener('input', (e) => {
        document.getElementById('pass-length-val').textContent = e.target.value;
    });

    // Detail Modal Actions
    document.getElementById('detail-toggle-pass').addEventListener('click', function () {
        const passEl = document.getElementById('detail-password');
        const icon = this.querySelector('i');
        if (passEl.classList.contains('masked')) {
            passEl.classList.remove('masked');
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passEl.classList.add('masked');
            icon.classList.add('fa-eye');
            icon.classList.remove('fa-eye-slash');
        }
    });

    // Copy Buttons in Detail
    document.querySelectorAll('.copy-btn[data-target]').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const text = document.getElementById(targetId).textContent;
            copyToClipboard(text);
        });
    });

    // Import/Export
    document.getElementById('export-btn').addEventListener('click', exportVault);
    document.getElementById('import-btn-auth').addEventListener('click', () => {
        document.getElementById('restore-file-input').click();
    });
    document.getElementById('restore-file-input').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleRestore(e.target.files[0]);
        }
    });
}
