import React from 'react';

interface MobilityBalanceData {
  left_foot: 'normal' | 'pronation' | 'supination' | '';
  right_foot: 'normal' | 'pronation' | 'supination' | '';
  balance_left: number | '';
  balance_right: number | '';
  shoulder_left: 'iyi' | 'normal' | 'riskli' | '';
  shoulder_right: 'iyi' | 'normal' | 'riskli' | '';
  sit_reach: number | '';
}

interface MobilityBalanceSectionProps {
  data: MobilityBalanceData;
  onChange: (field: keyof MobilityBalanceData, value: string | number) => void;
  errors?: Partial<Record<keyof MobilityBalanceData, string>>;
}

const MobilityBalanceSection: React.FC<MobilityBalanceSectionProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const handleInputChange = (field: 'balance_left' | 'balance_right' | 'sit_reach') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value ? Number(e.target.value) : '';
    onChange(field, value);
  };

  const handleRadioChange = (field: keyof MobilityBalanceData, value: string) => () => {
    onChange(field, value);
  };

  return (
    <>
      {/* Gait Analysis and Balance */}
      <div className="grid-2">
        <div className="card">
          <h3>Yürüyüş & Ayak Basış Analizi</h3>
          <p className="assessment-desc">
            Pronasyon ve süpinasyon varsa iskelet-kas sistemi rahatsızlıkları (bel, diz, boyun ağrıları) riskleri vardır.
          </p>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sol Ayak</label>
              <div className="radio-group">
                <div className="radio-item">
                  <input
                    type="radio"
                    name="left_foot"
                    value="normal"
                    id="left_normal"
                    checked={data.left_foot === 'normal'}
                    onChange={handleRadioChange('left_foot', 'normal')}
                  />
                  <label htmlFor="left_normal">Normal (0-10mm)</label>
                </div>
                <div className="radio-item">
                  <input
                    type="radio"
                    name="left_foot"
                    value="pronation"
                    id="left_pronation"
                    checked={data.left_foot === 'pronation'}
                    onChange={handleRadioChange('left_foot', 'pronation')}
                  />
                  <label htmlFor="left_pronation">Pronasyon (10mm+)</label>
                </div>
                <div className="radio-item">
                  <input
                    type="radio"
                    name="left_foot"
                    value="supination"
                    id="left_supination"
                    checked={data.left_foot === 'supination'}
                    onChange={handleRadioChange('left_foot', 'supination')}
                  />
                  <label htmlFor="left_supination">Süpinasyon (10mm+)</label>
                </div>
              </div>
              {errors.left_foot && <div className="error-text">{errors.left_foot}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Sağ Ayak</label>
              <div className="radio-group">
                <div className="radio-item">
                  <input
                    type="radio"
                    name="right_foot"
                    value="normal"
                    id="right_normal"
                    checked={data.right_foot === 'normal'}
                    onChange={handleRadioChange('right_foot', 'normal')}
                  />
                  <label htmlFor="right_normal">Normal (0-10mm)</label>
                </div>
                <div className="radio-item">
                  <input
                    type="radio"
                    name="right_foot"
                    value="pronation"
                    id="right_pronation"
                    checked={data.right_foot === 'pronation'}
                    onChange={handleRadioChange('right_foot', 'pronation')}
                  />
                  <label htmlFor="right_pronation">Pronasyon (10mm+)</label>
                </div>
                <div className="radio-item">
                  <input
                    type="radio"
                    name="right_foot"
                    value="supination"
                    id="right_supination"
                    checked={data.right_foot === 'supination'}
                    onChange={handleRadioChange('right_foot', 'supination')}
                  />
                  <label htmlFor="right_supination">Süpinasyon (10mm+)</label>
                </div>
              </div>
              {errors.right_foot && <div className="error-text">{errors.right_foot}</div>}
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Single Leg Balance Testi</h3>
          <p className="assessment-desc">
            Yürüyüş hareketinin %85'i tek ayak üzerinde gerçekleştiğinden postürü tek ayak olarak düşünmeliyiz.
          </p>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sol Ayak (saniye)</label>
              <input
                type="number"
                className={`form-input ${errors.balance_left ? 'invalid' : data.balance_left ? 'valid' : ''}`}
                value={data.balance_left}
                onChange={handleInputChange('balance_left')}
                min="0"
                max="300"
              />
              {errors.balance_left && <div className="error-text">{errors.balance_left}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Sağ Ayak (saniye)</label>
              <input
                type="number"
                className={`form-input ${errors.balance_right ? 'invalid' : data.balance_right ? 'valid' : ''}`}
                value={data.balance_right}
                onChange={handleInputChange('balance_right')}
                min="0"
                max="300"
              />
              {errors.balance_right && <div className="error-text">{errors.balance_right}</div>}
            </div>
          </div>

          <div className="reference">
            <div className="reference-list">
              <div>60 sn Üstü: İyi | 29-60 sn: Normal | 29 sn Altı: Zayıf</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobility Tests */}
      <div className="grid-2">
        <div className="card">
          <h3>Shoulder (Omuz) Mobility</h3>
          <p className="assessment-desc">
            İnsan vücudundaki en hareketli ve mobil eklem omuz eklemidir.
          </p>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sol Omuz</label>
              <div className="radio-group">
                <div className="radio-item">
                  <input
                    type="radio"
                    name="shoulder_left"
                    value="iyi"
                    id="shoulder_left_good"
                    checked={data.shoulder_left === 'iyi'}
                    onChange={handleRadioChange('shoulder_left', 'iyi')}
                  />
                  <label htmlFor="shoulder_left_good">İyi</label>
                </div>
                <div className="radio-item">
                  <input
                    type="radio"
                    name="shoulder_left"
                    value="normal"
                    id="shoulder_left_normal"
                    checked={data.shoulder_left === 'normal'}
                    onChange={handleRadioChange('shoulder_left', 'normal')}
                  />
                  <label htmlFor="shoulder_left_normal">Normal</label>
                </div>
                <div className="radio-item">
                  <input
                    type="radio"
                    name="shoulder_left"
                    value="riskli"
                    id="shoulder_left_risk"
                    checked={data.shoulder_left === 'riskli'}
                    onChange={handleRadioChange('shoulder_left', 'riskli')}
                  />
                  <label htmlFor="shoulder_left_risk">Riskli</label>
                </div>
              </div>
              {errors.shoulder_left && <div className="error-text">{errors.shoulder_left}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Sağ Omuz</label>
              <div className="radio-group">
                <div className="radio-item">
                  <input
                    type="radio"
                    name="shoulder_right"
                    value="iyi"
                    id="shoulder_right_good"
                    checked={data.shoulder_right === 'iyi'}
                    onChange={handleRadioChange('shoulder_right', 'iyi')}
                  />
                  <label htmlFor="shoulder_right_good">İyi</label>
                </div>
                <div className="radio-item">
                  <input
                    type="radio"
                    name="shoulder_right"
                    value="normal"
                    id="shoulder_right_normal"
                    checked={data.shoulder_right === 'normal'}
                    onChange={handleRadioChange('shoulder_right', 'normal')}
                  />
                  <label htmlFor="shoulder_right_normal">Normal</label>
                </div>
                <div className="radio-item">
                  <input
                    type="radio"
                    name="shoulder_right"
                    value="riskli"
                    id="shoulder_right_risk"
                    checked={data.shoulder_right === 'riskli'}
                    onChange={handleRadioChange('shoulder_right', 'riskli')}
                  />
                  <label htmlFor="shoulder_right_risk">Riskli</label>
                </div>
              </div>
              {errors.shoulder_right && <div className="error-text">{errors.shoulder_right}</div>}
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Sit & Reach (Gövde) Mobility</h3>
          <p className="assessment-desc">
            Hamstring, Lower Back ve Gluteal kasların esnekliğini ölçer.
          </p>

          <div className="form-group">
            <label className="form-label">Ölçüm (cm)</label>
            <input
              type="number"
              className={`form-input ${errors.sit_reach ? 'invalid' : data.sit_reach ? 'valid' : ''}`}
              value={data.sit_reach}
              onChange={handleInputChange('sit_reach')}
              min="-20"
              max="50"
              step="0.5"
            />
            {errors.sit_reach && <div className="error-text">{errors.sit_reach}</div>}
          </div>

          <div className="reference">
            <div className="reference-list">
              <div>
                <strong>Erkek:</strong> 0-5 cm: Normal | 17 cm+: İyi | -1 cm altı: Riskli
              </div>
              <div>
                <strong>Kadın:</strong> 1-10 cm: Normal | 21 cm+: İyi | 0 cm altı: Riskli
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobilityBalanceSection;