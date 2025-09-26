import React from 'react';

interface PersonalInfoData {
  name: string;
  gender: 'erkek' | 'kadın' | '';
  trainer: string;
  height: number | '';
  weight: number | '';
  age: number | '';
  date: string;
}

interface PersonalInfoSectionProps {
  data: PersonalInfoData;
  onChange: (field: keyof PersonalInfoData, value: string | number) => void;
  errors?: Partial<Record<keyof PersonalInfoData, string>>;
  isClientAssessment?: boolean;
  clientName?: string;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  data,
  onChange,
  errors = {},
  isClientAssessment = false,
  clientName
}) => {
  const handleInputChange = (field: keyof PersonalInfoData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'number' ?
      (e.target.value ? Number(e.target.value) : '') :
      e.target.value;
    onChange(field, value);
  };

  const handleRadioChange = (field: keyof PersonalInfoData, value: string) => () => {
    onChange(field, value);
  };

  return (
    <div className="card">
      <h2>Genel Bilgiler</h2>
      {isClientAssessment && clientName && (
        <div className="client-info-banner">
          <p><strong>Müşteri:</strong> {clientName}</p>
          <p className="help-text">Bu değerlendirme {clientName} için yapılmaktadır. Kişisel bilgiler müşteri kaydından alınmıştır.</p>
        </div>
      )}
      <div className="form-row-3" style={{ marginTop: 12 }}>
        <div className="form-group">
          <label className="form-label">Üye Adı Soyadı</label>
          <input
            type="text"
            className={`form-input ${errors.name ? 'invalid' : data.name ? 'valid' : ''}`}
            value={data.name}
            onChange={handleInputChange('name')}
            required
            readOnly={isClientAssessment}
            style={isClientAssessment ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
          />
          {errors.name && <div className="error-text">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Cinsiyet</label>
          <div className="radio-group">
            <div className="radio-item">
              <input
                type="radio"
                name="gender"
                value="erkek"
                id="gender_male"
                checked={data.gender === 'erkek'}
                onChange={handleRadioChange('gender', 'erkek')}
                disabled={isClientAssessment}
              />
              <label htmlFor="gender_male" style={isClientAssessment ? { color: '#999' } : {}}>Erkek</label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                name="gender"
                value="kadın"
                id="gender_female"
                checked={data.gender === 'kadın'}
                onChange={handleRadioChange('gender', 'kadın')}
                disabled={isClientAssessment}
              />
              <label htmlFor="gender_female" style={isClientAssessment ? { color: '#999' } : {}}>Kadın</label>
            </div>
          </div>
          {errors.gender && <div className="error-text">{errors.gender}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Trainer</label>
          <input
            type="text"
            className={`form-input ${errors.trainer ? 'invalid' : data.trainer ? 'valid' : ''}`}
            value={data.trainer}
            onChange={handleInputChange('trainer')}
          />
          {errors.trainer && <div className="error-text">{errors.trainer}</div>}
        </div>
      </div>

      <div className="form-row" style={{ marginTop: 12 }}>
        <div className="form-group">
          <label className="form-label">Boy (cm)</label>
          <input
            type="number"
            className={`form-input ${errors.height ? 'invalid' : data.height ? 'valid' : ''}`}
            value={data.height}
            onChange={handleInputChange('height')}
            min="100"
            max="250"
          />
          {errors.height && <div className="error-text">{errors.height}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Kilo (kg)</label>
          <input
            type="number"
            className={`form-input ${errors.weight ? 'invalid' : data.weight ? 'valid' : ''}`}
            value={data.weight}
            onChange={handleInputChange('weight')}
            min="30"
            max="200"
          />
          {errors.weight && <div className="error-text">{errors.weight}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Yaş</label>
          <input
            type="number"
            className={`form-input ${errors.age ? 'invalid' : data.age ? 'valid' : ''}`}
            value={data.age}
            onChange={handleInputChange('age')}
            min="16"
            max="100"
            readOnly={isClientAssessment}
            style={isClientAssessment ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
          />
          {errors.age && <div className="error-text">{errors.age}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Tarih</label>
          <input
            type="date"
            className={`form-input ${errors.date ? 'invalid' : data.date ? 'valid' : ''}`}
            value={data.date}
            onChange={handleInputChange('date')}
          />
          {errors.date && <div className="error-text">{errors.date}</div>}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;