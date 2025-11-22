/**
 * Data Naskah Kuno Jawa
 * 
 * Format untuk menambah naskah baru:
 * {
 *   id: 'id-unik-lowercase',
 *   title: 'Judul Naskah',
 *   author: 'Nama Pengarang',
 *   description: 'Deskripsi singkat 1-2 kalimat',
 *   fullText: `Isi lengkap naskah di sini...`
 * }
 */

export const MANUSCRIPT_DATA = {
  'wulangreh': {
    id: 'wulangreh',
    title: 'Serat Wulangreh',
    author: 'Pakubuwana IV',
    category: 'Moral',
    tags: ['moral', 'etika', 'kepemimpinan', 'sastra'],
    description: 'Ajaran moral dan etika kepemimpinan Jawa.',
    fullText: `PUPUH I: DHANDHANGGULA

1. Pamedhare wasitaning ati, lumantarèna ing paSmon sinom, mring putrâ-sun kang anom, lanang wadon kang padha nèng kene, rasanen rèh kang kocap, mrih bisaa anganggo, ing wêkasan dadi uwong.

2. Aja nganti kabanjur ing lair, rèhning kabeh iku nora langgeng, pasthi bakal ilang kabèh, kang tinemu mung gawe bae, gawe becik lawan ala, kang ala den owal, kang becik den anggoa.

3. Wong urip iku kudu eling lan waspada, aja nganti keblinger lan kesasar, lakune kudu diawasi, supaya aja salah dalan, nuju marang kautaman, marga kang bener, mrih antuk kasampurnan.

4. Samubarang kang tinemu, aja sanalika dipercaya, dipikir dhisik kanthi tenang, dirumangsaa ing batin, sabab akeh perkara, kang nyleneh saka, kang sejatine iku.

5. Manungsa iku kudu tansah ngudi kamulyan, kanthi tatakrama kang becik, sopan santun kang lumrah, tindak tanduke kudu dijaga, supaya ketaman ing nugraha, saka Gusti Ingkang Maha Kuwaos.`
  },
  
  'centhini': {
    id: 'centhini',
    title: 'Serat Centhini',
    author: 'Tim Penulis Istana',
    category: 'Budaya',
    tags: ['budaya', 'ensiklopedia', 'perjalanan', 'sastra', 'sejarah'],
    description: 'Ensiklopedia kebudayaan Jawa yang komprehensif.',
    fullText: `SERAT CENTHINI - Perjalanan Sèh Amongraga

Kacarita ing nagari Giri, wonten santri prigel lan wicaksana, asmane Sèh Amongraga. Piyambakipun putra dalem kanjeng susuhunan ing Giri. Sareng sampun dewasa, Sèh Amongraga lumampah sowan dhateng para wali lan ulama ing tanah Jawi, kanthi maksud ngudi ngelmu tuwin kawruh.

Ing salebeting lampah, panjenenganipun tepang kaliyan santri-santri sanes, inggih punika Sèh Amongrasa lan Nyi Tembangraras. Sedaya mau lajeng nglampahi lelana sesarengan, ngudi kasampurnan ngelmu.

Sadangunipun lelana, Sèh Amongraga maringi piwulang bab macem-macem kawruh: babagan tembang lan karawitan, babagan tetanen lan pranatan alam, babagan tata upacara adat Jawi, babagan kasusastran lan filsafat, ugi babagan keprigelan lan kasantenan.

Serat punika ngandhut kathah sanget kawruh bab kabudayan Jawi ingkang sampun kadadosan ing jaman rumiyin. Dados tiyang saged sinau saking serat punika bab adat istiadat, tata upacara, panggenan-panggenan ingkang kramat, lan sapanunggalanipun.

Kabudayan Jawi ingkang kacritakaken ing Serat Centhini punika nyakup sanget wiyar, saking urusan padintenan ngantos bab kebatinan ingkang jero. Mila serat punika dipun wastani minangka ensiklopedia kabudayan Jawi.`
  },
  
  'kalatidha': {
    id: 'kalatidha',
    title: 'Serat Kalatidha',
    author: 'Ranggawarsita',
    category: 'Filsafat',
    tags: ['filsafat', 'refleksi', 'sosial', 'kritik', 'sastra'],
    description: 'Refleksi atas zaman yang penuh ketidakpastian.',
    fullText: `SERAT KALATIDHA - Ranggawarsita

PUPUH SINOM

Mangkya darajating praja, kawuryan wus sunyaruri, rurah pangrehing ukara, karana tanpa palupi, atilar silastuti, sujana sarjana kelu, kalulun kalatidha, tidhem tandhaning dumadi, ardayengrat dening karoban rubeda.

Ratune ratu utama, patihe patih linuwih, pra nayaka tyas raharja, panekare becik-becik, parandene tan dadi, paliyasing kalabendu, malah sangsayeng ndadra, rubeda kang ngreribedi, luwih-luwih para kawula alit.

Pedah apa aneng ngayun, sumelang ing karsa Allah, mugiya pinaringana, pra samya wilujeng sami, padhang ayuning bawana, tegese golong gilig, ginelung aeng-aeng ngumbara, temah lali ring ngaurip, eling-eling kang yekti lamun den eling.

Amenangi jaman edan, ewuh aya ing pambudi, melu edan nora tahan, yen tan melu anglakoni, boya kena kadumuk, kaliren wekasanipun, dilalah kerenane, beda lamun nora nglakoni, uger-uger kang dadi panggegepira.

Wong anom anggone kelakon, angayuh kasektene, ing wekasan samya kesed, sarehne tanpa pambiyantu, saking kadang lan mitra, temah pra anom saiki, padha kemba kasepen.`
  },

  // ===== CONTOH NASKAH BARU - DEMO =====
  // Ini adalah contoh nyata bagaimana menambahkan naskah baru
  'wedhatama': {
    id: 'wedhatama',
    title: 'Serat Wedhatama',
    author: 'KGPAA Mangkunegara IV',
    category: 'Spiritual',
    tags: ['spiritual', 'kebijaksanaan', 'ngelmu', 'sastra', 'tembang'],
    description: 'Ajaran tertinggi tentang kebijaksanaan dan kehidupan spiritual.',
    fullText: `SERAT WEDHATAMA - KGPAA Mangkunegara IV

PUPUH PANGKUR

1. Mingkar-mingkuring angkara,
Akarana karenan mardi siwi,
Sinawung resmining kidung,
Sinuba sinukarta,
Mrih kretarta pakartining ngelmu luhung,
Kang tumrap neng tanah Jawa,
Agama ageming aji.

2. Nadyan asung piwulang,
Nora tau nganggo patrap manahipun,
Iku pamomonga durung,
Sayektine punapa,
Kang winastan ngawulaa mring ing hyang agung,
Tansah empan ing papan,
Dipun padosi wiwit.

3. Poma-poma ingkang samya,
Satuhune iku prakara mung siji,
Kaanan-aanan iku,
Yen kinarya priksa,
Lamun sinau dening sarjana linuwih,
Mung amrih karahayon,
Tuwin kasarasanipun.

4. Kalamun tinemu ing laku,
Yen kinarya nglakoni kang tumemen,
Aja kanthi samar-samar,
Wajibing wong ngaurip,
Kudu marang Pangeran kang murba wisesa,
Nadyan satindak paran,
Kudu amung karsa gusti.

5. Kabeh mau kang rinasa,
Yen tinemu sayektine ing ngaurip,
Amulyakena tyasmu,
Aja nganti karoban,
Dening karep kang cidra myang angkara murka,
Sakehing tindak tanduk,
Poma den ngati-ati.

PUPUH GAMBUH

1. Sesamining dumadi,
Sakehe kang pinurba ing ngaleman donya,
Iya iku kabeh karana sangking karsa,
Ingkang Maha Kuwasa,
Dene marang manungsa iku pinaringan,
Akal pikir pangrawit.

2. Supaya bisa milih,
Laku becik kalawan kang datan prayoga,
Pramila sayogyane wong kang wus wisuda,
Kudu nganggo weweka,
Pangawak pribadi aja kongsi kalena,
Sakehing hawa nepsu.

PUPUH KINANTHI

1. Padha gulangen ing kalbu,
Ing sasmita amrih lantip,
Aja pijer mangan nendra,
Ing kaprawiran den kongsi,
Pesunen sariranira,
Sudanen dhahar lan guling.

2. Yen wus sarjana ing ngelmu,
Yen durung bisa kuwaseng diri,
Iku durung migunani,
Kinarya dening liyan,
Puniku kaurmatan luwih,
Nanging sajrone brangta.

[Catatan: Ini adalah kutipan. Serat Wedhatama asli jauh lebih panjang dengan 5 pupuh lengkap]
    `
  },
  
  // ===== TEMPLATE UNTUK NASKAH BARU =====
  // Uncomment dan edit template di bawah untuk menambah naskah baru
  
  /*
  'nitisruti': {
    id: 'nitisruti',
    title: 'Serat Nitisruti',
    author: 'Yasadipura I',
    description: 'Ajaran kebijaksanaan dan tata pemerintahan yang baik.',
    fullText: `[COPY-PASTE ISI NASKAH LENGKAP DI SINI]
    
Pupuh I: ...
Pupuh II: ...

Tips:
- Gunakan backtick (`) untuk multiline string
- Jangan gunakan quote (") di dalam teks tanpa escape
- Maksimal ~10,000 kata untuk performa optimal
- Format bebas: bisa pupuh, bab, atau paragraf biasa
    `
  },
  */

  /*
  'tripama': {
    id: 'tripama',
    title: 'Serat Tripama',
    author: 'Ranggawarsita',
    description: 'Tiga teladan utama dalam kehidupan.',
    fullText: `[ISI LENGKAP SERAT TRIPAMA]
    
...
    `
  },
  */
};

// Data Knowledge Graph untuk setiap naskah
// Update ini juga saat menambah naskah baru
export const KNOWLEDGE_GRAPH_DATA = {
  'wulangreh': {
    nodes: [
      { id: 'wulangreh', label: 'Serat Wulangreh', type: 'Karya' },
      { id: 'pb4', label: 'Pakubuwana IV', type: 'Tokoh' },
      { id: 'ajaran_moral', label: 'Ajaran Moral', type: 'Konsep' },
      { id: 'kepemimpinan', label: 'Kepemimpinan', type: 'Konsep' },
      { id: 'dhandhanggula', label: 'Pupuh Dhandhanggula', type: 'Struktur' },
      { id: 'etika', label: 'Etika', type: 'Konsep' },
      { id: 'kebijaksanaan', label: 'Kebijaksanaan', type: 'Konsep' }
    ],
    links: [
      { source: 'pb4', target: 'wulangreh', label: 'Pengarang' },
      { source: 'wulangreh', target: 'ajaran_moral', label: 'Berisi' },
      { source: 'wulangreh', target: 'kepemimpinan', label: 'Membahas' },
      { source: 'wulangreh', target: 'dhandhanggula', label: 'Dimulai dengan' },
      { source: 'ajaran_moral', target: 'etika', label: 'Terkait' },
      { source: 'kepemimpinan', target: 'kebijaksanaan', label: 'Memerlukan' }
    ]
  },
  
  'centhini': {
    nodes: [
      { id: 'centhini', label: 'Serat Centhini', type: 'Karya' },
      { id: 'tim_penulis', label: 'Tim Penulis Istana', type: 'Tokoh' },
      { id: 'amongraga', label: 'Sèh Amongraga', type: 'Tokoh' },
      { id: 'kabudayan', label: 'Kebudayaan Jawa', type: 'Konsep' },
      { id: 'lelana', label: 'Perjalanan', type: 'Konsep' },
      { id: 'ngelmu', label: 'Ilmu Pengetahuan', type: 'Konsep' }
    ],
    links: [
      { source: 'tim_penulis', target: 'centhini', label: 'Penulis' },
      { source: 'centhini', target: 'amongraga', label: 'Tokoh Utama' },
      { source: 'centhini', target: 'kabudayan', label: 'Ensiklopedia' },
      { source: 'amongraga', target: 'lelana', label: 'Menjalani' },
      { source: 'lelana', target: 'ngelmu', label: 'Mencari' }
    ]
  },
  
  'kalatidha': {
    nodes: [
      { id: 'kalatidha', label: 'Serat Kalatidha', type: 'Karya' },
      { id: 'ranggawarsita', label: 'Ranggawarsita', type: 'Tokoh' },
      { id: 'jaman_edan', label: 'Jaman Edan', type: 'Konsep' },
      { id: 'kalabendu', label: 'Kalabendu', type: 'Konsep' },
      { id: 'refleksi', label: 'Refleksi', type: 'Konsep' },
      { id: 'sinom', label: 'Pupuh Sinom', type: 'Struktur' }
    ],
    links: [
      { source: 'ranggawarsita', target: 'kalatidha', label: 'Pengarang' },
      { source: 'kalatidha', target: 'jaman_edan', label: 'Membahas' },
      { source: 'kalatidha', target: 'refleksi', label: 'Berisi' },
      { source: 'jaman_edan', target: 'kalabendu', label: 'Akibat' },
      { source: 'kalatidha', target: 'sinom', label: 'Menggunakan' }
    ]
  },

  // Demo: Knowledge Graph untuk Wedhatama
  'wedhatama': {
    nodes: [
      { id: 'wedhatama', label: 'Serat Wedhatama', type: 'Karya' },
      { id: 'mn4', label: 'Mangkunegara IV', type: 'Tokoh' },
      { id: 'ngelmu', label: 'Ilmu Sejati', type: 'Konsep' },
      { id: 'spiritual', label: 'Kebijaksanaan Spiritual', type: 'Konsep' },
      { id: 'pangkur', label: 'Pupuh Pangkur', type: 'Struktur' },
      { id: 'karsa_gusti', label: 'Kehendak Tuhan', type: 'Konsep' },
    ],
    links: [
      { source: 'mn4', target: 'wedhatama', label: 'Pengarang' },
      { source: 'wedhatama', target: 'ngelmu', label: 'Mengajarkan' },
      { source: 'wedhatama', target: 'spiritual', label: 'Membahas' },
      { source: 'wedhatama', target: 'pangkur', label: 'Dimulai dengan' },
      { source: 'ngelmu', target: 'karsa_gusti', label: 'Menuju' },
    ]
  },

  // Template untuk naskah baru - uncomment dan sesuaikan
  /*
  'nitisruti': {
    nodes: [
      { id: 'nitisruti', label: 'Serat Nitisruti', type: 'Karya' },
      { id: 'yasadipura', label: 'Yasadipura I', type: 'Tokoh' },
      { id: 'kebijaksanaan_2', label: 'Kebijaksanaan', type: 'Konsep' },
      { id: 'pemerintahan', label: 'Pemerintahan', type: 'Konsep' },
    ],
    links: [
      { source: 'yasadipura', target: 'nitisruti', label: 'Pengarang' },
      { source: 'nitisruti', target: 'kebijaksanaan_2', label: 'Mengajarkan' },
      { source: 'nitisruti', target: 'pemerintahan', label: 'Membahas' },
    ]
  },
  */
};
