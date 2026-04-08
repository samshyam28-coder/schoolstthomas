/**
 * ST. THOMAS HSS - MASTER ADMISSION LOGIC (FINAL STABLE VERSION)
 * Features: Live Sync, Logo Support, Ref ID, and Anti-Double Submission
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
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxsDdX4yG32IiGCaPtZRbI6RSsufzKJk8ee139zBimzGAu8BcBM-j0kA57L7e51-z4/exec'; 

    // Define the submission function separately so we can remove it easily
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // --- A. THE DOUBLE-ENTRY KILLER ---
        // We remove the listener immediately so the form cannot be submitted again
        form.removeEventListener('submit', handleFormSubmit);

        // --- B. GENERATE REFERENCE ID ---
        const now = new Date();
        const datePart = now.toISOString().split('T')[0].replace(/-/g, ''); 
        const timePart = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
        const finalRefID = `STHSS-${datePart}-${timePart}`;

        // --- C. CAPTURE DATA ---
        let formData = new FormData(form);
        formData.append('reference_id', finalRefID);

        // Visual Feedback
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
            
            // SUCCESS: 3. Reload Page
            // We reload to clean everything and prevent any weird behavior
            window.location.reload();
        })
        .catch(error => {
            console.error('Submission Error!', error.message);
            alert("Submission failed. Refreshing page. Please try again.");
            window.location.reload();
        });
    }

    // Attach the submission listener
    form.addEventListener('submit', handleFormSubmit);

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


fetch(scriptURL, { 
            method: 'POST', 
            body: formData,
            mode: 'no-cors' // ADD THIS LINE HERE
        })
