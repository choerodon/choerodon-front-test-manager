// HumanizeDuration.js - https://git.io/j0HgmQ

(function () {
  // This has to be defined separately because of a bug: we want to alias
  // `gr` and `el` for backwards-compatiblity. In a breaking change, we can
  // remove `gr` entirely.
  // See https://github.com/EvanHahn/HumanizeDuration.js/issues/143 for more.
  let greek = {
    y (c) { return c === 1 ? 'χρόνος' : 'χρόνια' },
    mo (c) { return c === 1 ? 'μήνας' : 'μήνες' },
    w (c) { return c === 1 ? 'εβδομάδα' : 'εβδομάδες' },
    d (c) { return c === 1 ? 'μέρα' : 'μέρες' },
    h (c) { return c === 1 ? 'ώρα' : 'ώρες' },
    m (c) { return c === 1 ? 'λεπτό' : 'λεπτά' },
    s (c) { return c === 1 ? 'δευτερόλεπτο' : 'δευτερόλεπτα' },
    ms (c) { return c === 1 ? 'χιλιοστό του δευτερολέπτου' : 'χιλιοστά του δευτερολέπτου' },
    decimal: ',',
  };

  let languages = {
    ar: {
      y (c) { return c === 1 ? 'سنة' : 'سنوات' },
      mo (c) { return c === 1 ? 'شهر' : 'أشهر' },
      w (c) { return c === 1 ? 'أسبوع' : 'أسابيع' },
      d (c) { return c === 1 ? 'يوم' : 'أيام' },
      h (c) { return c === 1 ? 'ساعة' : 'ساعات' },
      m (c) {
        return ['دقيقة', 'دقائق'][getArabicForm(c)]
      },
      s (c) { return c === 1 ? 'ثانية' : 'ثواني' },
      ms (c) { return c === 1 ? 'جزء من الثانية' : 'أجزاء من الثانية' },
      decimal: ',',
    },
    bg: {
      y (c) { return ['години', 'година', 'години'][getSlavicForm(c)] },
      mo (c) { return ['месеца', 'месец', 'месеца'][getSlavicForm(c)] },
      w (c) { return ['седмици', 'седмица', 'седмици'][getSlavicForm(c)] },
      d (c) { return ['дни', 'ден', 'дни'][getSlavicForm(c)] },
      h (c) { return ['часа', 'час', 'часа'][getSlavicForm(c)] },
      m (c) { return ['минути', 'минута', 'минути'][getSlavicForm(c)] },
      s (c) { return ['секунди', 'секунда', 'секунди'][getSlavicForm(c)] },
      ms (c) { return ['милисекунди', 'милисекунда', 'милисекунди'][getSlavicForm(c)] },
      decimal: ',',
    },
    ca: {
      y (c) { return 'any' + (c === 1 ? '' : 's') },
      mo (c) { return 'mes' + (c === 1 ? '' : 'os') },
      w (c) { return 'setman' + (c === 1 ? 'a' : 'es') },
      d (c) { return 'di' + (c === 1 ? 'a' : 'es') },
      h (c) { return 'hor' + (c === 1 ? 'a' : 'es') },
      m (c) { return 'minut' + (c === 1 ? '' : 's') },
      s (c) { return 'segon' + (c === 1 ? '' : 's') },
      ms (c) { return 'milisegon' + (c === 1 ? '' : 's') },
      decimal: ',',
    },
    cs: {
      y (c) { return ['rok', 'roku', 'roky', 'let'][getCzechOrSlovakForm(c)] },
      mo (c) { return ['měsíc', 'měsíce', 'měsíce', 'měsíců'][getCzechOrSlovakForm(c)] },
      w (c) { return ['týden', 'týdne', 'týdny', 'týdnů'][getCzechOrSlovakForm(c)] },
      d (c) { return ['den', 'dne', 'dny', 'dní'][getCzechOrSlovakForm(c)] },
      h (c) { return ['hodina', 'hodiny', 'hodiny', 'hodin'][getCzechOrSlovakForm(c)] },
      m (c) { return ['minuta', 'minuty', 'minuty', 'minut'][getCzechOrSlovakForm(c)] },
      s (c) { return ['sekunda', 'sekundy', 'sekundy', 'sekund'][getCzechOrSlovakForm(c)] },
      ms (c) { return ['milisekunda', 'milisekundy', 'milisekundy', 'milisekund'][getCzechOrSlovakForm(c)] },
      decimal: ',',
    },
    da: {
      y: 'år',
      mo (c) { return 'måned' + (c === 1 ? '' : 'er') },
      w (c) { return 'uge' + (c === 1 ? '' : 'r') },
      d (c) { return 'dag' + (c === 1 ? '' : 'e') },
      h (c) { return 'time' + (c === 1 ? '' : 'r') },
      m (c) { return 'minut' + (c === 1 ? '' : 'ter') },
      s (c) { return 'sekund' + (c === 1 ? '' : 'er') },
      ms (c) { return 'millisekund' + (c === 1 ? '' : 'er') },
      decimal: ',',
    },
    de: {
      y (c) { return 'Jahr' + (c === 1 ? '' : 'e') },
      mo (c) { return 'Monat' + (c === 1 ? '' : 'e') },
      w (c) { return 'Woche' + (c === 1 ? '' : 'n') },
      d (c) { return 'Tag' + (c === 1 ? '' : 'e') },
      h (c) { return 'Stunde' + (c === 1 ? '' : 'n') },
      m (c) { return 'Minute' + (c === 1 ? '' : 'n') },
      s (c) { return 'Sekunde' + (c === 1 ? '' : 'n') },
      ms (c) { return 'Millisekunde' + (c === 1 ? '' : 'n') },
      decimal: ',',
    },
    el: greek,
    en: {
      y (c) { return 'year' + (c === 1 ? '' : 's') },
      mo (c) { return 'month' + (c === 1 ? '' : 's') },
      w (c) { return 'week' + (c === 1 ? '' : 's') },
      d (c) { return 'day' + (c === 1 ? '' : 's') },
      h (c) { return 'hour' + (c === 1 ? '' : 's') },
      m (c) { return 'minute' + (c === 1 ? '' : 's') },
      s (c) { return 'second' + (c === 1 ? '' : 's') },
      ms (c) { return 'millisecond' + (c === 1 ? '' : 's') },
      decimal: '.',
    },
    es: {
      y (c) { return 'año' + (c === 1 ? '' : 's') },
      mo (c) { return 'mes' + (c === 1 ? '' : 'es') },
      w (c) { return 'semana' + (c === 1 ? '' : 's') },
      d (c) { return 'día' + (c === 1 ? '' : 's') },
      h (c) { return 'hora' + (c === 1 ? '' : 's') },
      m (c) { return 'minuto' + (c === 1 ? '' : 's') },
      s (c) { return 'segundo' + (c === 1 ? '' : 's') },
      ms (c) { return 'milisegundo' + (c === 1 ? '' : 's') },
      decimal: ',',
    },
    fa: {
      y: 'سال',
      mo: 'ماه',
      w: 'هفته',
      d: 'روز',
      h: 'ساعت',
      m: 'دقیقه',
      s: 'ثانیه',
      ms: 'میلی ثانیه',
      decimal: '.',
    },
    fi: {
      y (c) { return c === 1 ? 'vuosi' : 'vuotta' },
      mo (c) { return c === 1 ? 'kuukausi' : 'kuukautta' },
      w (c) { return 'viikko' + (c === 1 ? '' : 'a') },
      d (c) { return 'päivä' + (c === 1 ? '' : 'ä') },
      h (c) { return 'tunti' + (c === 1 ? '' : 'a') },
      m (c) { return 'minuutti' + (c === 1 ? '' : 'a') },
      s (c) { return 'sekunti' + (c === 1 ? '' : 'a') },
      ms (c) { return 'millisekunti' + (c === 1 ? '' : 'a') },
      decimal: ',',
    },
    fr: {
      y (c) { return 'an' + (c >= 2 ? 's' : '') },
      mo: 'mois',
      w (c) { return 'semaine' + (c >= 2 ? 's' : '') },
      d (c) { return 'jour' + (c >= 2 ? 's' : '') },
      h (c) { return 'heure' + (c >= 2 ? 's' : '') },
      m (c) { return 'minute' + (c >= 2 ? 's' : '') },
      s (c) { return 'seconde' + (c >= 2 ? 's' : '') },
      ms (c) { return 'milliseconde' + (c >= 2 ? 's' : '') },
      decimal: ',',
    },
    gr: greek,
    hr: {
      y (c) {
        if (c % 10 === 2 || c % 10 === 3 || c % 10 === 4) {
          return 'godine'
        }
        return 'godina'
      },
      mo (c) {
        if (c === 1) {
          return 'mjesec'
        } else if (c === 2 || c === 3 || c === 4) {
          return 'mjeseca'
        }
        return 'mjeseci'
      },
      w (c) {
        if (c % 10 === 1 && c !== 11) {
          return 'tjedan'
        }
        return 'tjedna'
      },
      d (c) { return c === 1 ? 'dan' : 'dana' },
      h (c) {
        if (c === 1) {
          return 'sat'
        } else if (c === 2 || c === 3 || c === 4) {
          return 'sata'
        }
        return 'sati'
      },
      m (c) {
        var mod10 = c % 10
        if ((mod10 === 2 || mod10 === 3 || mod10 === 4) && (c < 10 || c > 14)) {
          return 'minute'
        }
        return 'minuta'
      },
      s (c) {
        if ((c === 10 || c === 11 || c === 12 || c === 13 || c === 14 || c === 16 || c === 17 || c === 18 || c === 19) || (c % 10 === 5)) {
          return 'sekundi'
        } else if (c % 10 === 1) {
          return 'sekunda'
        } else if (c % 10 === 2 || c % 10 === 3 || c % 10 === 4) {
          return 'sekunde'
        }
        return 'sekundi'
      },
      ms (c) {
        if (c === 1) {
          return 'milisekunda'
        } else if (c % 10 === 2 || c % 10 === 3 || c % 10 === 4) {
          return 'milisekunde'
        }
        return 'milisekundi'
      },
      decimal: ',',
    },
    hu: {
      y: 'év',
      mo: 'hónap',
      w: 'hét',
      d: 'nap',
      h: 'óra',
      m: 'perc',
      s: 'másodperc',
      ms: 'ezredmásodperc',
      decimal: ',',
    },
    id: {
      y: 'tahun',
      mo: 'bulan',
      w: 'minggu',
      d: 'hari',
      h: 'jam',
      m: 'menit',
      s: 'detik',
      ms: 'milidetik',
      decimal: '.',
    },
    is: {
      y: 'ár',
      mo (c) { return 'mánuð' + (c === 1 ? 'ur' : 'ir') },
      w (c) { return 'vik' + (c === 1 ? 'a' : 'ur') },
      d (c) { return 'dag' + (c === 1 ? 'ur' : 'ar') },
      h (c) { return 'klukkutím' + (c === 1 ? 'i' : 'ar') },
      m (c) { return 'mínút' + (c === 1 ? 'a' : 'ur') },
      s (c) { return 'sekúnd' + (c === 1 ? 'a' : 'ur') },
      ms (c) { return 'millisekúnd' + (c === 1 ? 'a' : 'ur') },
      decimal: '.',
    },
    it: {
      y (c) { return 'ann' + (c === 1 ? 'o' : 'i') },
      mo (c) { return 'mes' + (c === 1 ? 'e' : 'i') },
      w (c) { return 'settiman' + (c === 1 ? 'a' : 'e') },
      d (c) { return 'giorn' + (c === 1 ? 'o' : 'i') },
      h (c) { return 'or' + (c === 1 ? 'a' : 'e') },
      m (c) { return 'minut' + (c === 1 ? 'o' : 'i') },
      s (c) { return 'second' + (c === 1 ? 'o' : 'i') },
      ms (c) { return 'millisecond' + (c === 1 ? 'o' : 'i') },
      decimal: ',',
    },
    ja: {
      y: '年',
      mo: '月',
      w: '週',
      d: '日',
      h: '時間',
      m: '分',
      s: '秒',
      ms: 'ミリ秒',
      decimal: '.',
    },
    ko: {
      y: '년',
      mo: '개월',
      w: '주일',
      d: '일',
      h: '시간',
      m: '분',
      s: '초',
      ms: '밀리 초',
      decimal: '.',
    },
    lo: {
      y: 'ປີ',
      mo: 'ເດືອນ',
      w: 'ອາທິດ',
      d: 'ມື້',
      h: 'ຊົ່ວໂມງ',
      m: 'ນາທີ',
      s: 'ວິນາທີ',
      ms: 'ມິນລິວິນາທີ',
      decimal: ',',
    },
    lt: {
      y (c) { return ((c % 10 === 0) || (c % 100 >= 10 && c % 100 <= 20)) ? 'metų' : 'metai' },
      mo (c) { return ['mėnuo', 'mėnesiai', 'mėnesių'][getLithuanianForm(c)] },
      w (c) { return ['savaitė', 'savaitės', 'savaičių'][getLithuanianForm(c)] },
      d (c) { return ['diena', 'dienos', 'dienų'][getLithuanianForm(c)] },
      h (c) { return ['valanda', 'valandos', 'valandų'][getLithuanianForm(c)] },
      m (c) { return ['minutė', 'minutės', 'minučių'][getLithuanianForm(c)] },
      s (c) { return ['sekundė', 'sekundės', 'sekundžių'][getLithuanianForm(c)] },
      ms (c) { return ['milisekundė', 'milisekundės', 'milisekundžių'][getLithuanianForm(c)] },
      decimal: ',',
    },
    ms: {
      y: 'tahun',
      mo: 'bulan',
      w: 'minggu',
      d: 'hari',
      h: 'jam',
      m: 'minit',
      s: 'saat',
      ms: 'milisaat',
      decimal: '.',
    },
    nl: {
      y: 'jaar',
      mo (c) { return c === 1 ? 'maand' : 'maanden' },
      w (c) { return c === 1 ? 'week' : 'weken' },
      d (c) { return c === 1 ? 'dag' : 'dagen' },
      h: 'uur',
      m (c) { return c === 1 ? 'minuut' : 'minuten' },
      s (c) { return c === 1 ? 'seconde' : 'seconden' },
      ms (c) { return c === 1 ? 'milliseconde' : 'milliseconden' },
      decimal: ',',
    },
    no: {
      y: 'år',
      mo (c) { return 'måned' + (c === 1 ? '' : 'er') },
      w (c) { return 'uke' + (c === 1 ? '' : 'r') },
      d (c) { return 'dag' + (c === 1 ? '' : 'er') },
      h (c) { return 'time' + (c === 1 ? '' : 'r') },
      m (c) { return 'minutt' + (c === 1 ? '' : 'er') },
      s (c) { return 'sekund' + (c === 1 ? '' : 'er') },
      ms (c) { return 'millisekund' + (c === 1 ? '' : 'er') },
      decimal: ',',
    },
    pl: {
      y (c) { return ['rok', 'roku', 'lata', 'lat'][getPolishForm(c)] },
      mo (c) { return ['miesiąc', 'miesiąca', 'miesiące', 'miesięcy'][getPolishForm(c)] },
      w (c) { return ['tydzień', 'tygodnia', 'tygodnie', 'tygodni'][getPolishForm(c)] },
      d (c) { return ['dzień', 'dnia', 'dni', 'dni'][getPolishForm(c)] },
      h (c) { return ['godzina', 'godziny', 'godziny', 'godzin'][getPolishForm(c)] },
      m (c) { return ['minuta', 'minuty', 'minuty', 'minut'][getPolishForm(c)] },
      s (c) { return ['sekunda', 'sekundy', 'sekundy', 'sekund'][getPolishForm(c)] },
      ms (c) { return ['milisekunda', 'milisekundy', 'milisekundy', 'milisekund'][getPolishForm(c)] },
      decimal: ',',
    },
    pt: {
      y (c) { return 'ano' + (c === 1 ? '' : 's') },
      mo (c) { return c === 1 ? 'mês' : 'meses' },
      w (c) { return 'semana' + (c === 1 ? '' : 's') },
      d (c) { return 'dia' + (c === 1 ? '' : 's') },
      h (c) { return 'hora' + (c === 1 ? '' : 's') },
      m (c) { return 'minuto' + (c === 1 ? '' : 's') },
      s (c) { return 'segundo' + (c === 1 ? '' : 's') },
      ms (c) { return 'milissegundo' + (c === 1 ? '' : 's') },
      decimal: ',',
    },
    ru: {
      y (c) { return ['лет', 'год', 'года'][getSlavicForm(c)] },
      mo (c) { return ['месяцев', 'месяц', 'месяца'][getSlavicForm(c)] },
      w (c) { return ['недель', 'неделя', 'недели'][getSlavicForm(c)] },
      d (c) { return ['дней', 'день', 'дня'][getSlavicForm(c)] },
      h (c) { return ['часов', 'час', 'часа'][getSlavicForm(c)] },
      m (c) { return ['минут', 'минута', 'минуты'][getSlavicForm(c)] },
      s (c) { return ['секунд', 'секунда', 'секунды'][getSlavicForm(c)] },
      ms (c) { return ['миллисекунд', 'миллисекунда', 'миллисекунды'][getSlavicForm(c)] },
      decimal: ',',
    },
    uk: {
      y (c) { return ['років', 'рік', 'роки'][getSlavicForm(c)] },
      mo (c) { return ['місяців', 'місяць', 'місяці'][getSlavicForm(c)] },
      w (c) { return ['тижнів', 'тиждень', 'тижні'][getSlavicForm(c)] },
      d (c) { return ['днів', 'день', 'дні'][getSlavicForm(c)] },
      h (c) { return ['годин', 'година', 'години'][getSlavicForm(c)] },
      m (c) { return ['хвилин', 'хвилина', 'хвилини'][getSlavicForm(c)] },
      s (c) { return ['секунд', 'секунда', 'секунди'][getSlavicForm(c)] },
      ms (c) { return ['мілісекунд', 'мілісекунда', 'мілісекунди'][getSlavicForm(c)] },
      decimal: ',',
    },
    ur: {
      y: 'سال',
      mo (c) { return c === 1 ? 'مہینہ' : 'مہینے' },
      w (c) { return c === 1 ? 'ہفتہ' : 'ہفتے' },
      d: 'دن',
      h (c) { return c === 1 ? 'گھنٹہ' : 'گھنٹے' },
      m: 'منٹ',
      s: 'سیکنڈ',
      ms: 'ملی سیکنڈ',
      decimal: '.',
    },
    sk: {
      y (c) { return ['rok', 'roky', 'roky', 'rokov'][getCzechOrSlovakForm(c)] },
      mo (c) { return ['mesiac', 'mesiace', 'mesiace', 'mesiacov'][getCzechOrSlovakForm(c)] },
      w (c) { return ['týždeň', 'týždne', 'týždne', 'týždňov'][getCzechOrSlovakForm(c)] },
      d (c) { return ['deň', 'dni', 'dni', 'dní'][getCzechOrSlovakForm(c)] },
      h (c) { return ['hodina', 'hodiny', 'hodiny', 'hodín'][getCzechOrSlovakForm(c)] },
      m (c) { return ['minúta', 'minúty', 'minúty', 'minút'][getCzechOrSlovakForm(c)] },
      s (c) { return ['sekunda', 'sekundy', 'sekundy', 'sekúnd'][getCzechOrSlovakForm(c)] },
      ms (c) { return ['milisekunda', 'milisekundy', 'milisekundy', 'milisekúnd'][getCzechOrSlovakForm(c)] },
      decimal: ',',
    },
    sv: {
      y: 'år',
      mo (c) { return 'månad' + (c === 1 ? '' : 'er') },
      w (c) { return 'veck' + (c === 1 ? 'a' : 'or') },
      d (c) { return 'dag' + (c === 1 ? '' : 'ar') },
      h (c) { return 'timm' + (c === 1 ? 'e' : 'ar') },
      m (c) { return 'minut' + (c === 1 ? '' : 'er') },
      s (c) { return 'sekund' + (c === 1 ? '' : 'er') },
      ms (c) { return 'millisekund' + (c === 1 ? '' : 'er') },
      decimal: ',',
    },
    tr: {
      y: 'yıl',
      mo: 'ay',
      w: 'hafta',
      d: 'gün',
      h: 'saat',
      m: 'dakika',
      s: 'saniye',
      ms: 'milisaniye',
      decimal: ',',
    },
    vi: {
      y: 'năm',
      mo: 'tháng',
      w: 'tuần',
      d: 'ngày',
      h: 'giờ',
      m: 'phút',
      s: 'giây',
      ms: 'mili giây',
      decimal: ',',
    },
    zh_CN: {
      y: '年',
      mo: '个月',
      w: '周',
      d: '天',
      h: '小时',
      m: '分钟',
      s: '秒',
      ms: '毫秒',
      decimal: '.',
    },
    zh_TW: {
      y: '年',
      mo: '個月',
      w: '周',
      d: '天',
      h: '小時',
      m: '分鐘',
      s: '秒',
      ms: '毫秒',
      decimal: '.',
    },
  };

  // You can create a humanizer, which returns a function with default
  // parameters.
  function humanizer(passedOptions) {
    var result = function humanizer(ms, humanizerOptions) {
      let options = extend({}, result, humanizerOptions || {});
      return doHumanization(ms, options);
    };

    return extend(result, {
      language: 'en',
      delimiter: ', ',
      spacer: ' ',
      conjunction: '',
      serialComma: true,
      units: ['y', 'mo', 'w', 'd', 'h', 'm', 's'],
      languages: {},
      round: false,
      unitMeasures: {
        y: 31557600000,
        mo: 2629800000,
        w: 604800000,
        d: 86400000,
        h: 3600000,
        m: 60000,
        s: 1000,
        ms: 1,
      },
    }, passedOptions);
  }

  // The main function is just a wrapper around a default humanizer.
  let humanizeDuration = humanizer({});

  // doHumanization does the bulk of the work.
  function doHumanization(ms, options) {
    let i; var len; var 
piece;

    // Make sure we have a positive number.
    // Has the nice sideffect of turning Number objects into primitives.
    ms = Math.abs(ms);

    let dictionary = options.languages[options.language] || languages[options.language];
    if (!dictionary) {
      throw new Error(`No language ${  dictionary  }.`);
    }

    let pieces = [];

    // Start at the top and keep removing units, bit by bit.
    let unitName; var unitMS; var 
unitCount;
    for (i = 0, len = options.units.length; i < len; i++) {
      unitName = options.units[i];
      unitMS = options.unitMeasures[unitName];

      // What's the number of full units we can fit?
      if (i + 1 === len) {
        unitCount = ms / unitMS;
      } else {
        unitCount = Math.floor(ms / unitMS);
      }

      // Add the string.
      pieces.push({
        unitCount,
        unitName,
      });

      // Remove what we just figured out.
      ms -= unitCount * unitMS;
    }

    let firstOccupiedUnitIndex = 0;
    for (i = 0; i < pieces.length; i++) {
      if (pieces[i].unitCount) {
        firstOccupiedUnitIndex = i;
        break;
      }
    }

    if (options.round) {
      let ratioToLargerUnit; var 
previousPiece;
      for (i = pieces.length - 1; i >= 0; i--) {
        piece = pieces[i];
        piece.unitCount = Math.round(piece.unitCount);

        if (i === 0) { break; }

        previousPiece = pieces[i - 1];

        ratioToLargerUnit = options.unitMeasures[previousPiece.unitName] / options.unitMeasures[piece.unitName];
        if ((piece.unitCount % ratioToLargerUnit) === 0 || (options.largest && ((options.largest - 1) < (i - firstOccupiedUnitIndex)))) {
          previousPiece.unitCount += piece.unitCount / ratioToLargerUnit;
          piece.unitCount = 0;
        }
      }
    }

    let result = [];
    for (i = 0, pieces.length; i < len; i++) {
      piece = pieces[i];
      if (piece.unitCount) {
        result.push(render(piece.unitCount, piece.unitName, dictionary, options));
      }

      if (result.length === options.largest) { break; }
    }

    if (result.length) {
      if (!options.conjunction || result.length === 1) {
        return result.join(options.delimiter);
      } else if (result.length === 2) {
        return result.join(options.conjunction);
      } else if (result.length > 2) {
        return result.slice(0, -1).join(options.delimiter) + (options.serialComma ? ',' : '') + options.conjunction + result.slice(-1);
      }
    } else {
      return render(0, options.units[options.units.length - 1], dictionary, options);
    }
  }

  function render(count, type, dictionary, options) {
    let decimal;
    if (options.decimal === void 0) {
      decimal = dictionary.decimal;
    } else {
      decimal = options.decimal;
    }

    let countStr = count.toString().replace('.', decimal);

    let dictionaryValue = dictionary[type];
    let word;
    if (typeof dictionaryValue === 'function') {
      word = dictionaryValue(count);
    } else {
      word = dictionaryValue;
    }

    return countStr + options.spacer + word;
  }

  function extend(destination) {
    let source;
    for (let i = 1; i < arguments.length; i++) {
      source = arguments[i];
      for (let prop in source) {
        if (source.hasOwnProperty(prop)) {
          destination[prop] = source[prop];
        }
      }
    }
    return destination;
  }

  // Internal helper function for Polish language.
  function getPolishForm(c) {
    if (c === 1) {
      return 0;
    } else if (Math.floor(c) !== c) {
      return 1;
    } else if (c % 10 >= 2 && c % 10 <= 4 && !(c % 100 > 10 && c % 100 < 20)) {
      return 2;
    } else {
      return 3;
    }
  }

  // Internal helper function for Russian and Ukranian languages.
  function getSlavicForm(c) {
    if (Math.floor(c) !== c) {
      return 2;
    } else if ((c % 100 >= 5 && c % 100 <= 20) || (c % 10 >= 5 && c % 10 <= 9) || c % 10 === 0) {
      return 0;
    } else if (c % 10 === 1) {
      return 1;
    } else if (c > 1) {
      return 2;
    } else {
      return 0;
    }
  }

  // Internal helper function for Slovak language.
  function getCzechOrSlovakForm(c) {
    if (c === 1) {
      return 0;
    } else if (Math.floor(c) !== c) {
      return 1;
    } else if (c % 10 >= 2 && c % 10 <= 4 && c % 100 < 10) {
      return 2;
    } else {
      return 3;
    }
  }

  // Internal helper function for Lithuanian language.
  function getLithuanianForm(c) {
    if (c === 1 || (c % 10 === 1 && c % 100 > 20)) {
      return 0;
    } else if (Math.floor(c) !== c || (c % 10 >= 2 && c % 100 > 20) || (c % 10 >= 2 && c % 100 < 10)) {
      return 1;
    } else {
      return 2;
    }
  }

  // Internal helper function for Arabic language.
  function getArabicForm(c) {
    if (c <= 2) { return 0; }
    if (c > 2 && c < 11) { return 1; }
    return 0;
  }

  humanizeDuration.getSupportedLanguages = function getSupportedLanguages() {
    let result = [];
    for (let language in languages) {
      if (languages.hasOwnProperty(language) && language !== 'gr') {
        result.push(language);
      }
    }
    return result;
  };

  humanizeDuration.humanizer = humanizer;

  if (typeof define === 'function' && define.amd) {
    define(() => {
      return humanizeDuration
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = humanizeDuration;
  } else {
    this.humanizeDuration = humanizeDuration;
  }
}()); // eslint-disable-line semi
