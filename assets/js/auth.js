// ClassWallet Authentication Module
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.allowedEmails = [
            'ut03211tic@gmail.com', // Replace with actual admin emails
            'committee1@university.edu',
            'committee2@university.edu'
            // Add more approved emails here
        ];
        this.init();
    }

    init() {
        // Initialize Google Sign-In
        google.accounts.id.initialize({
            client_id: 'YOUR_GOOGLE_CLIENT_ID_HERE', // Replace with your actual Google OAuth client ID
            callback: this.handleCredentialResponse.bind(this),
            auto_select: false,
            cancel_on_tap_outside: true
        });

        // Render sign-in button
        google.accounts.id.renderButton(
            document.getElementById('signin-btn'),
            {
                theme: 'outline',
                size: 'medium',
                text: 'signin_with',
                shape: 'rectangular'
            }
        );

        // Check if user is already signed in
        this.checkExistingSession();

        // Setup sign out button
        document.getElementById('signout-btn').addEventListener('click', () => {
            this.signOut();
        });
    }

    handleCredentialResponse(response) {
        const responsePayload = this.decodeJwtResponse(response.credential);
        this.currentUser = {
            email: responsePayload.email,
            name: responsePayload.name,
            picture: responsePayload.picture,
            isAdmin: this.isAdmin(responsePayload.email)
        };

        this.updateUI();
        this.saveSession();
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