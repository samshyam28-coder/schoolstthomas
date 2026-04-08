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

    function handleFormSubmit(e) {
        e.preventDefault();
        
        // --- A. THE DOUBLE-ENTRY KILLER ---
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
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        fetch(scriptURL, { 
            method: 'POST', 
            body: formData,
            mode: 'no-cors' 
        })
        .then(response => {
            // SUCCESS: 1. Generate FULL PDF
            generatePDF(finalRefID, formData);

            // SUCCESS: 2. Notify User
            alert("Success! Application submitted.\nReference ID: " + finalRefID);
            
            // SUCCESS: 3. Reload Page
            window.location.reload();
        })
        .catch(error => {
            console.error('Submission Error!', error.message);
            alert("Submission failed. Refreshing page. Please try again.");
            window.location.reload();
        });
    }

    form.addEventListener('submit', handleFormSubmit);

    // 3. FULL FORM PDF GENERATION LOGIC
    function generatePDF(refID, capturedData) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const logoImg = document.getElementById('pdfLogo');

        // --- HEADER ---
        doc.setFillColor(128, 0, 32); // Burgundy
        doc.rect(0, 0, 210, 40, 'F');
        
        if (logoImg) {
            doc.addImage(logoImg, 'PNG', 12, 5, 30, 30); 
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("ST. THOMAS HIGHER SECONDARY SCHOOL", 115, 15, { align: "center" });
        
        doc.setFontSize(10);
        doc.text("POONTHURA, THIRUVANANTHAPURAM", 115, 21, { align: "center" });
        
        // Added the FORM 3 Legal Subtitle as requested
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("FORM 3 [See Rule VI-1 (1)]", 115, 27, { align: "center" });

        doc.setFontSize(13);
        doc.text("ADMISSION APPLICATION (2026-27)", 115, 34, { align: "center" });

        // --- REFERENCE ID ---
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(`REF ID: ${refID}`, 195, 48, { align: "right" });

        let y = 55;

        // Helper function for Sections
        const addSection = (title, fields) => {
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setFillColor(245, 245, 245);
            doc.rect(15, y, 180, 7, 'F');
            doc.text(title, 20, y + 5);
            y += 12;
            doc.setFontSize(10);
            
            fields.forEach(field => {
                doc.setFont("helvetica", "bold");
                doc.text(field[0], 20, y);
                doc.setFont("helvetica", "normal");
                
                const val = String(field[1] || "N/A");
                const splitVal = doc.splitTextToSize(val, 125);
                doc.text(splitVal, 65, y);
                y += (splitVal.length * 5) + 2;
            });
            y += 4;
        };

        // 1. Pupil Identity
        addSection("1. PUPIL IDENTITY", [
            ["Name of Pupil:", capturedData.get('pupil_name').toUpperCase()],
            ["Aadhar Number:", capturedData.get('aadhar_no')],
            ["Date of Birth:", `${capturedData.get('dob_figures')} (${capturedData.get('dob_words')})`],
            ["Mother Tongue:", capturedData.get('mother_tongue')],
            ["Instruction Med:", capturedData.get('instruction_lang')]
        ]);

        // 2. Family & Social
        addSection("2. FAMILY & SOCIAL DETAILS", [
            ["Parent/Guardian:", capturedData.get('parent_details')],
            ["Contact Phone:", capturedData.get('phone_no')],
            ["Address/Occ:", capturedData.get('parent_occupation_address')],
            ["Religion & Caste:", capturedData.get('religion_caste')],
            ["Category:", capturedData.get('social_category')],
            ["Local Guardian:", capturedData.get('local_guardian') || "None"]
        ]);

        // 3. Previous School
        addSection("3. SCHOOL PREVIOUSLY ATTENDED", [
            ["School Name:", capturedData.get('prev_school_name') || "N/A"],
            ["Standard/Class:", capturedData.get('prev_std') || "N/A"],
            ["Adm/Leave Date:", `${capturedData.get('prev_adm_date')} to ${capturedData.get('prev_leave_date')}`],
            ["Target Class:", capturedData.get('target_std')],
            ["TC Details:", capturedData.get('tc_details') || "N/A"]
        ]);

        // 4. Health & Vaccination
        addSection("4. HEALTH & VACCINATION", [
            ["Last Vaccination:", capturedData.get('last_vax_date') || "N/A"],
            ["Vax Details:", capturedData.get('vax_details') || "N/A"]
        ]);

        // --- FOOTER & SIGNATURE ---
        y += 10;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.text("I hereby declare that the information provided above is true to the best of my knowledge.", 20, y);
        
        y += 25;
        doc.setFont("helvetica", "bold");
        doc.line(20, y, 75, y); // Parent Sign Line
        doc.line(135, y, 190, y); // School Sign Line
        doc.text("Parent/Guardian Signature", 20, y + 5);
        doc.text("Head of Institution", 135, y + 5);

        doc.setFontSize(8);
        doc.text("This is an electronically generated document.", 105, 288, { align: "center" });

        doc.save(`Application_${capturedData.get('pupil_name')}_${refID}.pdf`);
    }
});
