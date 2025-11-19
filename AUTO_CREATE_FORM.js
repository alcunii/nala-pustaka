// GOOGLE APPS SCRIPT - AUTO CREATE VERIFICATION FORM
// Paste seluruh kode ini ke https://script.google.com/create
// Lalu klik Run

function createVerificationForm() {
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
  form.addListItem()
    .setTitle('Judul Naskah')
    .setChoiceValues(['Serat Wulangreh', 'Serat Wedhatama', 'Serat Nitisruti', 'Babad Tanah Jawi', 'Kalatidha', 'Lainnya'])
    .setRequired(true);
  
  // Section 3: Chat AI (10 TC)
  form.addPageBreakItem().setTitle('💬 FITUR 1: Chat AI per Naskah');
  for(let i=1; i<=10; i++) {
    form.addMultipleChoiceItem()
      .setTitle(`TC-${i}: [Lihat dokumentasi untuk prompt]`)
      .setChoiceValues(['✅ PASS', '❌ FAIL'])
      .setRequired(true);
    form.addParagraphTextItem().setTitle(`Catatan TC-${i}`);
  }
  
  // Section 4: RAG Chat (10 TC)
  form.addPageBreakItem().setTitle('🔍 FITUR 2: RAG Chat');
  for(let i=1; i<=10; i++) {
    form.addMultipleChoiceItem()
      .setTitle(`RAG TC-${i}`)
      .setChoiceValues(['✅ PASS', '❌ FAIL'])
      .setRequired(true);
    form.addParagraphTextItem().setTitle(`Catatan RAG TC-${i}`);
  }
  
  // Section 5: Multi-Chat (8 TC)
  form.addPageBreakItem().setTitle('💬 FITUR 3: Multi-Chat');
  form.addTextItem().setTitle('3 Naskah yang Dipilih').setRequired(true);
  for(let i=1; i<=8; i++) {
    form.addMultipleChoiceItem()
      .setTitle(`Multi TC-${i}`)
      .setChoiceValues(['✅ PASS', '❌ FAIL'])
      .setRequired(true);
    form.addParagraphTextItem().setTitle(`Catatan Multi TC-${i}`);
  }
  
  // Section 6: Mode Belajar
  form.addPageBreakItem().setTitle('🎓 FITUR 4: Mode Belajar');
  ['Ringkasan', 'Kearifan Lokal', 'Tokoh', 'Significance'].forEach(card => {
    form.addMultipleChoiceItem()
      .setTitle(`Card: ${card}`)
      .setChoiceValues(['✅ PASS', '⚠️ PARTIAL', '❌ FAIL'])
      .setRequired(true);
  });
  form.addScaleItem().setTitle('Quiz: Berapa jawaban AI benar?').setBounds(0,5).setRequired(true);
  
  // Section 7: Knowledge Graph
  form.addPageBreakItem().setTitle('🔮 FITUR 5: Knowledge Graph');
  form.addMultipleChoiceItem().setTitle('Akurasi Nodes').setChoiceValues(['✅ PASS', '⚠️ PARTIAL', '❌ FAIL']).setRequired(true);
  form.addMultipleChoiceItem().setTitle('Akurasi Edges').setChoiceValues(['✅ PASS', '⚠️ PARTIAL', '❌ FAIL']).setRequired(true);
  form.addMultipleChoiceItem().setTitle('Interaktivitas').setChoiceValues(['✅ PASS', '⚠️ PARTIAL', '❌ FAIL']).setRequired(true);
  
  // Section 8: Checklist
  form.addPageBreakItem().setTitle('✅ Checklist Parameter');
  const antiHal = form.addCheckboxItem().setTitle('Anti-Halusinasi');
  antiHal.setChoices([
    antiHal.createChoice('Tidak mengarang tokoh/fakta'),
    antiHal.createChoice('Mengakui jika tidak tahu'),
    antiHal.createChoice('Mengoreksi misinformasi'),
    antiHal.createChoice('Semua klaim ada sumbernya')
  ]);
  
  // Section 9: Red Flags & Final
  form.addPageBreakItem().setTitle('🚨 Red Flags & Final Assessment');
  const redFlags = form.addCheckboxItem().setTitle('Red Flags Ditemukan?');
  redFlags.setChoices([
    redFlags.createChoice('❌ Fabricated Characters'),
    redFlags.createChoice('❌ Fabricated Facts'),
    redFlags.createChoice('❌ Misattribution'),
    redFlags.createChoice('❌ Confident Hallucination'),
    redFlags.createChoice('✅ Tidak ada issues')
  ]);
  
  form.addParagraphTextItem().setTitle('Deskripsi Issues').setRequired(false);
  form.addFileUploadItem().setTitle('Screenshot (Opsional)');
  form.addParagraphTextItem().setTitle('📊 Ringkasan Skor').setRequired(true);
  form.addParagraphTextItem().setTitle('💡 Rekomendasi').setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('🎯 Final Recommendation')
    .setChoiceValues(['✅ PASS - Siap deploy', '⚠️ CONDITIONAL - Deploy dgn fixes', '❌ FAIL - Perlu major fixes', '🔄 NEEDS RETEST'])
    .setRequired(true);
  
  // Link to Sheets
  const sheet = SpreadsheetApp.create('📊 Verifikasi Nala Pustaka - Responses');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
  
  // Send email
  const email = Session.getActiveUser().getEmail();
  MailApp.sendEmail(
    email,
    '✅ Form Verifikasi Berhasil Dibuat!',
    `Form URL: ${form.getPublishedUrl()}\nEdit URL: ${form.getEditUrl()}\nSheets: ${sheet.getUrl()}`
  );
  
  Logger.log('✅ Success! Form URL: ' + form.getPublishedUrl());
  return form.getPublishedUrl();
}
