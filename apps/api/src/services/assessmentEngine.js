/**
 * Assessment Engine Service
 * Migrated from legacy form.html JavaScript
 * Provides comprehensive medical fitness assessment calculations
 */

/**
 * Individual assessment functions
 */

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

/**
 * Comprehensive assessment function
 */
function assessFormData(data) {
  // Calculate derived values
  const derivedData = { ...data };

  // Calculate waist-hip ratio
  if (data.waist && data.hip) {
    derivedData.waist_hip_ratio = (parseFloat(data.waist) / parseFloat(data.hip)).toFixed(2);
  }

  // Calculate BMI
  if (data.height && data.weight) {
    const heightM = parseFloat(data.height) / 100;
    derivedData.bmi = (parseFloat(data.weight) / (heightM * heightM)).toFixed(1);
  }

  // Format blood pressure
  if (data.systolic && data.diastolic) {
    derivedData.blood_pressure = `${data.systolic}/${data.diastolic}`;
  }

  // Convert time values to total seconds
  if (data.plank_minutes || data.plank_seconds) {
    const minutes = parseInt(data.plank_minutes || 0);
    const seconds = parseInt(data.plank_seconds || 0);
    derivedData.plank_total_seconds = minutes * 60 + seconds;
  }

  if (data.wallsit_minutes || data.wallsit_seconds) {
    const minutes = parseInt(data.wallsit_minutes || 0);
    const seconds = parseInt(data.wallsit_seconds || 0);
    derivedData.wallsit_total_seconds = minutes * 60 + seconds;
  }

  // Perform all assessments
  const assessment = {
    bp_status: assessBloodPressure(parseInt(data.systolic), parseInt(data.diastolic)),
    hr_status: assessHeartRate(parseInt(data.heart_rate)),
    body_fat_status: assessBodyFat(parseFloat(data.body_fat), data.gender),
    waist_hip_status: assessWaistHip(parseFloat(derivedData.waist_hip_ratio), data.gender),
    bmi_status: assessBMI(parseFloat(derivedData.bmi)),
    balance_left_status: assessBalance(parseInt(data.balance_left)),
    balance_right_status: assessBalance(parseInt(data.balance_right)),
    core_status: assessCore(derivedData.plank_total_seconds, data.gender),
    pushup_status: assessPushup(parseInt(data.pushup_count), data.gender),
    wallsit_status: assessWallSit(derivedData.wallsit_total_seconds, data.gender),
    sit_reach_status: assessSitReach(parseFloat(data.sit_reach), data.gender),
    breathing_status: getBreathingStatus(data.breathing),
    shoulder_status: getShoulderStatus(data.shoulder_left, data.shoulder_right)
  };

  // Calculate overall risk score
  const riskScore = calculateRiskScore(assessment);

  return {
    originalData: data,
    derivedData,
    assessment,
    riskScore,
    riskLabel: getRiskLabel(riskScore)
  };
}

/**
 * Helper functions
 */

function getBreathingStatus(breathing) {
  return breathing === 'normal' ? 'ok' : 'risk';
}

function getShoulderStatus(left, right) {
  if (left === 'riskli' || right === 'riskli') return 'risk';
  if (left === 'normal' || right === 'normal') return 'warn';
  return 'ok';
}

function calculateRiskScore(assessment) {
  const values = Object.values(assessment);
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
  switch (status) {
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

/**
 * Report generation helpers
 */

function generateMetricsTable(data, assessment) {
  return [
    {
      k: 'Beden Kitle İndeksi',
      v: data.bmi,
      range: '18.5–24.9',
      status: assessment.bmi_status === 'ok' ? 'iyi' : 'orta'
    },
    {
      k: 'Bel Çevresi',
      v: `${data.waist} cm`,
      range: data.gender === 'erkek' ? '< 94 cm' : '< 80 cm',
      status: assessment.waist_hip_status === 'ok' ? 'iyi' : 'orta'
    },
    {
      k: 'Dinlenik Nabız',
      v: `${data.heart_rate} bpm`,
      range: '60–80 bpm',
      status: assessment.hr_status === 'ok' ? 'iyi' : 'orta'
    },
    {
      k: 'Kan Basıncı',
      v: `${data.systolic}/${data.diastolic} mmHg`,
      range: '< 120/80',
      status: assessment.bp_status === 'ok' ? 'iyi' : 'orta'
    },
    {
      k: 'Vücut Yağ %',
      v: `${data.body_fat}%`,
      range: data.gender === 'erkek' ? '8-20%' : '14-31%',
      status: assessment.body_fat_status === 'ok' ? 'iyi' : 'orta'
    },
    {
      k: 'Core Dayanıklılık',
      v: formatTime(data.plank_total_seconds),
      range: data.gender === 'erkek' ? '> 3 dk' : '> 2 dk',
      status: assessment.core_status === 'ok' ? 'iyi' : 'orta'
    }
  ];
}

function generateGaitAnalysis(data) {
  const getFootStatusText = (status) => {
    switch (status) {
      case 'normal': return 'Normal (0-10mm)';
      case 'pronation': return 'Pronasyon (10mm+)';
      case 'supination': return 'Süpinasyon (10mm+)';
      default: return 'Değerlendirilmedi';
    }
  };

  const getFootNote = (status) => {
    switch (status) {
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

function generateBalanceTests(data, assessment) {
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

module.exports = {
  assessFormData,
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
  calculateRiskScore,
  getRiskLabel,
  getStatusLabel,
  formatTime,
  generateMetricsTable,
  generateGaitAnalysis,
  generateBalanceTests
};