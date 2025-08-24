import type { AssessmentStep } from '../types/assessment';

export const ASSESSMENT_STEPS: AssessmentStep[] = [
  // Step 0: Welcome
  {
    id: 'welcome',
    title: 'Medikal Fitness Check-up',
    subtitle: 'Kapsamlı sağlık ve fitness değerlendirme sistemine hoş geldiniz. 16 adımlık değerlendirme ile sağlık durumunuzu analiz edecek ve size özel öneriler sunacağız.',
    type: 'welcome'
  },
  
  // Step 1: Personal Info
  {
    id: 'personal',
    title: 'Kişisel Bilgiler',
    subtitle: 'Değerlendirme için temel bilgilerinizi girin',
    type: 'form',
    fields: [
      { id: 'assessmentDate', label: 'Tarih', type: 'date', required: true },
      { id: 'fullName', label: 'Üye Adı Soyadı', type: 'text', required: true, placeholder: 'Ad Soyad' },
      { 
        id: 'gender', 
        label: 'Cinsiyet', 
        type: 'select', 
        required: true, 
        options: [
          { value: '', text: 'Seçiniz' },
          { value: 'male', text: 'Erkek' },
          { value: 'female', text: 'Kadın' }
        ]
      },
      { id: 'trainer', label: 'Trainer', type: 'text', required: true, placeholder: 'Trainer adı' },
      { id: 'age', label: 'Yaş', type: 'number', required: true, placeholder: '25' },
      { id: 'height', label: 'Boy (cm)', type: 'number', required: true, placeholder: '175' },
      { id: 'weight', label: 'Kilo (kg)', type: 'number', required: true, placeholder: '70' },
      { id: 'occupation', label: 'Meslek', type: 'text', placeholder: 'Mesleki unvan' }
    ]
  },
  
  
  // Step 3: Vital Signs
  {
    id: 'vitalSigns',
    title: 'Vital Bulgular',
    subtitle: 'Temel yaşam bulguları ölçümleri',
    type: 'assessment',
    info: 'Tansiyon, nabız ve vücut sıcaklığı ölçümleri',
    fields: [
      { id: 'systolicBP', label: 'Sistolik Tansiyon (mmHg)', type: 'number', placeholder: '120' },
      { id: 'diastolicBP', label: 'Diastolik Tansiyon (mmHg)', type: 'number', placeholder: '80' },
      { id: 'restingHR', label: 'Dinlenik Nabız (bpm)', type: 'number', placeholder: '72' },
      { id: 'bodyTemperature', label: 'Vücut Sıcaklığı (°C)', type: 'number', step: '0.1', placeholder: '36.5' }
    ]
  },
  
  // Step 4: Body Composition
  {
    id: 'bodyComposition',
    title: 'Vücut Kompozisyonu',
    subtitle: 'Vücut yağ oranı ve kas kütlesi analizi',
    type: 'assessment',
    info: 'Bioelektrik impedans veya kaliper ile ölçüm',
    fields: [
      { id: 'bodyFatPercentage', label: 'Vücut Yağ Oranı (%)', type: 'number', step: '0.1', placeholder: '15.5' },
      { id: 'muscleMass', label: 'Kas Kütlesi (kg)', type: 'number', step: '0.1', placeholder: '45.2' },
      { id: 'visceralFat', label: 'Viseral Yağ Seviyesi', type: 'number', placeholder: '8' },
      { id: 'waistCircumference', label: 'Bel Çevresi (cm)', type: 'number', placeholder: '85' },
      { id: 'hipCircumference', label: 'Kalça Çevresi (cm)', type: 'number', placeholder: '95' }
    ]
  },
  
  // Step 5: Respiratory Function
  {
    id: 'respiratory',
    title: 'Solunum Fonksiyonu',
    subtitle: 'Akciğer kapasitesi ve solunum kalitesi',
    type: 'assessment',
    info: 'Peak flow metre ve nefes tutma testleri',
    fields: [
      { id: 'respiratoryRate', label: 'Solunum Hızı (dk)', type: 'number', placeholder: '16' },
      { id: 'peakFlowRate', label: 'Peak Flow (L/dk)', type: 'number', placeholder: '500' },
      { id: 'breathHoldTime', label: 'Nefes Tutma Süresi (saniye)', type: 'number', placeholder: '45' },
      { id: 'chestExpansion', label: 'Göğüs Genişlemesi (cm)', type: 'number', placeholder: '8' },
      { 
        id: 'respiratoryDysfunction', 
        label: 'Nefes Kalitesi', 
        type: 'select', 
        required: true,
        options: [
          { value: '', text: 'Seçiniz' },
          { value: 'normal', text: 'Normal' },
          { value: 'dysfunction', text: 'Nefes Disfonksiyonu' },
          { value: 'weak_diaphragm', text: 'Zayıf Diyafram' },
          { value: 'apical', text: 'Apikal' }
        ]
      }
    ]
  },
  
  // Step 6: Biomechanical Assessment
  {
    id: 'biomechanical',
    title: 'Biyomekanik Değerlendirme',
    subtitle: 'Eklem hareket açıklığı ve fonksiyonel hareket',
    type: 'assessment',
    info: 'Gonyometre ile eklem açılarının ölçümü',
    fields: [
      { id: 'shoulderFlexion', label: 'Omuz Fleksiyonu (derece)', type: 'number', placeholder: '180' },
      { id: 'shoulderExtension', label: 'Omuz Ekstansiyonu (derece)', type: 'number', placeholder: '60' },
      { id: 'spinalRotation', label: 'Spinal Rotasyon (derece)', type: 'number', placeholder: '45' },
      { id: 'hipFlexibility', label: 'Kalça Esnekliği (derece)', type: 'number', placeholder: '120' },
      { id: 'ankleFlexibility', label: 'Ayak Bileği Esnekliği (derece)', type: 'number', placeholder: '20' }
    ]
  },
  
  // Step 7: Balance and Coordination
  {
    id: 'balance',
    title: 'Denge ve Koordinasyon',
    subtitle: 'Statik ve dinamik denge değerlendirmesi',
    type: 'assessment',
    info: 'Tek ayak durma ve dinamik denge testleri',
    fields: [
      { id: 'staticBalance', label: 'Statik Denge (saniye)', type: 'number', placeholder: '30' },
      { id: 'singleLegBalanceKneeRotation', label: 'Diz İçe Dönüş', type: 'select', options: [
        { value: '', text: 'Seçiniz' }, { value: 'true', text: 'Var' }, { value: 'false', text: 'Yok' }
      ]},
      { id: 'singleLegBalanceHipShift', label: 'Kalça Shift', type: 'select', options: [
        { value: '', text: 'Seçiniz' }, { value: 'true', text: 'Var' }, { value: 'false', text: 'Yok' }
      ]},
      { id: 'singleLegBalanceTrunkRotation', label: 'Gövde Rotasyon', type: 'select', options: [
        { value: '', text: 'Seçiniz' }, { value: 'true', text: 'Var' }, { value: 'false', text: 'Yok' }
      ]}
    ]
  },

  // Step 8: Walking & Foot Strike Analysis
  {
    id: 'walkingFootStrike',
    title: 'Yürüyüş & Ayak Basış Analizi',
    subtitle: 'Pronation ve Supination değerlendirmesi',
    type: 'assessment',
    info: 'Normal 0-10mm, Pronation 10mm+, Supination 10mm+',
    fields: [
      { id: 'walkingFootStrikeLeft', label: 'Sol Ayak Basış (mm)', type: 'number', placeholder: '5' },
      { id: 'walkingFootStrikeRight', label: 'Sağ Ayak Basış (mm)', type: 'number', placeholder: '5' },
      { 
        id: 'footStrikeType', 
        label: 'Ayak Basış Tipi', 
        type: 'select', 
        options: [
          { value: '', text: 'Seçiniz' },
          { value: 'normal', text: 'Normal' },
          { value: 'pronation', text: 'Pronation' },
          { value: 'supination', text: 'Supination' }
        ]
      }
    ]
  },
  
  // Step 9: Mobility Tests
  {
    id: 'mobility',
    title: 'Mobilite Testleri',
    subtitle: 'Eklem mobilitesi ve esneklik ölçümleri',
    type: 'assessment',
    info: 'Shoulder mobility ve trunk flexibility testleri',
    fields: [
      { id: 'shoulderMobilityLeft', label: 'Sol Omuz Mobility (cm)', type: 'number', placeholder: '0' },
      { id: 'shoulderMobilityRight', label: 'Sağ Omuz Mobility (cm)', type: 'number', placeholder: '0' },
      { id: 'trunkFlexibilityForward', label: 'Öne Eğilme (cm)', type: 'number', placeholder: '15' },
      { id: 'trunkFlexibilityBackward', label: 'Geriye Eğilme (derece)', type: 'number', placeholder: '25' },
      { id: 'sitReachTime', label: 'Sit & Reach Süresi (saniye)', type: 'number', placeholder: '90' }
    ]
  },
  
  // Step 9: Posture Assessment
  {
    id: 'posture',
    title: 'Postür Değerlendirmesi',
    subtitle: 'Statik ve dinamik postür analizi',
    type: 'assessment',
    info: 'Görsel postür analizi ve hareket kalitesi',
    fields: [
      {
        id: 'staticPosture',
        label: 'Statik Postür Kalitesi',
        type: 'select',
        required: true,
        options: [
          { value: '', text: 'Seçiniz' },
          { value: 'excellent', text: 'Mükemmel' },
          { value: 'good', text: 'İyi' },
          { value: 'fair', text: 'Orta' },
          { value: 'poor', text: 'Zayıf' }
        ]
      },
      {
        id: 'dynamicPosture',
        label: 'Dinamik Postür Kalitesi',
        type: 'select',
        required: true,
        options: [
          { value: '', text: 'Seçiniz' },
          { value: 'excellent', text: 'Mükemmel' },
          { value: 'good', text: 'İyi' },
          { value: 'fair', text: 'Orta' },
          { value: 'poor', text: 'Zayıf' }
        ]
      },
      {
        id: 'forwardHeadPosture',
        label: 'İleri Baş Postürü',
        type: 'select',
        options: [
          { value: '', text: 'Seçiniz' },
          { value: 'none', text: 'Yok' },
          { value: 'mild', text: 'Hafif' },
          { value: 'moderate', text: 'Orta' },
          { value: 'severe', text: 'Şiddetli' }
        ]
      },
      {
        id: 'roundedShoulders',
        label: 'Yuvarlak Omuzlar',
        type: 'select',
        options: [
          { value: '', text: 'Seçiniz' },
          { value: 'none', text: 'Yok' },
          { value: 'mild', text: 'Hafif' },
          { value: 'moderate', text: 'Orta' },
          { value: 'severe', text: 'Şiddetli' }
        ]
      },
      {
        id: 'kyphosis',
        label: 'Kifoz',
        type: 'select',
        options: [
          { value: '', text: 'Seçiniz' },
          { value: 'none', text: 'Yok' },
          { value: 'mild', text: 'Hafif' },
          { value: 'moderate', text: 'Orta' },
          { value: 'severe', text: 'Şiddetli' }
        ]
      },
      {
        id: 'lordosis',
        label: 'Lordoz',
        type: 'select',
        options: [
          { value: '', text: 'Seçiniz' },
          { value: 'none', text: 'Yok' },
          { value: 'mild', text: 'Hafif' },
          { value: 'moderate', text: 'Orta' },
          { value: 'severe', text: 'Şiddetli' }
        ]
      },
      {
        id: 'scoliosis',
        label: 'Skolyoz',
        type: 'select',
        options: [
          { value: '', text: 'Seçiniz' },
          { value: 'none', text: 'Yok' },
          { value: 'mild', text: 'Hafif' },
          { value: 'moderate', text: 'Orta' },
          { value: 'severe', text: 'Şiddetli' }
        ]
      },
      {
        id: 'pelvicTilt',
        label: 'Pelvik Tilt',
        type: 'select',
        options: [
          { value: '', text: 'Seçiniz' },
          { value: 'none', text: 'Yok' },
          { value: 'mild', text: 'Hafif' },
          { value: 'moderate', text: 'Orta' },
          { value: 'severe', text: 'Şiddetli' }
        ]
      },
      { id: 'upperCrossedSyndrome', label: 'Upper Crossed Syndrome', type: 'select', options: [
        { value: '', text: 'Seçiniz' }, { value: 'true', text: 'Var' }, { value: 'false', text: 'Yok' }
      ]},
      { id: 'lowerCrossedSyndrome', label: 'Lower Crossed Syndrome', type: 'select', options: [
        { value: '', text: 'Seçiniz' }, { value: 'true', text: 'Var' }, { value: 'false', text: 'Yok' }
      ]},
      { id: 'xLegsSyndrome', label: 'X-Legs Sendromu', type: 'select', options: [
        { value: '', text: 'Seçiniz' }, { value: 'true', text: 'Var' }, { value: 'false', text: 'Yok' }
      ]},
      { id: 'staticPostureAnterior', label: 'Anterior', type: 'textarea', placeholder: 'Ön görünüm değerlendirmesi...', rows: 2 },
      { id: 'staticPostureLateral', label: 'Lateral', type: 'textarea', placeholder: 'Yan görünüm değerlendirmesi...', rows: 2 },
      { id: 'staticPosturePosterior', label: 'Posterior', type: 'textarea', placeholder: 'Arka görünüm değerlendirmesi...', rows: 2 },
      { id: 'otherSyndromes', label: 'Diğer Sendromlar', type: 'textarea', placeholder: 'Gözlemlenen diğer postüral problemler...', rows: 3 }
    ]
  },

  // Step 11: Dynamic Posture (Overhead Squat)
  {
    id: 'overheadSquat',
    title: 'Dinamik Postür Değerlendirmesi (Overhead Squat)',
    subtitle: 'Hareket sırasındaki postür analizi',
    type: 'assessment',
    info: 'Over Head Squat testi ile dinamik hareket kalitesi',
    fields: [
      { id: 'overheadSquatLeft', label: 'Sol Taraf', type: 'textarea', placeholder: 'Sol taraf hareket kalitesi...', rows: 3 },
      { id: 'overheadSquatRight', label: 'Sağ Taraf', type: 'textarea', placeholder: 'Sağ taraf hareket kalitesi...', rows: 3 }
    ]
  },
  
  // Step 12: Strength Tests
  {
    id: 'strengthTests',
    title: 'Kuvvet Testleri',
    subtitle: 'Kas kuvveti değerlendirmesi',
    type: 'assessment',
    info: 'Core stability ve genel kas kuvveti',
    fields: [
      // { id: 'gripStrength', label: 'El Kavrama Kuvveti (kg)', type: 'number', placeholder: '40' },
      { id: 'pushUps', label: 'Şınav Sayısı', type: 'number', placeholder: '20' },
      { id: 'plankTime', label: 'Plank Süresi (saniye)', type: 'number', placeholder: '60' },
      { id: 'squats', label: 'Squat Sayısı', type: 'number', placeholder: '25' },
      { id: 'wallSitTime', label: 'Wall Sit Süresi (saniye)', type: 'number', placeholder: '60' }
    ]
  },
  
  // Step 13: Clinical Assessment
  {
    id: 'clinicalAssessment',
    title: 'Klinik Değerlendirme',
    subtitle: 'Genel sağlık durumu ve öneriler',
    type: 'assessment',
    info: 'Hekim görüşü, risk faktörleri ve öneriler',
    fields: [
      {
        id: 'overallRisk',
        label: 'Genel Risk Seviyesi',
        type: 'select',
        required: true,
        options: [
          { value: '', text: 'Seçiniz' },
          { value: 'low', text: 'Düşük Risk' },
          { value: 'moderate', text: 'Orta Risk' },
          { value: 'high', text: 'Yüksek Risk' }
        ]
      },
      {
        id: 'fitnessLevel',
        label: 'Fitness Seviyesi',
        type: 'select',
        required: true,
        options: [
          { value: '', text: 'Seçiniz' },
          { value: 'excellent', text: 'Mükemmel' },
          { value: 'good', text: 'İyi' },
          { value: 'average', text: 'Ortalama' },
          { value: 'poor', text: 'Zayıf' }
        ]
      },
      { id: 'recommendations', label: 'Öneriler ve Notlar', type: 'textarea', placeholder: 'Egzersiz önerileri, dikkat edilecek hususlar...', rows: 4 },
      { id: 'clinicalExamination', label: 'Klinik Muayene', type: 'select', options: [
        { value: '', text: 'Seçiniz' }, { value: 'true', text: 'Yapıldı' }, { value: 'false', text: 'Yapılmadı' }
      ]},
      { id: 'rehabilitationArea', label: 'Rehabilitasyon Alanı', type: 'select', options: [
        { value: '', text: 'Seçiniz' }, { value: 'true', text: 'Gerekli' }, { value: 'false', text: 'Gerekli Değil' }
      ]},
      { id: 'medicalFitnessExpert', label: 'Medikal Fitness Uzmanı', type: 'text', placeholder: 'Uzman adı' },
      { id: 'personalTraining', label: 'Personal Training', type: 'select', options: [
        { value: '', text: 'Seçiniz' }, { value: 'true', text: 'Önerilir' }, { value: 'false', text: 'Gerekli Değil' }
      ]},
      { id: 'fitnessGroupActivities', label: 'Fitness/Grup Aktiviteleri', type: 'select', options: [
        { value: '', text: 'Seçiniz' }, { value: 'true', text: 'Uygun' }, { value: 'false', text: 'Uygun Değil' }
      ]},
      { id: 'instructor', label: 'Eğitmen', type: 'text', placeholder: 'Eğitmen adı' },
      { id: 'overallResult', label: 'Sonuç', type: 'textarea', placeholder: 'Genel değerlendirme sonucu...', rows: 3 }
    ]
  },
  
  // Step 14: Summary
  {
    id: 'summary',
    title: 'Değerlendirme Raporu',
    subtitle: 'Tüm sonuçların özeti',
    type: 'summary'
  }
];

export const TOTAL_STEPS = ASSESSMENT_STEPS.length;