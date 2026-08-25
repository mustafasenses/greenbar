// Interface copy only. The generated README is always English — see readme/panel.js.

export const T = {
  en: {
    htmlLang: 'en',
    title: 'greenbar — ASCII README from a GitHub avatar',
    form: 'form 1047 · continuous feed',
    lede:
      'Type a GitHub username. greenbar turns the avatar into an ASCII portrait, lines your ' +
      'profile details up next to it, and hands you a <span class="text-paper">README.md</span> ' +
      'to paste. It all happens in this tab — nothing is uploaded and none of your repos are touched.',
    print: 'Print',
    settings: 'Settings',

    layout: 'Layout',
    lSide: 'Side by side',
    lStack: 'Stacked',
    lAscii: 'ASCII only',
    hSide: 'Portrait on the left, your details on the right, all in one code block.',
    hStack: 'Portrait on top, your details underneath it.',
    hAscii: 'Just the portrait — no details, no links.',

    charset: 'Character set',
    sClassic: 'Classic',
    sDetailed: 'Detailed',
    sLetters: 'Letters',
    sDigits: 'Digits',
    sBlocks: 'Blocks',

    crop: 'Crop',
    cAuto: 'Auto',
    cCircle: 'Circle',
    cSquare: 'Square',
    hAuto: 'Clears plain backgrounds on its own, and crops to a circle when the background is busy.',
    hCircle: 'Good for photos — cuts away shoulders and clutter in the corners.',
    hSquare: 'Keeps the whole frame. Use it for logos and square artwork.',

    size: 'Size',
    hNarrow: 'Past 60, the details column starts to get tight.',
    hWide: 'This wide, the block will scroll sideways on phones.',

    contrast: 'Contrast',
    contrastHint: 'Tones are balanced automatically. This nudges the result either way.',

    or: 'Or',
    ownPhoto: 'Use your own photo',

    preview: 'Preview',
    vPrint: 'Printout',
    vGh: 'GitHub',
    notePrint: 'Same line height as a GitHub code block, so what you see here is what lands there.',
    noteGh: 'How the README will look on your profile. The links sit outside the code block, so they stay clickable.',
    previewEmpty: 'Enter a username and hit Print.',

    details: 'Details',
    detailsHint:
      'These are the rows in the panel. Untick anything you would rather not publish, ' +
      'rewrite a label or a value, or add rows of your own.',
    addRow: 'Add row',
    phLabel: 'Label',
    phValue: 'Value',
    secMain: 'Main',
    secContact: 'Contact',
    secStats: 'Stats',
    removeRow: 'Remove row',

    copy: 'Copy',
    copied: 'Copied',
    download: 'Download',
    outputPh: 'Your README will show up here.',
    footnote:
      'Make a public repo named exactly like your username, put this README.md inside it, and ' +
      'GitHub will pin it to the top of your profile.',
    builtBy: 'Built by',
    source: 'Source on GitHub',

    stNoUser: 'Enter a username first.',
    stFetching: 'Fetching the profile…',
    stAvatar: 'Loading the avatar and details…',
    stNoUserFound: (l) => `GitHub has no user called “${l}”.`,
    stRate: 'GitHub’s hourly request limit is full. Give it a few minutes, or upload a photo instead.',
    stHttp: (s) => `GitHub answered with ${s}. Try again in a moment.`,
    stPrinted: (n) => `Printed ${n}.`,
    stImgFail: 'That image could not be loaded.',
    stCors: 'The browser would not let us read that avatar. Upload the photo yourself from the panel on the left.',
    stFileFail: 'That file could not be read.',
    stNeedReadme: 'Nothing to take yet — print a README first.',
    stCopyFail: 'Copying failed. The text is selected, so Ctrl+C will do it.',
  },

  tr: {
    htmlLang: 'tr',
    title: 'greenbar — GitHub profil fotoğrafından ASCII README',
    form: 'form 1047 · sürekli form',
    lede:
      'Bir GitHub kullanıcı adı yaz. greenbar profil fotoğrafını ASCII portreye çevirir, ' +
      'künyeni yanına dizer ve yapıştırmaya hazır bir <span class="text-paper">README.md</span> ' +
      'verir. Her şey bu sekmede olup biter — hiçbir yere dosya yüklenmez, hiçbir repona dokunulmaz.',
    print: 'Bas',
    settings: 'Ayarlar',

    layout: 'Düzen',
    lSide: 'Yan yana',
    lStack: 'Alt alta',
    lAscii: 'Sadece ASCII',
    hSide: 'Portre solda, künyen sağda; hepsi tek bir kod bloğunda.',
    hStack: 'Portre üstte, künyen hemen altında.',
    hAscii: 'Yalnızca portre — künye de yok, link de.',

    charset: 'Karakter seti',
    sClassic: 'Klasik',
    sDetailed: 'Ayrıntılı',
    sLetters: 'Harf',
    sDigits: 'Rakam',
    sBlocks: 'Blok',

    crop: 'Kırpma',
    cAuto: 'Oto',
    cCircle: 'Daire',
    cSquare: 'Kare',
    hAuto: 'Düz zeminleri kendi siler, arka plan kalabalıksa daire keser.',
    hCircle: 'Fotoğraflar için: omuzları ve köşelerdeki dağınıklığı atar.',
    hSquare: 'Kareyi olduğu gibi bırakır. Logolar ve kare görseller için.',

    size: 'Boyut',
    hNarrow: "60'ın üstünde künye sütunu daralmaya başlıyor.",
    hWide: 'Bu genişlikte blok telefonda yana kayar.',

    contrast: 'Kontrast',
    contrastHint: 'Tonlar zaten otomatik dengeleniyor. Bu, sonucu bir yöne itmek için.',

    or: 'Veya',
    ownPhoto: 'Kendi fotoğrafını kullan',

    preview: 'Önizleme',
    vPrint: 'Baskı',
    vGh: 'GitHub',
    notePrint: 'GitHub kod bloğuyla aynı satır aralığı — burada ne görüyorsan orada da o duracak.',
    noteGh: 'README profilinde böyle görünecek. Linkler kod bloğunun dışında kaldığı için tıklanabilir.',
    previewEmpty: "Kullanıcı adını yaz ve Bas'a tıkla.",

    details: 'Künye',
    detailsHint:
      'Paneldeki satırlar bunlar. Yayımlamak istemediklerinin işaretini kaldır, ' +
      'etiketini ya da değerini değiştir, veya kendi satırlarını ekle.',
    addRow: 'Satır ekle',
    phLabel: 'Etiket',
    phValue: 'Değer',
    secMain: 'Genel',
    secContact: 'İletişim',
    secStats: 'İstatistik',
    removeRow: 'Satırı sil',

    copy: 'Kopyala',
    copied: 'Kopyalandı',
    download: 'İndir',
    outputPh: 'Ürettiğin README burada görünecek.',
    footnote:
      'Kullanıcı adınla birebir aynı isimde public bir repo aç, bu README.md dosyasını içine koy; ' +
      'GitHub onu profilinin en üstüne sabitler.',
    builtBy: 'Geliştirici:',
    source: "GitHub'da kaynak kodu",

    stNoUser: 'Önce bir kullanıcı adı yaz.',
    stFetching: 'Profil alınıyor…',
    stAvatar: 'Avatar ve künye yükleniyor…',
    stNoUserFound: (l) => `GitHub'da "${l}" diye bir kullanıcı yok.`,
    stRate: "GitHub'ın saatlik istek hakkı doldu. Birkaç dakika sonra dene ya da kendi fotoğrafını yükle.",
    stHttp: (s) => `GitHub ${s} döndürdü. Birazdan tekrar dene.`,
    stPrinted: (n) => `${n} basıldı.`,
    stImgFail: 'Bu görsel yüklenemedi.',
    stCors: 'Tarayıcı bu avatarı okumamıza izin vermedi. Soldaki panelden fotoğrafı kendin yükle.',
    stFileFail: 'Bu dosya okunamadı.',
    stNeedReadme: 'Henüz alınacak bir şey yok — önce bir README bas.',
    stCopyFail: 'Kopyalanamadı. Metin seçili, Ctrl+C ile alabilirsin.',
  },
};

export const DEFAULT_LANG = 'en';
