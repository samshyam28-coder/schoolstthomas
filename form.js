/**
 * ST. THOMAS HSS - MASTER ADMISSION LOGIC (FINAL VERIFIED VERSION)
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('admissionForm');
    if (!form) return;

    const pupilNameInput = document.querySelector('input[name="pupil_name"]');
    const declarationName = document.getElementById('display_name');
    const submitBtn = document.querySelector('.submit-btn');

    // 1. LIVE SYNC FOR DECLARATION
    if (pupilNameInput && declarationName) {
        pupilNameInput.addEventListener('input', function() {
            let typedName = this.value.toUpperCase();
            declarationName.innerText = typedName || "[STUDENT NAME]";
        });
    }

    // 2. GOOGLE SHEETS CONNECTION & SUBMISSION
    const scriptURL = 'https://script.google.com/macros/s/AKfycbyvDLpOHtTQzuwELudG0YkXt9r9gXTwOGAIbY9UenpIeuHMnugs0gFBG4FNq8Lns3A/exec'; 
    let isSubmitting = false; // This is the "Lock"

    form.addEventListener('submit', e => {
        e.preventDefault();
        
        // If already submitting, STOP here so it doesn't double-post
        if (isSubmitting) return; 
        
        isSubmitting = true; // Set the lock to true

        // --- A. GENERATE REFERENCE ID ---
        const now = new Date();
        const datePart = now.toISOString().split('T')[0].replace(/-/g, ''); 
        const timePart = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
        const finalRefID = `STHSS-${datePart}-${timePart}`;

        // --- B. CAPTURE DATA ---
        let formData = new FormData(form);
        formData.append('reference_id', finalRefID);

        // Visual Feedback: Disable button immediately
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        fetch(scriptURL, { 
            method: 'POST', 
            body: formData
        })
        .then(response => {
            // SUCCESS: 1. Generate PDF
            generatePDF(finalRefID, formData);

            // SUCCESS: 2. Notify User
            alert("Success! Application submitted.\nReference ID: " + finalRefID);
            
            // SUCCESS: 3. Reset everything
            form.reset();
            isSubmitting = false; // Unlock for next time
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            
            if (declarationName) {
                declarationName.innerText = "[STUDENT NAME]";
            }
        })
        .catch(error => {
            console.error('Submission Error!', error.message);
            alert("Submission failed. Please check your internet connection.");
            isSubmitting = false; // Unlock so they can try again
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        });
    });

    // 3. PDF GENERATION LOGIC
    function generatePDF(refID, capturedData) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const logoImg = document.getElementById('pdfLogo');

        // Header Styling
        doc.setFillColor(128, 0, 32); // Burgundy
        doc.rect(0, 0, 210, 40, 'F');
        
        if (logoImg) {
            doc.addImage(logoImg, 'WEBP', 10, 5, 30, 30); 
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("ST. THOMAS HIGHER SECONDARY SCHOOL", 115, 15, { align: "center" });
        
        doc.setFontSize(10);
        doc.text("POONTHURA, THIRUVANANTHAPURAM", 115, 22, { align: "center" });
        
        doc.setFontSize(14);
        doc.text("ADMISSION ACKNOWLEDGMENT (2026-27)", 115, 32, { align: "center" });

        // Display Reference ID
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`REF ID: ${refID}`, 195, 48, { align: "right" });

        // Data Body
        doc.setFontSize(12);
        doc.text("STUDENT RECEIPT DETAILS", 20, 55);
        doc.line(20, 57, 190, 57);

        let yPos = 70;
        const details = [
            ["Pupil Name:", capturedData.get('pupil_name').toUpperCase()],
            ["Aadhar No:", capturedData.get('aadhar_no')],
            ["Date of Birth:", capturedData.get('dob_figures')],
            ["Target Class:", capturedData.get('target_std')],
            ["Medium:", capturedData.get('instruction_lang')],
            ["Submission Date:", new Date().toLocaleString()],
            ["Status:", "Successfully Submitted"]
        ];

        details.forEach(detail => {
            doc.setFont("helvetica", "bold");
            doc.text(detail[0], 20, yPos);
            doc.setFont("helvetica", "normal");
            doc.text(String(detail[1]), 70, yPos);
            yPos += 10;
        });

        yPos += 15;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        const declarationText = "I solemnly declare that the particulars provided above are true and correct to\nthe best of my knowledge and I agree to abide by the rules and discipline\nof St. Thomas HSS.";
        doc.text(declarationText, 20, yPos);

        doc.setFont("helvetica", "bold");
        doc.text("This is an electronically generated acknowledgment.", 105, 285, { align: "center" });

        doc.save(`Receipt_${capturedData.get('pupil_name')}_${refID}.pdf`);
    }
});
