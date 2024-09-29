const getCountryName = (countryCode: string) => {
  const countryNames: Record<string, string> = {
    af: 'Afghanistan',
    al: 'Albania',
    dz: 'Algeria',
    as: 'American Samoa',
    ad: 'Andorra',
    ao: 'Angola',
    ai: 'Anguilla',
    aq: 'Antarctica',
    ag: 'Antigua and Barbuda',
    ar: 'Argentina',
    am: 'Armenia',
    aw: 'Aruba',
    au: 'Australia',
    at: 'Austria',
    az: 'Azerbaijan',
    bs: 'Bahamas',
    bh: 'Bahrain',
    bd: 'Bangladesh',
    bb: 'Barbados',
    by: 'Belarus',
    be: 'Belgium',
    bz: 'Belize',
    bj: 'Benin',
    bm: 'Bermuda',
    bt: 'Bhutan',
    bo: 'Bolivia',
    ba: 'Bosnia and Herzegovina',
    bw: 'Botswana',
    br: 'Brazil',
    io: 'British Indian Ocean Territory',
    bn: 'Brunei Darussalam',
    bg: 'Bulgaria',
    bf: 'Burkina Faso',
    bi: 'Burundi',
    cc: 'Cocos (Keeling) Islands',
    cv: 'Cabo Verde',
    kh: 'Cambodia',
    cm: 'Cameroon',
    ca: 'Canada',
    ky: 'Cayman Islands',
    cf: 'Central African Republic',
    td: 'Chad',
    cl: 'Chile',
    cn: 'China',
    co: 'Colombia',
    km: 'Comoros',
    cg: 'Congo',
    cd: 'Congo (Democratic Republic)',
    ck: 'Cook Islands',
    cr: 'Costa Rica',
    hr: 'Croatia',
    cu: 'Cuba',
    cy: 'Cyprus',
    cz: 'Czechia',
    dk: 'Denmark',
    dj: 'Djibouti',
    dm: 'Dominica',
    do: 'Dominican Republic',
    ec: 'Ecuador',
    eg: 'Egypt',
    sv: 'El Salvador',
    gq: 'Equatorial Guinea',
    er: 'Eritrea',
    ee: 'Estonia',
    sz: 'Eswatini',
    et: 'Ethiopia',
    fj: 'Fiji',
    fi: 'Finland',
    fr: 'France',
    gf: 'French Guiana',
    pf: 'French Polynesia',
    ga: 'Gabon',
    gm: 'Gambia',
    ge: 'Georgia',
    de: 'Germany',
    gh: 'Ghana',
    gi: 'Gibraltar',
    gr: 'Greece',
    gl: 'Greenland',
    gd: 'Grenada',
    gp: 'Guadeloupe',
    gu: 'Guam',
    gt: 'Guatemala',
    gg: 'Guernsey',
    gn: 'Guinea',
    gw: 'Guinea-Bissau',
    gy: 'Guyana',
    ht: 'Haiti',
    hn: 'Honduras',
    hk: 'Hong Kong',
    hu: 'Hungary',
    is: 'Iceland',
    in: 'India',
    id: 'Indonesia',
    ir: 'Iran',
    iq: 'Iraq',
    ie: 'Ireland',
    im: 'Isle of Man',
    il: 'Israel',
    it: 'Italy',
    jm: 'Jamaica',
    jp: 'Japan',
    je: 'Jersey',
    jo: 'Jordan',
    kz: 'Kazakhstan',
    ke: 'Kenya',
    ki: 'Kiribati',
    kp: 'Korea (North)',
    kr: 'Korea (South)',
    kw: 'Kuwait',
    kg: 'Kyrgyzstan',
    la: 'Laos',
    lv: 'Latvia',
    lb: 'Lebanon',
    ls: 'Lesotho',
    lr: 'Liberia',
    ly: 'Libya',
    li: 'Liechtenstein',
    lt: 'Lithuania',
    lu: 'Luxembourg',
    mo: 'Macao',
    mg: 'Madagascar',
    mw: 'Malawi',
    my: 'Malaysia',
    mv: 'Maldives',
    ml: 'Mali',
    mt: 'Malta',
    mh: 'Marshall Islands',
    mq: 'Martinique',
    mr: 'Mauritania',
    mu: 'Mauritius',
    yt: 'Mayotte',
    mx: 'Mexico',
    fm: 'Micronesia',
    md: 'Moldova',
    mc: 'Monaco',
    mn: 'Mongolia',
    me: 'Montenegro',
    ms: 'Montserrat',
    ma: 'Morocco',
    mz: 'Mozambique',
    mm: 'Myanmar',
    na: 'Namibia',
    nr: 'Nauru',
    np: 'Nepal',
    nl: 'Netherlands',
    nc: 'New Caledonia',
    nz: 'New Zealand',
    ni: 'Nicaragua',
    ne: 'Niger',
    ng: 'Nigeria',
    nu: 'Niue',
    nf: 'Norfolk Island',
    mp: 'Northern Mariana Islands',
    no: 'Norway',
    om: 'Oman',
    pk: 'Pakistan',
    pw: 'Palau',
    ps: 'Palestine',
    pa: 'Panama',
    pg: 'Papua New Guinea',
    py: 'Paraguay',
    pe: 'Peru',
    ph: 'Philippines',
    pl: 'Poland',
    pt: 'Portugal',
    pr: 'Puerto Rico',
    qa: 'Qatar',
    ro: 'Romania',
    ru: 'Russia',
    rw: 'Rwanda',
    re: 'Réunion',
    bl: 'Saint Barthélemy',
    sh: 'Saint Helena',
    kn: 'Saint Kitts and Nevis',
    lc: 'Saint Lucia',
    mf: 'Saint Martin',
    pm: 'Saint Pierre and Miquelon',
    vc: 'Saint Vincent and the Grenadines',
    ws: 'Samoa',
    sm: 'San Marino',
    st: 'Sao Tome and Principe',
    sa: 'Saudi Arabia',
    sn: 'Senegal',
    rs: 'Serbia',
    sc: 'Seychelles',
    sl: 'Sierra Leone',
    sg: 'Singapore',
    sx: 'Sint Maarten',
    sk: 'Slovakia',
    si: 'Slovenia',
    sb: 'Solomon Islands',
    so: 'Somalia',
    za: 'South Africa',
    ss: 'South Sudan',
    es: 'Spain',
    lk: 'Sri Lanka',
    sd: 'Sudan',
    sr: 'Suriname',
    se: 'Sweden',
    ch: 'Switzerland',
    sy: 'Syria',
    tw: 'Taiwan',
    tj: 'Tajikistan',
    tz: 'Tanzania',
    th: 'Thailand',
    tl: 'Timor-Leste',
    tg: 'Togo',
    tk: 'Tokelau',
    to: 'Tonga',
    tt: 'Trinidad and Tobago',
    tn: 'Tunisia',
    tr: 'Turkey',
    tm: 'Turkmenistan',
    tv: 'Tuvalu',
    ug: 'Uganda',
    ua: 'Ukraine',
    ae: 'United Arab Emirates',
    gb: 'United Kingdom',
    us: 'United States',
    uy: 'Uruguay',
    uz: 'Uzbekistan',
    vu: 'Vanuatu',
    ve: 'Venezuela',
    vn: 'Vietnam',
    wf: 'Wallis and Futuna',
    eh: 'Western Sahara',
    ye: 'Yemen',
    zm: 'Zambia',
    zw: 'Zimbabwe',
  };

  const countryLower = countryCode.toLowerCase();

  return countryNames[countryLower] || `Unknown Country: ${countryLower}`;
};

export default getCountryName;