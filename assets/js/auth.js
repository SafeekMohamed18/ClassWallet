// ClassWallet Authentication Module
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.allowedEmails = [
            'ut03211tic@gmail.com',
            'mohamedsafeek0618@gmail.com',
            'bweerasinghe2004@gmail.com',
            'hapugodasanjana@gmail.com',
            'oshani2003u@gmail.com',
            'skkuruwita@gmail.com',
            'samarasinghebhagya123@gmail.com',
            'suranthadarshana6@gmail.com',
            'sampathweragoda17@gmail.com'
             // <-- ADD NEW MEMBER EMAILS HERE
        ];
        this.init();
    }

    init() {
        // Check if the Google library is ready; if not, wait for it.
        if (typeof google !== 'undefined' && google.accounts) {
            this.setupGoogleAuth();
        } else {
            // Fallback: poll until the script is loaded
            const checkLibrary = setInterval(() => {
                if (typeof google !== 'undefined' && google.accounts) {
                    clearInterval(checkLibrary);
                    this.setupGoogleAuth();
                }
            }, 100);
        }

        // Check if user is already signed in
        this.checkExistingSession();

        // Setup sign out button
        document.getElementById('signout-btn').addEventListener('click', () => {
            this.signOut();
        });
    }

    setupGoogleAuth() {
        const btnContainer = document.getElementById('signin-btn');
        if (!btnContainer) return;

        google.accounts.id.initialize({
            client_id: '741095786970-egvfvg4cdlsurkfsfavt02qadt2dprjg.apps.googleusercontent.com',
            callback: this.handleCredentialResponse.bind(this),
            auto_select: false,
            cancel_on_tap_outside: true
        });

        google.accounts.id.renderButton(
            btnContainer,
            {
                theme: 'outline',
                size: 'medium',
                text: 'signin_with',
                shape: 'rectangular'
            }
        );
    }

    handleCredentialResponse(response) {
        const responsePayload = this.decodeJwtResponse(response.credential);
        
        if (this.isAllowed(responsePayload.email)) {
            this.currentUser = {
                email: responsePayload.email,
                name: responsePayload.name,
                picture: responsePayload.picture,
                isAdmin: this.isAdmin(responsePayload.email)
            };
            this.updateUI();
            this.saveSession();
        } else {
            this.showError('Access Denied: This email is not authorized.');
        }
    }

    decodeJwtResponse(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }

    isAdmin(email) {
        // For now, first email in allowed list is admin
        return email === this.allowedEmails[0];
    }

    isAllowed(email) {
        return this.allowedEmails.includes(email);
    }

    checkExistingSession() {
        const session = localStorage.getItem('classwallet_session');
        if (session) {
            try {
                const userData = JSON.parse(session);
                if (this.isAllowed(userData.email)) {
                    this.currentUser = userData;
                    this.updateUI();
                } else {
                    localStorage.removeItem('classwallet_session');
                }
            } catch (e) {
                localStorage.removeItem('classwallet_session');
            }
        }
    }

    saveSession() {
        if (this.currentUser) {
            localStorage.setItem('classwallet_session', JSON.stringify(this.currentUser));
        }
    }

    signOut() {
        this.currentUser = null;
        localStorage.removeItem('classwallet_session');
        google.accounts.id.disableAutoSelect();
        this.updateUI();
    }

    updateUI() {
        const signinBtn = document.getElementById('signin-btn');
        const userInfo = document.getElementById('user-info');
        const userEmail = document.getElementById('user-email');
        const authRequired = document.getElementById('auth-required');
        const mainContent = document.getElementById('main-content');

        if (this.currentUser) {
            signinBtn.classList.add('d-none');
            userInfo.classList.remove('d-none');
            userEmail.textContent = this.currentUser.email;
            authRequired.classList.add('d-none');
            mainContent.classList.remove('d-none');
        } else {
            signinBtn.classList.remove('d-none');
            userInfo.classList.add('d-none');
            authRequired.classList.remove('d-none');
            mainContent.classList.add('d-none');
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.authManager = new AuthManager();
});