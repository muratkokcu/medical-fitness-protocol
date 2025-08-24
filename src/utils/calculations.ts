import type { AssessmentData, TestResult } from '../types/assessment';

export const calculateBMI = (height: number, weight: number): TestResult => {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  let result: string;
  if (bmi < 18.5) {
    result = 'Zayıf - Kilo almanız önerilir';
  } else if (bmi < 25) {
    result = 'Normal - İdeal kiloda';
  } else if (bmi < 30) {
    result = 'Fazla Kilolu - Kilo vermeniz önerilir';
  } else {
    result = 'Obez - Ciddi kilo vermeniz gerekiyor';
  }
  
  return {
    value: bmi,
    result,
    bmi: bmi
  };
};

export const calculateBloodPressure = (systolic: number, diastolic: number): TestResult => {
  let result: string;
  
  if (systolic <= 120 && diastolic <= 80) {
    result = 'Normal - Tansiyon ya da kan basıncı ideal aralıkta';
  } else if (systolic <= 140 && diastolic <= 90) {
    result = '1. Seviye - Dikkat edilmesi gerekiyor';
  } else if (systolic <= 160 && diastolic <= 100) {
    result = '2. Seviye - Hekim kontrolü önerilir';
  } else if (systolic <= 160 && diastolic <= 110) {
    result = '3. Seviye - Acil hekim kontrolü gerekli';
  } else {
    result = '3. Seviye - Kritik durum, acil tıbbi müdahale';
  }
  
  return {
    value: `${systolic}/${diastolic}`,
    result
  };
};

export const calculatePulse = (pulse: number): TestResult => {
  let result: string;
  
  if (pulse >= 46 && pulse <= 60) {
    result = 'Çok İyi - Mükemmel kalp kondisyonu';
  } else if (pulse >= 60 && pulse <= 80) {
    result = 'Normal - Sağlıklı kalp ritmi';
  } else if (pulse >= 85 && pulse <= 100) {
    result = 'Yüksek - Kondisyon geliştirilebilir';
  } else if (pulse > 100) {
    result = 'Riskli - Hekim kontrolü önerilir';
  } else {
    result = 'Değerlendirme dışı - Kontrol edilmeli';
  }
  
  return {
    value: pulse,
    result
  };
};

export const calculateBodyFat = (bodyFat: number, gender: string): TestResult => {
  let result: string;
  
  if (gender === 'male') {
    if (bodyFat >= 8 && bodyFat <= 12) {
      result = 'Çok İyi - Mükemmel yağ oranı';
    } else if (bodyFat >= 13 && bodyFat <= 20) {
      result = 'Normal - Sağlıklı aralık';
    } else if (bodyFat > 20) {
      result = 'Riskli - Kilo vermeniz önerilir';
    } else {
      result = 'Çok Düşük - Sağlık riski';
    }
  } else {
    if (bodyFat >= 14 && bodyFat <= 20) {
      result = 'Çok İyi - Mükemmel yağ oranı';
    } else if (bodyFat >= 21 && bodyFat <= 31) {
      result = 'Normal - Sağlıklı aralık';
    } else if (bodyFat > 31) {
      result = 'Riskli - Kilo vermeniz önerilir';
    } else {
      result = 'Çok Düşük - Sağlık riski';
    }
  }
  
  return {
    value: bodyFat,
    result
  };
};

export const calculateWHR = (waist: number, hip: number, gender: string): TestResult => {
  const ratio = waist / hip;
  let result: string;
  
  if (gender === 'male') {
    if (ratio < 0.85) {
      result = 'Çok İyi - Mükemmel bel/kalça oranı';
    } else if (ratio >= 0.85 && ratio <= 0.90) {
      result = 'İyi - Sağlıklı aralık';
    } else if (ratio > 0.90 && ratio <= 0.95) {
      result = 'Riskli - Dikkat gerekli';
    } else {
      result = 'Yüksek Risk - Bel ölçüsünü azaltın';
    }
  } else {
    if (ratio < 0.75) {
      result = 'Çok İyi - Mükemmel bel/kalça oranı';
    } else if (ratio >= 0.75 && ratio <= 0.80) {
      result = 'İyi - Sağlıklı aralık';
    } else if (ratio > 0.80 && ratio <= 0.85) {
      result = 'Riskli - Dikkat gerekli';
    } else {
      result = 'Yüksek Risk - Bel ölçüsünü azaltın';
    }
  }
  
  return {
    value: ratio.toFixed(2),
    result
  };
};

export const calculateRespiratory = (peakFlow: number, breathHold: number, gender: string, dysfunction?: string): TestResult => {
  let score = 0;
  let result: string;
  
  // First check for dysfunction
  if (dysfunction) {
    switch (dysfunction) {
      case 'normal':
        result = 'Normal - Sağlıklı nefes alıp verme';
        break;
      case 'dysfunction':
        result = 'Nefes Disfonksiyonu - Solunum egzersizleri gerekli';
        break;
      case 'weak_diaphragm':
        result = 'Zayıf Diyafram - Diyafram güçlendirme egzersizleri önerilir';
        break;
      case 'apical':
        result = 'Apikal Nefes - Derin nefes teknikleri öğrenilmeli';
        break;
      default:
        result = 'Değerlendirme dışı';
    }
    
    // Return early for dysfunction categories
    if (dysfunction !== 'normal') {
      return {
        value: dysfunction,
        result
      };
    }
  }
  
  // If normal, continue with numerical scoring
  // Peak flow scoring
  if (gender === 'male') {
    if (peakFlow >= 600) score += 50;
    else if (peakFlow >= 500) score += 40;
    else if (peakFlow >= 400) score += 30;
    else score += 20;
  } else {
    if (peakFlow >= 450) score += 50;
    else if (peakFlow >= 350) score += 40;
    else if (peakFlow >= 300) score += 30;
    else score += 20;
  }
  
  // Breath hold scoring
  if (breathHold >= 60) score += 50;
  else if (breathHold >= 45) score += 40;
  else if (breathHold >= 30) score += 30;
  else score += 20;
  
  if (score >= 85) {
    result = 'Normal - Mükemmel solunum kapasitesi';
  } else if (score >= 70) {
    result = 'Normal - İyi solunum fonksiyonu';
  } else if (score >= 55) {
    result = 'Normal - Orta seviye, geliştirilebilir';
  } else {
    result = 'Normal - Zayıf, solunum egzersizleri önerilir';
  }
  
  return {
    value: score,
    result
  };
};

export const calculateBalance = (balanceTime: number): TestResult => {
  let result: string;
  
  if (balanceTime >= 60) {
    result = 'İyi - Mükemmel single leg balance';
  } else if (balanceTime >= 29 && balanceTime <= 60) {
    result = 'Normal - Sağlıklı denge';
  } else if (balanceTime < 29) {
    result = 'Zayıf - Denge egzersizleri önerilir';
  } else {
    result = 'Değerlendirme dışı - Kontrol gerekli';
  }
  
  return {
    value: balanceTime,
    result
  };
};

export const calculateShoulderMobility = (distance: number, gender: string): TestResult => {
  let result: string;
  
  if (gender === 'male') {
    if (distance >= 17) {
      result = 'İyi - Mükemmel omuz mobilitesi';
    } else if (distance >= 0 && distance <= 5) {
      result = 'Normal - Sağlıklı omuz mobilitesi';
    } else if (distance < -1) {
      result = 'Riskli - Mobility egzersizleri önerilir';
    } else {
      result = 'Değerlendirme dışı - Kontrol gerekli';
    }
  } else {
    if (distance >= 21) {
      result = 'İyi - Mükemmel omuz mobilitesi';
    } else if (distance >= 1 && distance <= 10) {
      result = 'Normal - Sağlıklı omuz mobilitesi';
    } else if (distance <= 0) {
      result = 'Riskli - Mobility egzersizleri önerilir';
    } else {
      result = 'Değerlendirme dışı - Kontrol gerekli';
    }
  }
  
  return {
    value: `${distance} cm`,
    result
  };
};

export const calculateTrunkFlexibility = (sitReach: number, spinalFlexion: number, spinalExtension: number, sitReachTime?: number): TestResult => {
  let result: string;
  
  // If time-based sit & reach is provided, use Turkish standards
  if (sitReachTime) {
    if (sitReachTime >= 120) { // 2 Dk üstü İyi
      result = 'İyi - Mükemmel gövde esnekliği';
    } else if (sitReachTime >= 60 && sitReachTime <= 120) { // 1-2 Dk Normal
      result = 'Normal - Sağlıklı gövde esnekliği';
    } else { // 1 Dk Altı Zayıf
      result = 'Zayıf - Esneklik egzersizleri önerilir';
    }
    
    return {
      value: sitReachTime,
      result
    };
  }
  
  // Fallback to distance-based scoring if time not available
  let score = 0;
  
  // Sit and reach scoring
  if (sitReach >= 15) score += 35;
  else if (sitReach >= 10) score += 25;
  else if (sitReach >= 5) score += 15;
  else score += 5;
  
  // Spinal flexion scoring
  if (spinalFlexion >= 80) score += 35;
  else if (spinalFlexion >= 70) score += 25;
  else if (spinalFlexion >= 60) score += 15;
  else score += 5;
  
  // Spinal extension scoring
  if (spinalExtension >= 25) score += 30;
  else if (spinalExtension >= 20) score += 20;
  else if (spinalExtension >= 15) score += 10;
  else score += 5;
  
  if (score >= 85) {
    result = 'Mükemmel - Çok iyi esneklik';
  } else if (score >= 65) {
    result = 'İyi - Sağlıklı esneklik';
  } else if (score >= 45) {
    result = 'Ortalama - Geliştirilebilir';
  } else {
    result = 'Zayıf - Esneklik egzersizleri önerilir';
  }
  
  return {
    value: score,
    result
  };
};

export const calculateStrengthTests = (/*gripStrength: number,*/ pushUps: number, plankTime: number, squats: number, gender: string): TestResult => {
  let score = 0;
  
  // Grip strength scoring - COMMENTED OUT
  // const gripThreshold = gender === 'male' ? 40 : 25;
  // if (gripStrength >= gripThreshold * 1.3) score += 25;
  // else if (gripStrength >= gripThreshold) score += 20;
  // else if (gripStrength >= gripThreshold * 0.8) score += 15;
  // else score += 10;
  
  // Push-ups scoring - Turkish standards
  if (gender === 'male') {
    if (pushUps >= 20) {
      score += 25; // İyi
    } else if (pushUps >= 10 && pushUps <= 20) {
      score += 20; // Normal
    } else {
      score += 10; // Zayıf (below 10)
    }
  } else {
    if (pushUps >= 14) {
      score += 25; // İyi
    } else if (pushUps >= 7 && pushUps <= 14) {
      score += 20; // Normal
    } else {
      score += 10; // Zayıf (below 7)
    }
  }
  
  // Plank time scoring
  if (plankTime >= 120) score += 25;
  else if (plankTime >= 60) score += 20;
  else if (plankTime >= 30) score += 15;
  else score += 10;
  
  // Squats scoring
  const squatThreshold = gender === 'male' ? 25 : 20;
  if (squats >= squatThreshold * 1.3) score += 25;
  else if (squats >= squatThreshold) score += 20;
  else if (squats >= squatThreshold * 0.8) score += 15;
  else score += 10;
  
  let result: string;
  
  // Determine core strength result based on push-ups specifically
  let coreResult: string;
  if (gender === 'male') {
    if (pushUps >= 20) coreResult = 'İyi';
    else if (pushUps >= 10) coreResult = 'Normal';
    else coreResult = 'Zayıf';
  } else {
    if (pushUps >= 14) coreResult = 'İyi';
    else if (pushUps >= 7) coreResult = 'Normal';
    else coreResult = 'Zayıf';
  }
  
  result = `Core Kuvvet: ${coreResult} - Push-up değerlendirmesi`;
  
  if (coreResult === 'Zayıf') {
    result += ', kuvvet antrenmanı gerekli';
  } else if (coreResult === 'İyi') {
    result += ', mükemmel performans';
  }
  
  return {
    value: score,
    result
  };
};


export const performAllCalculations = (data: AssessmentData) => {
  const results: Record<string, TestResult> = {};
  
  // BMI calculation
  if (data.height && data.weight) {
    results.bmi = calculateBMI(data.height, data.weight);
  }
  
  // Blood pressure calculation
  if (data.systolicBP && data.diastolicBP) {
    results.bloodPressure = calculateBloodPressure(data.systolicBP, data.diastolicBP);
  }
  
  // Pulse calculation
  if (data.restingHR) {
    results.pulse = calculatePulse(data.restingHR);
  }
  
  // Body fat calculation
  if (data.bodyFatPercentage && data.gender) {
    results.bodyFat = calculateBodyFat(data.bodyFatPercentage, data.gender);
  }
  
  // WHR calculation
  if (data.waistCircumference && data.hipCircumference && data.gender) {
    results.whr = calculateWHR(data.waistCircumference, data.hipCircumference, data.gender);
  }
  
  // Respiratory calculation
  if (data.peakFlowRate && data.breathHoldTime && data.gender) {
    results.respiratory = calculateRespiratory(data.peakFlowRate, data.breathHoldTime, data.gender, data.respiratoryDysfunction);
  }
  
  // Balance calculation
  if (data.staticBalance) {
    results.balance = calculateBalance(data.staticBalance);
  }
  
  // Shoulder mobility calculation
  if (data.shoulderMobilityLeft !== undefined && data.gender) {
    results.shoulderMobility = calculateShoulderMobility(data.shoulderMobilityLeft, data.gender);
  }
  
  // Trunk flexibility calculation
  if (data.trunkFlexibilityForward && data.spinalRotation && data.trunkFlexibilityBackward) {
    results.trunkFlexibility = calculateTrunkFlexibility(data.trunkFlexibilityForward, data.spinalRotation, data.trunkFlexibilityBackward, data.sitReachTime);
  }
  
  // Strength tests calculation
  if (/*data.gripStrength &&*/ data.pushUps && data.plankTime && data.squats && data.gender) {
    results.strengthTests = calculateStrengthTests(/*data.gripStrength,*/ data.pushUps, data.plankTime, data.squats, data.gender);
  }
  
  
  // Walking foot strike calculation
  if (data.walkingFootStrikeLeft !== undefined && data.walkingFootStrikeRight !== undefined) {
    results.walkingFootStrike = calculateWalkingFootStrike(data.walkingFootStrikeLeft, data.walkingFootStrikeRight);
  }
  
  // Overhead squat calculation
  if (data.overheadSquatLeft && data.overheadSquatRight) {
    results.overheadSquat = calculateOverheadSquat(data.overheadSquatLeft, data.overheadSquatRight);
  }
  
  // Wall sit calculation
  if (data.wallSitTime && data.gender) {
    results.wallSit = calculateWallSit(data.wallSitTime, data.gender);
  }
  
  
  return results;
};

export const calculateWalkingFootStrike = (leftFootStrike: number, rightFootStrike: number): TestResult => {
  let result: string;
  let footStrikeType: string;
  
  const avgFootStrike = (leftFootStrike + rightFootStrike) / 2;
  
  if (avgFootStrike >= 0 && avgFootStrike <= 10) {
    result = 'Normal - Sağlıklı ayak basışı';
    footStrikeType = 'normal';
  } else if (avgFootStrike > 10) {
    if (leftFootStrike > 10 || rightFootStrike > 10) {
      result = 'Pronation 10mm+ - Ayak içe basma problemi';
      footStrikeType = 'pronation';
    } else {
      result = 'Supination 10mm+ - Ayak dışa basma problemi';
      footStrikeType = 'supination';
    }
  } else {
    result = 'Değerlendirme dışı - Kontrol gerekli';
    footStrikeType = 'normal';
  }
  
  return {
    value: `Sol: ${leftFootStrike}mm, Sağ: ${rightFootStrike}mm`,
    result,
    category: footStrikeType
  };
};

export const calculateOverheadSquat = (leftAssessment: string, rightAssessment: string): TestResult => {
  let result: string;
  
  if (leftAssessment === rightAssessment && leftAssessment === 'normal') {
    result = 'Mükemmel - Simetrik ve ideal hareket';
  } else if (leftAssessment === 'normal' || rightAssessment === 'normal') {
    result = 'İyi - Hafif asimetri var';
  } else {
    result = 'Zayıf - Hareket kalitesi geliştirilebilir';
  }
  
  return {
    value: `Sol: ${leftAssessment}, Sağ: ${rightAssessment}`,
    result
  };
};

export const calculateWallSit = (wallSitTime: number, gender: string): TestResult => {
  let result: string;
  
  // Turkish form exact ranges
  if (gender === 'male') {
    if (wallSitTime >= 120) { // 2 Dk üstü İyi
      result = 'İyi - Mükemmel alt vücut dayanıklılığı';
    } else if (wallSitTime >= 60 && wallSitTime <= 120) { // 1-2 Dk Normal
      result = 'Normal - Sağlıklı alt vücut dayanıklılığı';
    } else { // 1 Dk altı Zayıf
      result = 'Zayıf - Alt vücut kuvvet antrenmanı gerekli';
    }
  } else {
    if (wallSitTime >= 90) { // 90 Sn üstü İyi
      result = 'İyi - Mükemmel alt vücut dayanıklılığı';
    } else if (wallSitTime >= 45 && wallSitTime <= 90) { // 45-90 Sn Normal
      result = 'Normal - Sağlıklı alt vücut dayanıklılığı';
    } else { // 45 Sn altı Zayıf
      result = 'Zayıf - Alt vücut kuvvet antrenmanı gerekli';
    }
  }
  
  return {
    value: wallSitTime,
    result
  };
};



