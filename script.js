document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    setTimeout(() => {
        document.body.classList.remove('preload');
    }, 50);

    const modalContainer = document.getElementById('modalContainer');
    let activeModal = null;

    const createModalHTML = (id, type, title, description) => {
        const iconSVG = {
            emergency: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.866 3.487c.812-1.533 3.45-1.533 4.262 0l7.32 13.869c.698 1.32-.188 2.987-1.732 2.987H3.284c-1.544 0-2.43-1.667-1.732-2.987l7.314-13.87zm-1.732 12.013a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm-1-3.994a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0v-2a1 1 0 0 0-1-1z"></path></svg>`,
            ai: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a5 5 0 0 0-5 5v2a5 5 0 0 0-2 4 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 3 3 0 0 1 6 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 5 5 0 0 0-2-4V7a5 5 0 0 0-5-5zm-3 8H7v1h2v-1zm8 0h-2v1h2v-1zM9 14h6v1H9v-1zm-4 3h14v2H5v-2zm3 3h8v1H8v-1z"></path></svg>`
        };

        const formContent = {
            emergency: `
                <form class="modal-form" id="modalEmergencyAlertForm">
                    <div class="input-group">
                        <input type="text" id="modalPatientName" name="name" required placeholder=" ">
                        <label for="modalPatientName">Patient Name</label>
                    </div>
                    <div class="input-group">
                        <input type="text" id="modalPatientLocation" name="location" required placeholder=" ">
                        <label for="modalPatientLocation">Location (Ward/Room)</label>
                    </div>
                    <div class="input-group">
                        <textarea id="modalEmergencyDetails" name="details" rows="2" placeholder=" "></textarea>
                        <label for="modalEmergencyDetails">Brief Details (Optional)</label>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="modal-cancel-btn">Cancel</button>
                        <button type="submit" class="action-button submit-button">
                             <span class="button-text">Send Alert</span>
                             <span class="button-loader"></span>
                        </button>
                    </div>
                </form>`,
            ai: `
                <div class="ai-chat-container">
                    <div class="ai-chat-area">
                         <div class="ai-message ai-message-bot">
                             <p>Welcome to MediBot! I can help with symptom checks, medication info, or general health questions. Remember, I'm not a substitute for professional medical advice.</p>
                         </div>
                    </div>
                    <form class="ai-input-form" id="aiInputForm">
                        <div class="input-group">
                            <input type="text" id="aiQueryInput" placeholder=" ">
                            <label for="aiQueryInput">Ask MediBot...</label>
                        </div>
                        <button type="submit" class="action-button submit-button">
                             <span class="button-text">Send</span>
                             <span class="button-loader"></span>
                        </button>
                    </form>
                </div>`
        };

        const modalHTML = `
            <div id="${id}" class="modal-overlay">
                <div class="modal-content">
                    <button class="modal-close-btn" aria-label="Close modal">×</button>
                    <div class="modal-header">
                        <div class="modal-icon icon-${type}">${iconSVG[type]}</div>
                        <div>
                            <h2 class="modal-title">${title}</h2>
                            <p class="modal-description">${description}</p>
                        </div>
                    </div>
                    ${formContent[type]}
                </div>
            </div>`;
        modalContainer.insertAdjacentHTML('beforeend', modalHTML);
        return document.getElementById(id);
    };

    const showModal = (modalElement) => {
        if (!modalElement || activeModal) return;
        activeModal = modalElement;
        modalElement.classList.add('visible');
        document.body.classList.add('modal-open');
        modalElement.querySelector('.modal-close-btn')?.addEventListener('click', () => hideModal(modalElement));
        modalElement.querySelector('.modal-cancel-btn')?.addEventListener('click', () => hideModal(modalElement));
        modalElement.addEventListener('click', (event) => {
             if (event.target === modalElement) {
                 hideModal(modalElement);
             }
        });
        const firstInput = modalElement.querySelector('input:not([type=hidden]), textarea, select');
        if (firstInput) setTimeout(() => firstInput.focus(), 50);
    };

    const hideModal = (modalElement) => {
         if (!modalElement || !activeModal) return;
         activeModal = null;
         modalElement.classList.remove('visible');
         document.body.classList.remove('modal-open');
         const form = modalElement.querySelector('form');
         if (form) form.reset();
    };

    const setupModalTrigger = (triggerId, modalId, type, title, description) => {
         const trigger = document.getElementById(triggerId);
         if (!trigger) return;

         trigger.addEventListener('click', () => {
             let modal = document.getElementById(modalId);
             if (!modal) {
                 modal = createModalHTML(modalId, type, title, description);
                 setupModalForms(modal);
             }
             showModal(modal);
         });
    };

     const setupModalForms = (modalElement) => {
        const emergencyForm = modalElement.querySelector('#modalEmergencyAlertForm');
        const aiForm = modalElement.querySelector('#aiInputForm');

        if (emergencyForm) {
            emergencyForm.addEventListener('submit', (event) => handleEmergencySubmit(event, emergencyForm, () => hideModal(modalElement)));
        }
        if (aiForm) {
            aiForm.addEventListener('submit', handleAiSubmit);
        }
    };

    const setButtonLoading = (button, isLoading) => {
        if (button) {
            button.classList.toggle('loading', isLoading);
            button.disabled = isLoading;
        }
    };

    const handleEmergencySubmit = (event, formElement, callback) => {
         event.preventDefault();
         const submitButton = formElement.querySelector('.submit-button');
         setButtonLoading(submitButton, true);

         const patientName = formElement.name.value.trim();
         const patientLocation = formElement.location.value.trim();
         const emergencyDetails = formElement.details.value.trim();

         if (!patientName || !patientLocation) {
             Swal.fire({ title: "Missing Information", text: "Please enter Patient Name and Location.", icon: "warning" });
             setButtonLoading(submitButton, false);
             return;
         }

         setTimeout(() => {
             Swal.fire({
                 title: "Alert Sent!",
                 html: `Emergency dispatch notified for <strong>${patientName}</strong> at <strong>${patientLocation}</strong>.`,
                 icon: "success",
                 timer: 2500,
                 timerProgressBar: true,
                 showConfirmButton: false
             });
             setButtonLoading(submitButton, false);
             formElement.reset();
             if (callback) callback();
         }, 1200);
    };

     const handleAiSubmit = (event) => {
        event.preventDefault();
        const form = event.target;
        const input = form.querySelector('#aiQueryInput');
        const submitButton = form.querySelector('.submit-button');
        const chatArea = document.querySelector('#aiHelperModal .ai-chat-area');
        const query = input.value.trim();

        if (!query || !chatArea) return;

        setButtonLoading(submitButton, true);
        input.disabled = true;

        const userMessage = document.createElement('div');
        userMessage.className = 'ai-message ai-message-user';
        userMessage.innerHTML = `<p>${query.replace(/</g, "<").replace(/>/g, ">")}</p>`;
        chatArea.appendChild(userMessage);
        chatArea.scrollTop = chatArea.scrollHeight;
        input.value = '';

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'ai-message ai-message-bot ai-typing';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        chatArea.appendChild(typingIndicator);
        chatArea.scrollTop = chatArea.scrollHeight;

        setTimeout(() => {
            chatArea.removeChild(typingIndicator);
            const botResponse = document.createElement('div');
            botResponse.className = 'ai-message ai-message-bot';

            let responseText = "I'm currently processing that. ";
            if (query.toLowerCase().includes("donation")) {
                 responseText += "Organ donation eligibility often depends on medical history, age, and overall health. You can find detailed criteria on the official registry website or consult a healthcare professional.";
            } else if (query.toLowerCase().includes("side effect")) {
                 responseText += "Information on medication side effects should always be confirmed with your doctor or pharmacist, as individual reactions can vary.";
            } else {
                 responseText += "For specific medical advice, please consult a qualified healthcare provider.";
            }
            botResponse.innerHTML = `<p>${responseText}</p>`;
            chatArea.appendChild(botResponse);
            chatArea.scrollTop = chatArea.scrollHeight;

             setButtonLoading(submitButton, false);
             input.disabled = false;
             input.focus();
        }, 1500 + Math.random() * 1000);
    };


    const emergencyTriggerButton = document.getElementById('emergencyTrigger');
    const emergencyFormContainer = document.getElementById('emergencyFormContainer');
    const inlineEmergencyAlertForm = document.getElementById('emergencyAlertForm');
    const cancelAlertButton = document.getElementById('cancelAlertBtn');
    const medicalHistoryButton = document.getElementById('medicalHistoryBtn');
    const organDonationForm = document.getElementById('organDonationForm');

    if (emergencyFormContainer) {
        emergencyFormContainer.hidden = true;
    }

    if (emergencyTriggerButton && emergencyFormContainer) {
        emergencyTriggerButton.addEventListener('click', (e) => {
            e.stopPropagation();
            emergencyFormContainer.hidden = false;
             setTimeout(() => {
                emergencyFormContainer.classList.add('visible');
                emergencyFormContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const firstInput = inlineEmergencyAlertForm?.querySelector('input[name="name"]');
                if (firstInput) firstInput.focus();
             }, 10);
        });
    }

    if (cancelAlertButton && emergencyFormContainer) {
        cancelAlertButton.addEventListener('click', () => {
             emergencyFormContainer.classList.remove('visible');
             setTimeout(() => {
                 emergencyFormContainer.hidden = true;
                 inlineEmergencyAlertForm.reset();
             }, 500);
        });
    }

     if (inlineEmergencyAlertForm) {
        inlineEmergencyAlertForm.addEventListener('submit', (event) => handleEmergencySubmit(event, inlineEmergencyAlertForm, () => {
             if (emergencyFormContainer) {
                 emergencyFormContainer.classList.remove('visible');
                 setTimeout(() => {
                    emergencyFormContainer.hidden = true;
                 }, 500);
             }
        }));
    }


    if (medicalHistoryButton) {
        medicalHistoryButton.addEventListener('click', () => {
            Swal.fire({
                title: 'Medical History Access',
                text: 'This section requires authentication. Feature simulation: Access Granted.',
                icon: 'info',
                confirmButtonText: 'Proceed',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        });
    }

     if (organDonationForm) {
        organDonationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const submitButton = this.querySelector('.submit-button');
            setButtonLoading(submitButton, true);

            const formData = new FormData(this);
            const name = formData.get('fullName')?.trim();
            const email = formData.get('email')?.trim();
            const phone = formData.get('phone')?.trim();
            const age = parseInt(formData.get('age'), 10);
            const bloodType = formData.get('bloodType');
            const organs = formData.getAll('organs');
            const organsError = document.getElementById('organsError');
            let isValid = true;

            document.querySelectorAll('.form-error').forEach(el => el.hidden = true);
            this.querySelectorAll('input[required], select[required]').forEach(el => el.style.borderColor = '');

            if (!name || !email || !phone || isNaN(age) || !bloodType) isValid = false;
            if (organs.length === 0) {
                isValid = false;
                if (organsError) organsError.hidden = false;
            }

            if (!isValid) {
                 Swal.fire('Incomplete Form', 'Please review the highlighted fields and ensure all required information is provided.', 'warning');
                 this.querySelectorAll('input:invalid, select:invalid').forEach(el => el.style.borderColor = 'var(--emergency-color)');
                 setButtonLoading(submitButton, false);
                 return;
            }
            if (age < 18) {
                 Swal.fire('Age Requirement', 'You must be 18 or older to register.', 'warning');
                 document.getElementById('donorAge').style.borderColor = 'var(--emergency-color)';
                 setButtonLoading(submitButton, false);
                 return;
            }

             setTimeout(() => {
                Swal.fire({
                    title: 'Confirm Your Pledge',
                    html: `Thank you, <strong>${name.replace(/</g, "<")}</strong>.<br>Confirm registration to donate: <br><i>${organs.join(', ')}</i>.`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Confirm Pledge',
                    cancelButtonText: 'Edit Information',
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: 'Registration Received!',
                            text: 'Your generous pledge has been recorded. Thank you for giving the gift of life.',
                            icon: 'success',
                            timer: 3000,
                            showConfirmButton: false,
                        });
                        this.reset();
                        if (organsError) organsError.hidden = true;
                    }
                    setButtonLoading(submitButton, false);
                });
             }, 800);
        });
    }


    setupModalTrigger('navAiHelperBtn', 'aiHelperModal', 'ai', 'MediBot AI Assistant', 'Your intelligent health companion.');
    setupModalTrigger('mainAiHelperBtn', 'aiHelperModal', 'ai', 'MediBot AI Assistant', 'Your intelligent health companion.');


    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
        observer.observe(el);
    });

});