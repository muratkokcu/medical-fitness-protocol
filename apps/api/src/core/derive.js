const { assessment } = require('@medical-fitness/shared-config');

// Get assessment database and medical ranges
function getAssessmentDatabase(language = 'tr') {
  return assessment.getDatabase(language);
}

function getMedicalRanges() {
  return assessment.getMedicalRanges();
}

// Assessment Engine - Convert form data to report structure
function assessFormData(formData) {
  const data = {};

  // Convert FormData to object (handling arrays for checkboxes)
  for (let [key, value] of Object.entries(formData)) {
    if (data[key]) {
      if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  }

  // Calculate derived values
  if (data.waist && data.hip) {
    data.waist_hip_ratio = (parseFloat(data.waist) / parseFloat(data.hip)).toFixed(2);
  }

  if (data.height && data.weight) {
    const heightM = parseFloat(data.height) / 100;
    data.bmi = (parseFloat(data.weight) / (heightM * heightM)).toFixed(1);
  }

  if (data.systolic && data.diastolic) {
    data.blood_pressure = `${data.systolic}/${data.diastolic}`;
  }

  // Convert time values
  if (data.plank_minutes || data.plank_seconds) {
    const minutes = parseInt(data.plank_minutes || 0);
    const seconds = parseInt(data.plank_seconds || 0);
    data.plank_total_seconds = minutes * 60 + seconds;
  }

  if (data.wallsit_minutes || data.wallsit_seconds) {
    const minutes = parseInt(data.wallsit_minutes || 0);
    const seconds = parseInt(data.wallsit_seconds || 0);
    data.wallsit_total_seconds = minutes * 60 + seconds;
  }

  // Assessment logic based on medical ranges
  const assessmentResults = {
    // Blood pressure assessment
    bp_status: assessBloodPressure(parseInt(data.systolic), parseInt(data.diastolic)),
    hr_status: assessHeartRate(parseInt(data.heart_rate)),

    // Body composition
    body_fat_status: assessBodyFat(parseFloat(data.body_fat), data.gender),
    waist_hip_status: assessWaistHip(parseFloat(data.waist_hip_ratio), data.gender),
    bmi_status: assessBMI(parseFloat(data.bmi)),

    // Strength assessments
    balance_left_status: assessBalance(parseInt(data.balance_left)),
    balance_right_status: assessBalance(parseInt(data.balance_right)),
    core_status: assessCore(data.plank_total_seconds, data.gender),
    pushup_status: assessPushup(parseInt(data.pushup_count), data.gender),
    wallsit_status: assessWallSit(data.wallsit_total_seconds, data.gender),

    // Mobility
    sit_reach_status: assessSitReach(parseFloat(data.sit_reach), data.gender)
  };

  // Generate findings and recommendations
  const findings = generateFindings(data, assessmentResults);
  const actions = generateActions(data, assessmentResults);
  const lifestyle = generateLifestyleIndicators(data, assessmentResults);

  // Calculate overall risk score
  const riskScore = calculateRiskScore(assessmentResults);

  // Convert to report format
  return {
    person: {
      name: data.name,
      birthYear: new Date().getFullYear() - parseInt(data.age),
      company: "Değerlendirme",
      date: new Date(data.date).toLocaleDateString('tr-TR'),
      duration: "Kapsamlı Test",
      level: "Tam Değerlendirme",
      priority: "Normal"
    },
    risk: {
      score: riskScore,
      label: getRiskLabel(riskScore)
    },
    kpi: {
      hr: `${data.heart_rate} bpm`,
      bp: `${data.systolic}/${data.diastolic} mmHg`,
      bmi: `${data.bmi} kg/m²`,
      activity: getActivityLevel(assessmentResults)
    },
    cardiovascular: {
      blood_pressure: { value: `${data.systolic}/${data.diastolic} mmHg`, status: assessmentResults.bp_status },
      heart_rate: { value: `${data.heart_rate} bpm`, status: assessmentResults.hr_status }
    },
    body_composition: {
      body_fat: { value: `${data.body_fat}%`, status: assessmentResults.body_fat_status },
      waist_hip_ratio: { value: data.waist_hip_ratio, status: assessmentResults.waist_hip_status }
    },
    respiratory: {
      pattern: { value: getBreathingLabel(data.breathing), status: getBreathingStatus(data.breathing) },
      note: getBreathingNote(data.breathing)
    },
    mobility: {
      shoulder: { value: getShoulderLabel(data.shoulder_left, data.shoulder_right), status: getShoulderStatus(data.shoulder_left, data.shoulder_right) },
      trunk: { value: getSitReachLabel(assessmentResults.sit_reach_status), status: assessmentResults.sit_reach_status }
    },
    strength: {
      core: { value: formatTime(data.plank_total_seconds) + ` (${getStatusLabel(assessmentResults.core_status)})`, status: assessmentResults.core_status },
      upper_body: { value: data.pushup_count, status: assessmentResults.pushup_status },
      lower_body: { value: formatTime(data.wallsit_total_seconds), status: assessmentResults.wallsit_status }
    },
    findings: findings,
    actions: actions,
    metrics: generateMetricsTable(data, assessmentResults),
    lifestyle: lifestyle,
    notes: generateNotes(data, assessmentResults),

    // New dynamic data sections
    priority_areas: generatePriorityAreas(data, assessmentResults),
    gait_analysis: generateGaitAnalysis(data),
    balance_tests: generateBalanceTests(data, assessmentResults),
    posture_analysis: generatePostureAnalysis(data),
    upper_body_tests: generateUpperBodyTests(data, assessmentResults),
    lower_body_tests: generateLowerBodyTests(data, assessmentResults),

    code: `MF-TR-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
  };
}

// Assessment functions (ported from form.html)
function assessBloodPressure(systolic, diastolic) {
  if (systolic <= 120 && diastolic <= 80) return 'ok';
  if (systolic <= 140 && diastolic <= 90) return 'warn';
  return 'risk';
}

function assessHeartRate(hr) {
  if (hr >= 46 && hr <= 60) return 'ok';
  if (hr >= 60 && hr <= 80) return 'ok';
  if (hr >= 80 && hr <= 100) return 'warn';
  return 'risk';
}

function assessBodyFat(bodyFat, gender) {
  if (gender === 'erkek') {
    if (bodyFat >= 8 && bodyFat <= 12) return 'ok';
    if (bodyFat >= 13 && bodyFat <= 20) return 'ok';
    return 'risk';
  } else {
    if (bodyFat >= 14 && bodyFat <= 20) return 'ok';
    if (bodyFat >= 21 && bodyFat <= 31) return 'ok';
    return 'risk';
  }
}

function assessWaistHip(ratio, gender) {
  if (gender === 'erkek') {
    if (ratio < 0.85) return 'ok';
    if (ratio <= 0.90) return 'warn';
    return 'risk';
  } else {
    if (ratio < 0.75) return 'ok';
    if (ratio <= 0.80) return 'warn';
    return 'risk';
  }
}

function assessBMI(bmi) {
  if (bmi >= 18.5 && bmi <= 24.9) return 'ok';
  if (bmi >= 25 && bmi <= 29.9) return 'warn';
  return 'risk';
}

function assessBalance(seconds) {
  if (seconds >= 60) return 'ok';
  if (seconds >= 29) return 'warn';
  return 'risk';
}

function assessCore(seconds, gender) {
  if (gender === 'erkek') {
    if (seconds >= 180) return 'ok';
    if (seconds >= 120) return 'warn';
    return 'risk';
  } else {
    if (seconds >= 120) return 'ok';
    if (seconds >= 60) return 'warn';
    return 'risk';
  }
}

function assessPushup(count, gender) {
  if (gender === 'erkek') {
    if (count >= 20) return 'ok';
    if (count >= 10) return 'warn';
    return 'risk';
  } else {
    if (count >= 14) return 'ok';
    if (count >= 7) return 'warn';
    return 'risk';
  }
}

function assessWallSit(seconds, gender) {
  if (gender === 'erkek') {
    if (seconds >= 120) return 'ok';
    if (seconds >= 60) return 'warn';
    return 'risk';
  } else {
    if (seconds >= 90) return 'ok';
    if (seconds >= 45) return 'warn';
    return 'risk';
  }
}

function assessSitReach(distance, gender) {
  if (gender === 'erkek') {
    if (distance >= 17) return 'ok';
    if (distance >= 0) return 'warn';
    return 'risk';
  } else {
    if (distance >= 21) return 'ok';
    if (distance >= 1) return 'warn';
    return 'risk';
  }
}

// Helper functions
function calculateRiskScore(assessmentResults) {
  const values = Object.values(assessmentResults);
  const okCount = values.filter(v => v === 'ok').length;
  const warnCount = values.filter(v => v === 'warn').length;
  const riskCount = values.filter(v => v === 'risk').length;

  const totalPoints = (okCount * 3) + (warnCount * 2) + (riskCount * 1);
  const maxPoints = values.length * 3;

  return Math.round((totalPoints / maxPoints) * 100);
}

function getRiskLabel(score) {
  if (score >= 80) return 'Düşük';
  if (score >= 60) return 'Orta';
  if (score >= 40) return 'Orta-Yüksek';
  return 'Yüksek';
}

function getStatusLabel(status) {
  switch(status) {
    case 'ok': return 'İyi';
    case 'warn': return 'Orta';
    case 'risk': return 'Riskli';
    default: return 'Bilinmiyor';
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getBreathingLabel(breathing) {
  switch(breathing) {
    case 'normal': return 'Normal Solunum';
    case 'disfonksiyon': return 'Nefes Disfonksiyonu';
    case 'zayif_diyafram': return 'Zayıf Diyafram';
    case 'apikal': return 'Apikal Solunum';
    default: return 'Değerlendirilmedi';
  }
}

function getBreathingStatus(breathing) {
  return breathing === 'normal' ? 'ok' : 'risk';
}

function getBreathingNote(breathing) {
  switch(breathing) {
    case 'disfonksiyon': return 'Diyaframatik nefes eğitimi önerilir';
    case 'zayif_diyafram': return 'Diyafram güçlendirme egzersizleri gerekli';
    case 'apikal': return 'Göğüs üstü nefes alma, düzeltme gerekli';
    default: return '';
  }
}

function getShoulderLabel(left, right) {
  const labels = {iyi: 'İyi', normal: 'Normal', riskli: 'Riskli'};
  return `Sol: ${labels[left] || left}, Sağ: ${labels[right] || right}`;
}

function getShoulderStatus(left, right) {
  if (left === 'riskli' || right === 'riskli') return 'risk';
  if (left === 'normal' || right === 'normal') return 'warn';
  return 'ok';
}

function getSitReachLabel(status) {
  return getStatusLabel(status);
}

function getActivityLevel(assessmentResults) {
  const okCount = Object.values(assessmentResults).filter(v => v === 'ok').length;
  if (okCount >= 8) return 'Yüksek';
  if (okCount >= 5) return 'Orta';
  return 'Düşük';
}

// Content generation functions
function generateFindings(data, assessmentResults, language = 'tr') {
  const findings = [];
  const assessmentDB = getAssessmentDatabase(language);

  if (!assessmentDB) {
    return generateBasicFindings(data, assessmentResults);
  }

  const db = assessmentDB.findings;

  // Blood pressure findings
  if (assessmentResults.bp_status && db.blood_pressure[assessmentResults.bp_status]) {
    const bpFinding = getRandomFromArray(db.blood_pressure[assessmentResults.bp_status]);
    findings.push({
      color: getStatusColor(assessmentResults.bp_status),
      text: bpFinding
    });
  }

  // Heart rate findings
  if (assessmentResults.hr_status && db.heart_rate[assessmentResults.hr_status]) {
    const hrFinding = getRandomFromArray(db.heart_rate[assessmentResults.hr_status]);
    findings.push({
      color: getStatusColor(assessmentResults.hr_status),
      text: hrFinding
    });
  }

  // Body composition findings
  if (assessmentResults.body_fat_status !== 'ok' && db.body_fat[assessmentResults.body_fat_status]) {
    const fatFinding = getRandomFromArray(db.body_fat[assessmentResults.body_fat_status]);
    findings.push({
      color: getStatusColor(assessmentResults.body_fat_status),
      text: fatFinding
    });
  }

  if (assessmentResults.waist_hip_status !== 'ok' && db.waist_hip[assessmentResults.waist_hip_status]) {
    const whFinding = getRandomFromArray(db.waist_hip[assessmentResults.waist_hip_status]);
    findings.push({
      color: getStatusColor(assessmentResults.waist_hip_status),
      text: whFinding
    });
  }

  // Breathing findings
  if (data.breathing !== 'normal' && db.breathing && db.breathing.risk) {
    const breathingFinding = getRandomFromArray(db.breathing.risk);
    findings.push({
      color: 'var(--risk)',
      text: breathingFinding
    });
  }

  // Limit to most important findings (max 6)
  return findings.slice(0, 6);
}

function generateBasicFindings(data, assessmentResults) {
  const findings = [];

  if (assessmentResults.bp_status === 'risk') {
    findings.push({color: 'var(--risk)', text: 'Yüksek tansiyon tespit edildi. Hekime başvuru önerilir.'});
  }

  if (assessmentResults.body_fat_status === 'risk') {
    findings.push({color: 'var(--risk)', text: 'Vücut yağ oranı normal aralığın üzerinde. Beslenme ve egzersiz programı gerekli.'});
  }

  if (data.breathing !== 'normal') {
    findings.push({color: 'var(--risk)', text: 'Solunum disfonksiyonu tespit edildi. Nefes eğitimi kritik öneme sahip.'});
  }

  return findings;
}

function generateActions(data, assessmentResults, language = 'tr') {
  const actions = [];
  const assessmentDB = getAssessmentDatabase(language);

  if (!assessmentDB) {
    return generateBasicActions(data, assessmentResults);
  }

  const db = assessmentDB.actions;

  // Breathing-related actions
  if (data.breathing !== 'normal' && db.breathing) {
    const breathingAction = getRandomFromArray(db.breathing);
    actions.push({text: breathingAction, done: false});
  }

  // Cardiovascular actions
  if ((assessmentResults.bp_status === 'warn' || assessmentResults.bp_status === 'risk' ||
       assessmentResults.hr_status === 'warn' || assessmentResults.hr_status === 'risk') && db.cardiovascular) {
    const cardioAction = getRandomFromArray(db.cardiovascular);
    actions.push({text: cardioAction, done: false});
  }

  // Body composition actions
  if ((assessmentResults.body_fat_status === 'risk' || assessmentResults.waist_hip_status === 'risk') && db.lifestyle) {
    const lifestyleAction = getRandomFromArray(db.lifestyle);
    actions.push({text: lifestyleAction, done: false});
  }

  // Strength-related actions
  if ((assessmentResults.core_status !== 'ok' || assessmentResults.pushup_status !== 'ok' ||
       assessmentResults.wallsit_status !== 'ok') && db.strength) {
    const strengthAction = getRandomFromArray(db.strength);
    actions.push({text: strengthAction, done: false});
  }

  // Mobility actions
  const shoulderStatus = getWorstStatus(data.shoulder_left, data.shoulder_right);
  if ((shoulderStatus !== 'ok' || assessmentResults.sit_reach_status !== 'ok') && db.mobility) {
    const mobilityAction = getRandomFromArray(db.mobility);
    actions.push({text: mobilityAction, done: false});
  }

  // Balance actions
  if (assessmentResults.balance_left_status !== 'ok' || assessmentResults.balance_right_status !== 'ok') {
    actions.push({text: 'Denge ve propriosepsiyon egzersizleri', done: false});
  }

  // Limit to reasonable number of actions (max 7)
  return actions.slice(0, 7);
}

function generateBasicActions(data, assessmentResults) {
  const actions = [];

  if (data.breathing !== 'normal') {
    actions.push({text: 'Günlük 10-15 dk diyaframatik nefes egzersizi', done: false});
  }

  if (assessmentResults.bp_status === 'warn' || assessmentResults.bp_status === 'risk') {
    actions.push({text: 'Haftada 3× 30 dk orta-yoğunluk kardiyo', done: false});
  }

  actions.push({text: 'Günlük 7000-9000 adım hedefi', done: false});
  actions.push({text: 'Haftada 2× kuvvet antrenmanı', done: false});

  return actions;
}

function generateLifestyleIndicators(data, assessmentResults) {
  const lifestyle = [];

  if (data.breathing !== 'normal') {
    lifestyle.push({color: 'var(--risk)', text: 'Solunum patern bozukluğu mevcut'});
  }

  if (assessmentResults.body_fat_status === 'risk') {
    lifestyle.push({color: 'var(--warn)', text: 'Vücut kompozisyonu iyileştirme gerekli'});
  }

  if (data.left_foot === 'pronation' || data.right_foot === 'pronation') {
    lifestyle.push({color: 'var(--warn)', text: 'Ayak postürü problemleri'});
  }

  if (assessmentResults.core_status === 'ok') {
    lifestyle.push({color: 'var(--ok)', text: 'Core stabilite iyi'});
  }

  lifestyle.push({color: 'var(--ok)', text: 'Düzenli değerlendirme yapılıyor'});

  return lifestyle;
}

function generateMetricsTable(data, assessmentResults) {
  return [
    {k: 'Beden Kitle İndeksi', v: data.bmi, range: '18.5–24.9', status: assessmentResults.bmi_status === 'ok' ? 'iyi' : 'orta'},
    {k: 'Bel Çevresi', v: `${data.waist} cm`, range: data.gender === 'erkek' ? '< 94 cm' : '< 80 cm', status: assessmentResults.waist_hip_status === 'ok' ? 'iyi' : 'orta'},
    {k: 'Dinlenik Nabız', v: `${data.heart_rate} bpm`, range: '60–80 bpm', status: assessmentResults.hr_status === 'ok' ? 'iyi' : 'orta'},
    {k: 'Kan Basıncı', v: `${data.systolic}/${data.diastolic} mmHg`, range: '< 120/80', status: assessmentResults.bp_status === 'ok' ? 'iyi' : 'orta'},
    {k: 'Vücut Yağ %', v: `${data.body_fat}%`, range: data.gender === 'erkek' ? '8-20%' : '14-31%', status: assessmentResults.body_fat_status === 'ok' ? 'iyi' : 'orta'},
    {k: 'Core Dayanıklılık', v: formatTime(data.plank_total_seconds), range: data.gender === 'erkek' ? '> 3 dk' : '> 2 dk', status: assessmentResults.core_status === 'ok' ? 'iyi' : 'orta'}
  ];
}

function generateNotes(data, assessmentResults, language = 'tr') {
  const assessmentDB = getAssessmentDatabase(language);

  if (!assessmentDB) {
    return generateBasicNotes(data, assessmentResults);
  }

  const db = assessmentDB.priority_interventions;
  const priorityItems = [];

  // Determine priority level based on assessment
  const criticalConditions = [
    assessmentResults.bp_status === 'risk',
    assessmentResults.hr_status === 'risk',
    data.breathing !== 'normal'
  ];

  const importantConditions = [
    assessmentResults.bp_status === 'warn',
    assessmentResults.body_fat_status === 'risk',
    assessmentResults.waist_hip_status === 'risk',
    assessmentResults.balance_left_status === 'risk' || assessmentResults.balance_right_status === 'risk'
  ];

  if (criticalConditions.some(condition => condition) && db.critical) {
    const criticalIntervention = getRandomFromArray(db.critical);
    priorityItems.push(criticalIntervention.toLowerCase());
  }

  if (importantConditions.some(condition => condition) && db.important) {
    const importantIntervention = getRandomFromArray(db.important);
    priorityItems.push(importantIntervention.toLowerCase());
  }

  // Always add preventive measures
  if (db.preventive) {
    const preventiveIntervention = getRandomFromArray(db.preventive);
    priorityItems.push(preventiveIntervention.toLowerCase());
  }

  // Add optimization if overall health is good
  const okCount = Object.values(assessmentResults).filter(v => v === 'ok').length;
  if (okCount >= 8 && db.optimization) {
    const optimizationIntervention = getRandomFromArray(db.optimization);
    priorityItems.push(optimizationIntervention.toLowerCase());
  }

  const priorityText = priorityItems.slice(0, 3).join(', ');
  return `Kapsamlı değerlendirmede öncelik ${priorityText} alanlarına odaklanmalı. 4-6 hafta sonra yeniden değerlendirme önerilir.`;
}

function generateBasicNotes(data, assessmentResults) {
  const priority = [];

  if (data.breathing !== 'normal') priority.push('solunum patern düzeltme');
  if (assessmentResults.bp_status === 'risk') priority.push('kardiyovasküler takip');
  if (assessmentResults.body_fat_status === 'risk') priority.push('vücut kompozisyonu iyileştirme');

  const priorityText = priority.length > 0 ? priority.join(', ') : 'genel sağlık optimizasyonu';
  return `Kapsamlı değerlendirmede öncelik ${priorityText} alanlarına odaklanmalı. 4-6 hafta sonra yeniden değerlendirme önerilir.`;
}

// Dynamic content generators (ported from form.html)
function generatePriorityAreas(data, assessmentResults, language = 'tr') {
  const assessmentDB = getAssessmentDatabase(language);

  if (!assessmentDB) {
    return [
      {color: 'var(--risk)', text: 'Solunum patern eğitimi (diyaframatik nefes, 10–15 dk/gün)'},
      {color: 'var(--warn)', text: 'Pronasyon için ayak‑bilek stabilizasyon egzersizleri'},
      {color: 'var(--warn)', text: 'Üst çapraz sendromu için gövde hizalama & mobility rutini'}
    ];
  }

  const db = assessmentDB.priority_interventions;
  const priorities = [];

  // Critical priorities
  const criticalConditions = [
    assessmentResults.bp_status === 'risk',
    assessmentResults.hr_status === 'risk',
    data.breathing !== 'normal'
  ];

  if (criticalConditions.some(condition => condition) && db.critical) {
    const critical = getRandomFromArray(db.critical);
    priorities.push({color: 'var(--risk)', text: critical});
  }

  // Important priorities
  const importantConditions = [
    assessmentResults.bp_status === 'warn',
    assessmentResults.body_fat_status === 'risk',
    assessmentResults.waist_hip_status === 'risk',
    assessmentResults.balance_left_status === 'risk' || assessmentResults.balance_right_status === 'risk'
  ];

  if (importantConditions.some(condition => condition) && db.important) {
    const important = getRandomFromArray(db.important);
    priorities.push({color: 'var(--warn)', text: important});
  }

  // Preventive priorities
  if (db.preventive) {
    const preventive = getRandomFromArray(db.preventive);
    priorities.push({color: 'var(--ok)', text: preventive});
  }

  return priorities.slice(0, 3);
}

function generateGaitAnalysis(data) {
  const getFootStatusText = (status) => {
    switch(status) {
      case 'normal': return 'Normal (0-10mm)';
      case 'pronation': return 'Pronasyon (10mm+)';
      case 'supination': return 'Süpinasyon (10mm+)';
      default: return 'Değerlendirilmedi';
    }
  };

  const getFootNote = (status) => {
    switch(status) {
      case 'pronation': return 'İçe basma gözlendi';
      case 'supination': return 'Dışa basma gözlendi';
      default: return '—';
    }
  };

  return [
    {
      side: 'Sol',
      status: getFootStatusText(data.left_foot),
      note: getFootNote(data.left_foot)
    },
    {
      side: 'Sağ',
      status: getFootStatusText(data.right_foot),
      note: getFootNote(data.right_foot)
    }
  ];
}

function generateBalanceTests(data, assessmentResults) {
  const getBalanceStatus = (seconds) => {
    if (seconds >= 60) return 'İyi';
    if (seconds >= 29) return 'Normal';
    return 'Zayıf';
  };

  return [
    {
      side: 'Sol',
      time: `${data.balance_left} sn`,
      status: getBalanceStatus(parseInt(data.balance_left))
    },
    {
      side: 'Sağ',
      time: `${data.balance_right} sn`,
      status: getBalanceStatus(parseInt(data.balance_right))
    }
  ];
}

function generatePostureAnalysis(data) {
  const observations = [];

  if (data.static_posture) {
    const staticPosture = Array.isArray(data.static_posture) ? data.static_posture : [data.static_posture];

    if (staticPosture.includes('upper_crossed')) {
      observations.push({plane: 'Anterior', observation: 'Üst çapraz sendromu bulguları'});
    }
    if (staticPosture.includes('lower_crossed')) {
      observations.push({plane: 'Posterior', observation: 'Alt çapraz sendromu'});
    }
    if (staticPosture.includes('x_legs')) {
      observations.push({plane: 'Lateral', observation: 'X-legs sendromu'});
    }
  }

  // Add dynamic observations from form
  if (data.dynamic_anterior) {
    const anteriorFindings = Array.isArray(data.dynamic_anterior) ? data.dynamic_anterior : [data.dynamic_anterior];
    const anteriorText = anteriorFindings.map(finding => getDynamicPostureLabel(finding, 'anterior')).join(', ');
    observations.push({plane: 'Anterior', observation: anteriorText});
  }

  if (data.dynamic_lateral) {
    const lateralFindings = Array.isArray(data.dynamic_lateral) ? data.dynamic_lateral : [data.dynamic_lateral];
    const lateralText = lateralFindings.map(finding => getDynamicPostureLabel(finding, 'lateral')).join(', ');
    observations.push({plane: 'Lateral', observation: lateralText});
  }

  if (data.dynamic_posterior) {
    const posteriorFindings = Array.isArray(data.dynamic_posterior) ? data.dynamic_posterior : [data.dynamic_posterior];
    const posteriorText = posteriorFindings.map(finding => getDynamicPostureLabel(finding, 'posterior')).join(', ');
    observations.push({plane: 'Posterior', observation: posteriorText});
  }

  // Fallback observations if none provided
  if (observations.length === 0) {
    observations.push(
      {plane: 'Anterior', observation: 'Normal hizalanma'},
      {plane: 'Lateral', observation: 'Fizyolojik eğrilikler korunmuş'},
      {plane: 'Posterior', observation: 'Simetrik duruş'}
    );
  }

  return observations;
}

function getDynamicPostureLabel(value, plane) {
  const labels = {
    anterior: {
      'normal_alignment': 'Normal hizalanma',
      'knee_valgus': 'Diz valgus (dizler içe)',
      'knee_varus': 'Diz varus (dizler dışa)',
      'ankle_pronation': 'Ayak bileği pronasyonu',
      'asymmetric_stance': 'Asimetrik duruş'
    },
    lateral: {
      'normal_pattern': 'Normal hareket paterni',
      'forward_head': 'İleri baş postürü',
      'excessive_forward_lean': 'Aşırı öne eğilme',
      'excessive_backward_lean': 'Aşırı arkaya eğilme',
      'lumbar_extension_loss': 'Lomber ekstansiyon kaybı',
      'hip_flexion_limitation': 'Kalça fleksiyon limitasyonu'
    },
    posterior: {
      'normal_alignment': 'Normal hizalanma',
      'hip_shift_left': 'Kalça kayması (sol)',
      'hip_shift_right': 'Kalça kayması (sağ)',
      'shoulder_asymmetry': 'Omuz asimetrisi',
      'early_heel_rise': 'Erken topuk kalkması',
      'pelvic_tilt': 'Pelvik tilt'
    }
  };

  return labels[plane]?.[value] || value;
}

function generateUpperBodyTests(data, assessmentResults) {
  return [
    {
      test: 'Push-up',
      score: data.pushup_count,
      evaluation: getStatusLabel(assessmentResults.pushup_status)
    }
  ];
}

function generateLowerBodyTests(data, assessmentResults) {
  return [
    {
      test: 'Wall-Sit',
      time: formatTime(data.wallsit_total_seconds),
      evaluation: getStatusLabel(assessmentResults.wallsit_status)
    }
  ];
}

// Helper functions for database integration
function getRandomFromArray(array) {
  if (!array || array.length === 0) return 'Değerlendirme yapılamadı';
  return array[Math.floor(Math.random() * array.length)];
}

function getStatusColor(status) {
  switch(status) {
    case 'ok': return 'var(--ok)';
    case 'warn': return 'var(--warn)';
    case 'risk': return 'var(--risk)';
    default: return 'var(--muted)';
  }
}

function getWorstStatus(status1, status2) {
  const statusOrder = { 'risk': 3, 'warn': 2, 'ok': 1, 'iyi': 1, 'normal': 2, 'riskli': 3 };
  const score1 = statusOrder[status1] || 0;
  const score2 = statusOrder[status2] || 0;

  if (score1 >= score2) return status1;
  return status2;
}

module.exports = {
  assessFormData,
  generateFindings,
  generateActions,
  generateLifestyleIndicators,
  generateMetricsTable,
  generateNotes,
  generatePriorityAreas,
  generateGaitAnalysis,
  generateBalanceTests,
  generatePostureAnalysis,
  generateUpperBodyTests,
  generateLowerBodyTests,

  // Individual assessment functions
  assessBloodPressure,
  assessHeartRate,
  assessBodyFat,
  assessWaistHip,
  assessBMI,
  assessBalance,
  assessCore,
  assessPushup,
  assessWallSit,
  assessSitReach,

  // Utility functions
  calculateRiskScore,
  getRiskLabel,
  getStatusLabel,
  formatTime,
  getBreathingLabel,
  getBreathingStatus,
  getBreathingNote,
  getShoulderLabel,
  getShoulderStatus,
  getActivityLevel
};