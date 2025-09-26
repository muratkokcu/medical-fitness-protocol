import React from 'react';

interface BodyCompositionData {
  waist: number | '';
  hip: number | '';
  breathing: 'normal' | 'disfonksiyon' | 'zayif_diyafram' | 'apikal' | '';
}

interface BodyCompositionSectionProps {
  data: BodyCompositionData;
  onChange: (field: keyof BodyCompositionData, value: string | number) => void;
  errors?: Partial<Record<keyof BodyCompositionData, string>>;
}

const BodyCompositionSection: React.FC<BodyCompositionSectionProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const handleInputChange = (field: 'waist' | 'hip') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value ? Number(e.target.value) : '';
    onChange(field, value);
  };

  const handleRadioChange = (value: string) => () => {
    onChange('breathing', value);
  };

  return (
    <div className="grid-2">
      <div className="card">
        <h3>Bel Kalça Oranı</h3>
        <p className="assessment-desc">
          Değerlendirme önemlidir çünkü kronik hastalıklar ve orta bölümde toplanmış yağ arasında bir ilişki vardır.
        </p>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Bel Çevresi (cm)</label>
            <input
              type="number"
              className={`form-input ${errors.waist ? 'invalid' : data.waist ? 'valid' : ''}`}
              value={data.waist}
              onChange={handleInputChange('waist')}
              min="50"
              max="150"
            />
            {errors.waist && <div className="error-text">{errors.waist}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Kalça Çevresi (cm)</label>
            <input
              type="number"
              className={`form-input ${errors.hip ? 'invalid' : data.hip ? 'valid' : ''}`}
              value={data.hip}
              onChange={handleInputChange('hip')}
              min="60"
              max="180"
            />
            {errors.hip && <div className="error-text">{errors.hip}</div>}
          </div>
        </div>

        <div className="reference">
          <div className="reference-list">
            <div>
              <strong>Erkek:</strong> 0,85 Altı: Çok iyi | 0,85-0,90: İyi | 0,95+: Riskli
            </div>
            <div>
              <strong>Kadın:</strong> 0,75 Altı: Çok iyi | 0,75-0,80: İyi | 0,95+: Riskli
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Solunum Fonksiyon (Nefes) Testi</h3>
        <p className="assessment-desc">
          Yanlış nefes alan kişiler egzersiz ve rehabilitasyonun mekanik ve fizyolojik hedeflerine ulaşamazlar.
        </p>

        <div className="form-group">
          <label className="form-label">Nefes Değerlendirmesi</label>
          <div className="radio-group">
            <div className="radio-item">
              <input
                type="radio"
                name="breathing"
                value="normal"
                id="breathing_normal"
                checked={data.breathing === 'normal'}
                onChange={handleRadioChange('normal')}
              />
              <label htmlFor="breathing_normal">Normal</label>
            </div>

            <div className="radio-item">
              <input
                type="radio"
                name="breathing"
                value="disfonksiyon"
                id="breathing_dysfunction"
                checked={data.breathing === 'disfonksiyon'}
                onChange={handleRadioChange('disfonksiyon')}
              />
              <label htmlFor="breathing_dysfunction">Nefes Disfonksiyonu</label>
            </div>

            <div className="radio-item">
              <input
                type="radio"
                name="breathing"
                value="zayif_diyafram"
                id="breathing_weak"
                checked={data.breathing === 'zayif_diyafram'}
                onChange={handleRadioChange('zayif_diyafram')}
              />
              <label htmlFor="breathing_weak">Zayıf Diyafram</label>
            </div>

            <div className="radio-item">
              <input
                type="radio"
                name="breathing"
                value="apikal"
                id="breathing_apical"
                checked={data.breathing === 'apikal'}
                onChange={handleRadioChange('apikal')}
              />
              <label htmlFor="breathing_apical">Apikal</label>
            </div>
          </div>
          {errors.breathing && <div className="error-text">{errors.breathing}</div>}
        </div>
      </div>
    </div>
  );
};

export default BodyCompositionSection;