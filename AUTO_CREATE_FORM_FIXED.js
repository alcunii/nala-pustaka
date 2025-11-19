// GOOGLE APPS SCRIPT - AUTO CREATE VERIFICATION FORM (FIXED)
// VERSION: 1.1 - File upload issue fixed
// Paste ke: https://script.google.com/create

function createVerificationForm() {
  try {
    const form = FormApp.create('🔍 Verifikasi Nala Pustaka - Form Filolog');
    
    form.setDescription(
      '📚 Verifikasi komprehensif Nala Pustaka\n' +
      '⏱️ Estimasi: 60-70 menit per naskah\n' +
      '📊 Data otomatis ke Google Sheets\n\n' +
      '38 test cases: Chat AI (10), RAG (10), Multi-Chat (8), Mode Belajar, Graph'
    );
    
    form.setConfirmationMessage('✅ Terima kasih! Data tersimpan.');
    form.setAllowResponseEdits(true);
    form.setCollectEmail(true);
    
    // Section 1: Info Verifikator
    form.addPageBreakItem().setTitle('📝 Info Verifikator');
    form.addTextItem().setTitle('Nama Lengkap').setRequired(true);
    form.addTextItem().setTitle('Institusi').setRequired(true);
    form.addDateItem().setTitle('Tanggal').setRequired(true);
    
    // Section 2: Info Naskah
    form.addPageBreakItem().setTitle('📚 Info Naskah');
    const naskahList = form.addListItem()
      .setTitle('Judul Naskah')
      .setRequired(true);
    naskahList.setChoiceValues([
      'Serat Wulangreh (Pakubuwana IV)',
      'Serat Wedhatama (Mangkunegara IV)',
      'Serat Nitisruti (Pakubuwana V)',
      'Babad Tanah Jawi (Anonim)',
      'Kalatidha (Ranggawarsita)',
      'Serat Tripama (Mangkunegara IV)',
      'Serat Centhini (Pakubuwana V)',
      'Lainnya (sebutkan di catatan)'
    ]);
    
    // Section 3: Chat AI (10 TC)
    form.addPageBreakItem()
      .setTitle('💬 FITUR 1: Chat AI per Naskah')
      .setHelpText('Jalankan 10 prompt test cases dan evaluasi. Lihat VERIFIKASI_FILOLOG.md untuk prompt detail.');
    
    const chatPrompts = [
      'TC-1: Pertanyaan Dasar - "Siapa penulis naskah ini?"',
      'TC-2: Isi Spesifik - "Apa isi bait pertama?"',
      'TC-3: Filosofi & Makna - "Apa pesan moral utama?"',
      'TC-4: Tokoh/Karakter - "Sebutkan tokoh-tokohnya!"',
      'TC-5: Konteks Historis - "Konteks sejarah penulisan?"',
      'TC-6: Kutipan Spesifik - "Kutip 1 bait penting!"',
      'TC-7: Perbandingan Internal - "Bandingkan awal & akhir!"',
      'TC-8: Out-of-Scope (TEST HALUSINASI) - "Pengaruh teknologi modern?"',
      'TC-9: Follow-up Question - "Kapan beliau menulis?"',
      'TC-10: Negative Test - "Bukankah ditulis Pramoedya 1965?"'
    ];
    
    chatPrompts.forEach((prompt, i) => {
      form.addMultipleChoiceItem()
        .setTitle(prompt)
        .setChoiceValues(['✅ PASS', '❌ FAIL'])
        .setRequired(true);
      form.addParagraphTextItem().setTitle(`Catatan ${prompt.split(':')[0]}`);
    });
    
    form.addParagraphTextItem()
      .setTitle('📊 Ringkasan Chat AI')
      .setHelpText('Contoh: "8/10 PASS - Issues di TC-8 dan TC-10"')
      .setRequired(true);
    
    // Section 4: RAG Chat (10 TC)
    form.addPageBreakItem()
      .setTitle('🔍 FITUR 2: RAG Chat (Cross-Document)')
      .setHelpText('Search lintas 121 naskah. Verifikasi sumber yang di-cite.');
    
    const ragPrompts = [
      'RAG-1: Entity Search - "Siapa Pangeran Mangkubumi?"',
      'RAG-2: Thematic Query - "Naskah tentang kepemimpinan?"',
      'RAG-3: Comparative - "Bandingkan rasa di Wulangreh vs Wedhatama"',
      'RAG-4: Philosophical - "Pandangan atasan-bawahan?"',
      'RAG-5: Historical Event - "Naskah yang cerita perang?"',
      'RAG-6: Author-based - "Karya Pakubuwana IV?"',
      'RAG-7: Zero-Result (TEST) - "Naskah bahas AI & ML?"',
      'RAG-8: Ambiguous - "Jelaskan wulang"',
      'RAG-9: Follow-up - "Contoh ajaran spesifik?"',
      'RAG-10: Multi-Aspect - "Naskah untuk etika kerja?"'
    ];
    
    ragPrompts.forEach((prompt, i) => {
      form.addMultipleChoiceItem()
        .setTitle(prompt)
        .setChoiceValues(['✅ PASS', '❌ FAIL'])
        .setRequired(true);
      form.addParagraphTextItem().setTitle(`Catatan ${prompt.split(':')[0]}`);
    });
    
    form.addParagraphTextItem()
      .setTitle('📊 Ringkasan RAG Chat')
      .setRequired(true);
    
    // Section 5: Multi-Chat (8 TC)
    form.addPageBreakItem()
      .setTitle('💬 FITUR 3: Multi-Chat (2-3 Naskah)')
      .setHelpText('Pilih 3 naskah untuk comparative analysis.');
    
    form.addTextItem()
      .setTitle('3 Naskah yang Dipilih untuk Multi-Chat')
      .setHelpText('Contoh: Wulangreh, Wedhatama, Nitisruti')
      .setRequired(true);
    
    const multiPrompts = [
      'Multi-1: Comparative Theme - "Bandingkan kepemimpinan"',
      'Multi-2: Unique Content - "Apa yang unik masing-masing?"',
      'Multi-3: Overlap - "Filosofi yang sama?"',
      'Multi-4: Authorship - "Pengaruh latar belakang penulis?"',
      'Multi-5: Target Audience - "Untuk siapa ditulis?"',
      'Multi-6: Cross-Reference - "Entity yang disebutkan multiple?"',
      'Multi-7: Literary Style - "Bandingkan gaya penulisan"',
      'Multi-8: Selective - "Mana cocok untuk etika bisnis?"'
    ];
    
    multiPrompts.forEach((prompt, i) => {
      form.addMultipleChoiceItem()
        .setTitle(prompt)
        .setChoiceValues(['✅ PASS', '❌ FAIL'])
        .setRequired(true);
      form.addParagraphTextItem().setTitle(`Catatan ${prompt.split(':')[0]}`);
    });
    
    form.addParagraphTextItem()
      .setTitle('📊 Ringkasan Multi-Chat')
      .setRequired(true);
    
    // Section 6: Mode Belajar
    form.addPageBreakItem()
      .setTitle('🎓 FITUR 4: Mode Belajar (Educational)')
      .setHelpText('Generate konten edukatif. Verifikasi 4 cards + quiz.');
    
    ['Ringkasan Mudah', 'Kearifan Lokal', 'Tokoh & Cerita', 'Mengapa Penting'].forEach(card => {
      form.addMultipleChoiceItem()
        .setTitle(`Card: ${card}`)
        .setChoiceValues(['✅ PASS', '⚠️ PARTIAL', '❌ FAIL'])
        .setRequired(true);
      form.addParagraphTextItem().setTitle(`Catatan ${card}`);
    });
    
    form.addScaleItem()
      .setTitle('Quiz: Berapa jawaban AI yang BENAR? (0-5)')
      .setHelpText('Kerjakan quiz sendiri dulu, lalu hitung berapa jawaban correct yang benar-benar benar')
      .setBounds(0, 5)
      .setRequired(true);
    
    form.addParagraphTextItem()
      .setTitle('Catatan Quiz (soal mana yang salah?)');
    
    // Section 7: Knowledge Graph
    form.addPageBreakItem()
      .setTitle('🔮 FITUR 5: Knowledge Graph')
      .setHelpText('Verifikasi visual: nodes, edges, interaktivitas.');
    
    form.addMultipleChoiceItem()
      .setTitle('Akurasi Nodes (Karya, Tokoh, Konsep, Struktur)')
      .setChoiceValues(['✅ PASS', '⚠️ PARTIAL', '❌ FAIL'])
      .setRequired(true);
    
    form.addMultipleChoiceItem()
      .setTitle('Akurasi Edges (Relasi antar nodes)')
      .setChoiceValues(['✅ PASS', '⚠️ PARTIAL', '❌ FAIL'])
      .setRequired(true);
    
    form.addMultipleChoiceItem()
      .setTitle('Interaktivitas & Visual Quality')
      .setChoiceValues(['✅ PASS', '⚠️ PARTIAL', '❌ FAIL'])
      .setRequired(true);
    
    form.addParagraphTextItem().setTitle('Catatan Knowledge Graph');
    
    // Section 8: Checklist Parameters
    form.addPageBreakItem()
      .setTitle('✅ Checklist Parameter Komprehensif')
      .setHelpText('Centang SEMUA parameter yang terpenuhi.');
    
    const antiHal = form.addCheckboxItem().setTitle('A. Anti-Halusinasi');
    antiHal.setChoices([
      antiHal.createChoice('AI tidak mengarang tokoh/fakta'),
      antiHal.createChoice('AI mengakui jika tidak tahu'),
      antiHal.createChoice('AI mengoreksi misinformasi'),
      antiHal.createChoice('Semua klaim ada sumbernya')
    ]);
    
    const akurasi = form.addCheckboxItem().setTitle('B. Akurasi Konten');
    akurasi.setChoices([
      akurasi.createChoice('Fakta sesuai naskah asli'),
      akurasi.createChoice('Kutipan verbatim'),
      akurasi.createChoice('Interpretasi logis dan grounded'),
      akurasi.createChoice('Sitasi spesifik')
    ]);
    
    const kualitas = form.addCheckboxItem().setTitle('C. Kualitas Respons');
    kualitas.setChoices([
      kualitas.createChoice('Bahasa Indonesia baik'),
      kualitas.createChoice('Jawaban lengkap dan relevan'),
      kualitas.createChoice('Mudah dipahami'),
      kualitas.createChoice('Konsisten')
    ]);
    
    // Section 9: Red Flags & Final
    form.addPageBreakItem()
      .setTitle('🚨 Red Flags & Final Assessment')
      .setHelpText('Laporkan critical issues dan berikan rekomendasi.');
    
    const redFlags = form.addCheckboxItem().setTitle('Red Flags Ditemukan?');
    redFlags.setChoices([
      redFlags.createChoice('❌ Fabricated Characters'),
      redFlags.createChoice('❌ Fabricated Historical Facts'),
      redFlags.createChoice('❌ Misattribution'),
      redFlags.createChoice('❌ Confident Hallucination'),
      redFlags.createChoice('✅ Tidak ada red flags')
    ]);
    
    form.addParagraphTextItem()
      .setTitle('Deskripsi Detail Red Flags (jika ada)')
      .setHelpText('Issue apa? Di fitur/TC mana? Severity? Evidence?');
    
    // FIXED: Ganti file upload dengan link input
    form.addParagraphTextItem()
      .setTitle('Link Screenshot Halusinasi (Opsional)')
      .setHelpText('Upload screenshot ke Google Drive/Imgur/ImgBB, lalu paste link di sini');
    
    form.addParagraphTextItem()
      .setTitle('📊 Ringkasan Skor Keseluruhan')
      .setHelpText('Contoh:\nChat AI: 8/10\nRAG: 9/10\nMulti: 7/8\nBelajar: 4/5\nGraph: 3/3\nTOTAL: 31/36 (86%)')
      .setRequired(true);
    
    form.addParagraphTextItem()
      .setTitle('💡 Rekomendasi Perbaikan')
      .setHelpText('High priority, medium priority, nice-to-have')
      .setRequired(true);
    
    form.addMultipleChoiceItem()
      .setTitle('🎯 Final Recommendation')
      .setChoiceValues([
        '✅ PASS - Siap deploy',
        '⚠️ CONDITIONAL - Deploy dengan fixes',
        '❌ FAIL - Perlu major improvements',
        '🔄 NEEDS RETEST'
      ])
      .setRequired(true);
    
    form.addParagraphTextItem()
      .setTitle('🙏 Pesan Tambahan (Opsional)');
    
    // Link to Sheets
    const sheet = SpreadsheetApp.create('📊 Verifikasi Nala Pustaka - Responses');
    form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
    
    const formUrl = form.getPublishedUrl();
    const editUrl = form.getEditUrl();
    const sheetUrl = sheet.getUrl();
    
    // Send email
    const email = Session.getActiveUser().getEmail();
    const subject = '✅ Form Verifikasi Nala Pustaka Berhasil Dibuat!';
    const body = `
Form verifikasi telah dibuat! 🎉

📋 FORM URL (Share ke filolog):
${formUrl}

✏️ EDIT URL:
${editUrl}

📊 GOOGLE SHEETS:
${sheetUrl}

📝 SUMMARY:
- Total Questions: 90+
- Sections: 9
- Test Cases: 38
- Auto-scoring: Calculated manually from responses

🎯 NEXT STEPS:
1. Test form dengan 1 sample response
2. Cek Sheets - data masuk otomatis
3. Share Form URL ke filolog
4. Monitor responses real-time

⚠️ NOTE: File upload diganti dengan link input (Google Forms API limitation)
Instruksikan filolog untuk upload screenshot ke Google Drive/Imgur lalu paste link.

Success! 🚀
    `;
    
    MailApp.sendEmail(email, subject, body);
    
    Logger.log('✅ Form created successfully!');
    Logger.log('Form URL: ' + formUrl);
    Logger.log('Edit URL: ' + editUrl);
    Logger.log('Sheet URL: ' + sheetUrl);
    
    SpreadsheetApp.getUi().alert(
      '✅ Success!',
      'Form verifikasi telah dibuat!\n\nCek email untuk links.\n\nForm URL:\n' + formUrl,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
    return { success: true, formUrl, editUrl, sheetUrl };
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ Error', 'Terjadi kesalahan:\n' + error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}
