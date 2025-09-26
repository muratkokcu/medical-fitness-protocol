import React from 'react';

interface CardiovascularData {
  systolic: number | '';
  diastolic: number | '';
  heart_rate: number | '';
  body_fat: number | '';
}

interface CardiovascularSectionProps {
  data: CardiovascularData;
  onChange: (field: keyof CardiovascularData, value: number | '') => void;
  errors?: Partial<Record<keyof CardiovascularData, string>>;
}

const CardiovascularSection: React.FC<CardiovascularSectionProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const handleInputChange = (field: keyof CardiovascularData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value ? Number(e.target.value) : '';
    onChange(field, value);
  };

  return (
    <div className="grid-2">
      <div className="card">
        <h3>KVH Tansiyon & Nabız Değerlendirmesi</h3>
        <p className="assessment-desc">
          Tansiyon ya da kan basıncı, kalbin kanı vücudumuza pompalarken damar duvarında oluşturduğu basınçtır.
        </p>

        <div className="form-group">
          <label className="form-label">Tansiyon (mmHg)</label>
          <div className="form-row">
            <input
              type="number"
              className={`form-input ${errors.systolic ? 'invalid' : data.systolic ? 'valid' : ''}`}
              placeholder="Sistolik"
              value={data.systolic}
              onChange={handleInputChange('systolic')}
              min="80"
              max="250"
            />
            <input
              type="number"
              className={`form-input ${errors.diastolic ? 'invalid' : data.diastolic ? 'valid' : ''}`}
              placeholder="Diastolik"
              value={data.diastolic}
              onChange={handleInputChange('diastolic')}
              min="40"
              max="150"
            />
          </div>
          {(errors.systolic || errors.diastolic) && (
            <div className="error-text">
              {errors.systolic || errors.diastolic}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Nabız (bpm)</label>
          <input
            type="number"
            className={`form-input ${errors.heart_rate ? 'invalid' : data.heart_rate ? 'valid' : ''}`}
            value={data.heart_rate}
            onChange={handleInputChange('heart_rate')}
            min="40"
            max="200"
          />
          {errors.heart_rate && <div className="error-text">{errors.heart_rate}</div>}
        </div>

        <div className="reference">
          <div className="reference-list">
            <div>
              <strong>Tansiyon:</strong> 120-80: Normal | 140-90: 1.Seviye | 160-100: 2.Seviye | 160-110: 3.Seviye
            </div>
            <div>
              <strong>Nabız:</strong> 46-60: Çok iyi | 60-80: Normal | 85-100: Yüksek | 100+: Riskli
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Toplam Vücut Yağ Oranı</h3>
        <p className="assessment-desc">
          Vücudun harcadığından fazla enerji alımı, vücutta yağ artışına bu durumda insülin direnci,
          diyabet, kalp-damar hastalıkları riskini artırır.
        </p>

        <div className="form-group">
          <label className="form-label">Vücut Yağ Oranı (%)</label>
          <input
            type="number"
            className={`form-input ${errors.body_fat ? 'invalid' : data.body_fat ? 'valid' : ''}`}
            value={data.body_fat}
            onChange={handleInputChange('body_fat')}
            min="5"
            max="50"
            step="0.1"
          />
          {errors.body_fat && <div className="error-text">{errors.body_fat}</div>}
        </div>

        <div className="reference">
          <div className="reference-list">
            <div>
              <strong>Erkek:</strong> %8-12: Çok iyi | %13-20: Normal | %20+: Riskli
            </div>
            <div>
              <strong>Kadın:</strong> %14-20: Çok iyi | %21-31: Normal | %31+: Riskli
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardiovascularSection;