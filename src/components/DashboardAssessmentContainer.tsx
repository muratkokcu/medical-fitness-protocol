import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { assessmentAPI } from '../services/api';
// import { useAuth } from '../contexts/AuthContext'; // Will be used later
import AssessmentContainer from './AssessmentContainer';
import type { AssessmentData } from '../types/assessment';

interface DashboardAssessmentContainerProps {
  mode?: 'create' | 'edit' | 'view';
}

const DashboardAssessmentContainer: React.FC<DashboardAssessmentContainerProps> = ({ mode = 'create' }) => {
  const { assessmentId, clientId: urlClientId } = useParams<{ assessmentId: string; clientId: string }>();
  const [searchParams] = useSearchParams();
  const clientId = urlClientId || searchParams.get('clientId');
  const navigate = useNavigate();
  // const { user } = useAuth(); // Will be used for practitioner info later

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialData, setInitialData] = useState<AssessmentData>({});
  const [createdAssessmentId, setCreatedAssessmentId] = useState<string | null>(null);
  const [actualMode, setActualMode] = useState(mode);

  useEffect(() => {
    if (mode === 'edit' || mode === 'view') {
      fetchAssessmentData();
    } else if (clientId) {
      // For new assessments, just set the clientId
      setInitialData({ clientId });
    }
  }, [assessmentId, clientId, mode]);

  const fetchAssessmentData = async () => {
    if (!assessmentId) return;

    try {
      setIsLoading(true);
      const response = await assessmentAPI.getAssessment(assessmentId);
      const assessment = response.data.data.assessment;
      
      // Transform backend data to frontend format
      const transformedData = transformBackendToFrontend(assessment);
      setInitialData(transformedData);
    } catch (error: any) {
      console.error('Fetch assessment error:', error);
      setError('Assessment verisi yüklenirken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const transformBackendToFrontend = (backendAssessment: any): AssessmentData => {
    return {
      // Assessment Information
      assessmentDate: backendAssessment.assessmentDate ? 
        new Date(backendAssessment.assessmentDate).toISOString().split('T')[0] : undefined,
      trainer: backendAssessment.personalInfo?.trainer,
      height: backendAssessment.personalInfo?.height,
      weight: backendAssessment.personalInfo?.weight,
      
      // Client Information (read-only, for display and calculations)
      fullName: backendAssessment.client?.fullName,
      gender: backendAssessment.client?.gender,
      clientId: backendAssessment.client?._id,
      
      // Vital Signs
      systolicBP: backendAssessment.vitalSigns?.systolicBP,
      diastolicBP: backendAssessment.vitalSigns?.diastolicBP,
      restingHR: backendAssessment.vitalSigns?.restingHR,
      bodyTemperature: backendAssessment.vitalSigns?.bodyTemperature,
      
      // Body Composition
      bodyFatPercentage: backendAssessment.bodyComposition?.bodyFatPercentage,
      muscleMass: backendAssessment.bodyComposition?.muscleMass,
      visceralFat: backendAssessment.bodyComposition?.visceralFat,
      waistCircumference: backendAssessment.bodyComposition?.waistCircumference,
      hipCircumference: backendAssessment.bodyComposition?.hipCircumference,
      
      // Respiratory
      respiratoryRate: backendAssessment.respiratory?.respiratoryRate,
      peakFlowRate: backendAssessment.respiratory?.peakFlowRate,
      breathHoldTime: backendAssessment.respiratory?.breathHoldTime,
      chestExpansion: backendAssessment.respiratory?.chestExpansion,
      respiratoryDysfunction: backendAssessment.respiratory?.respiratoryDysfunction,
      
      // Biomechanical Assessment
      shoulderFlexion: backendAssessment.biomechanical?.shoulderFlexion,
      shoulderExtension: backendAssessment.biomechanical?.shoulderExtension,
      spinalRotation: backendAssessment.biomechanical?.spinalRotation,
      hipFlexibility: backendAssessment.biomechanical?.hipFlexibility,
      ankleFlexibility: backendAssessment.biomechanical?.ankleFlexibility,
      
      // Balance and Coordination
      staticBalance: backendAssessment.balance?.staticBalance,
      singleLegBalanceKneeRotation: backendAssessment.balance?.singleLegBalance?.kneeRotation,
      singleLegBalanceHipShift: backendAssessment.balance?.singleLegBalance?.hipShift,
      singleLegBalanceTrunkRotation: backendAssessment.balance?.singleLegBalance?.trunkRotation,
      
      // Walking & Foot Strike Analysis
      walkingFootStrikeLeft: backendAssessment.gaitAnalysis?.footStrike?.left,
      walkingFootStrikeRight: backendAssessment.gaitAnalysis?.footStrike?.right,
      footStrikeType: backendAssessment.gaitAnalysis?.footStrike?.type,
      
      // Mobility Tests
      shoulderMobilityLeft: backendAssessment.mobility?.shoulderMobility?.left,
      shoulderMobilityRight: backendAssessment.mobility?.shoulderMobility?.right,
      trunkFlexibilityForward: backendAssessment.mobility?.trunkFlexibility?.forward,
      trunkFlexibilityBackward: backendAssessment.mobility?.trunkFlexibility?.backward,
      sitReachTime: backendAssessment.mobility?.sitReachTime,
      
      // Posture Assessment
      staticPosture: backendAssessment.posture?.static,
      dynamicPosture: backendAssessment.posture?.dynamic,
      staticPostureAnterior: backendAssessment.posture?.details?.anterior,
      staticPostureLateral: backendAssessment.posture?.details?.lateral,
      staticPosturePosterior: backendAssessment.posture?.details?.posterior,
      forwardHeadPosture: backendAssessment.posture?.conditions?.forwardHeadPosture,
      roundedShoulders: backendAssessment.posture?.conditions?.roundedShoulders,
      kyphosis: backendAssessment.posture?.conditions?.kyphosis,
      lordosis: backendAssessment.posture?.conditions?.lordosis,
      scoliosis: backendAssessment.posture?.conditions?.scoliosis,
      pelvicTilt: backendAssessment.posture?.conditions?.pelvicTilt,
      upperCrossedSyndrome: backendAssessment.posture?.syndromes?.upperCrossed,
      lowerCrossedSyndrome: backendAssessment.posture?.syndromes?.lowerCrossed,
      xLegsSyndrome: backendAssessment.posture?.syndromes?.xLegs,
      otherSyndromes: backendAssessment.posture?.syndromes?.other,
      
      // Dynamic Posture (Overhead Squat)
      overheadSquatLeft: backendAssessment.dynamicPosture?.overheadSquat?.left,
      overheadSquatRight: backendAssessment.dynamicPosture?.overheadSquat?.right,
      
      // Strength Tests
      pushUps: backendAssessment.strengthTests?.pushUps,
      plankTime: backendAssessment.strengthTests?.plankTime,
      squats: backendAssessment.strengthTests?.squats,
      wallSitTime: backendAssessment.strengthTests?.wallSitTime,
      
      // Clinical Assessment
      overallRisk: backendAssessment.clinicalAssessment?.overallRisk,
      fitnessLevel: backendAssessment.clinicalAssessment?.fitnessLevel,
      recommendations: backendAssessment.clinicalAssessment?.recommendations,
      clinicalExamination: backendAssessment.clinicalAssessment?.clinicalExamination,
      rehabilitationArea: backendAssessment.clinicalAssessment?.rehabilitationArea,
      medicalFitnessExpert: backendAssessment.clinicalAssessment?.medicalFitnessExpert,
      personalTraining: backendAssessment.clinicalAssessment?.personalTraining,
      fitnessGroupActivities: backendAssessment.clinicalAssessment?.fitnessGroupActivities,
      instructor: backendAssessment.clinicalAssessment?.instructor,
      overallResult: backendAssessment.clinicalAssessment?.overallResult,
    };
  };

  const transformFrontendToBackend = (frontendData: AssessmentData): any => {
    return {
      clientId: frontendData.clientId || clientId,
      assessmentDate: frontendData.assessmentDate ? new Date(frontendData.assessmentDate) : new Date(),
      status: 'draft', // Will be updated based on completion
      
      personalInfo: {
        height: frontendData.height,
        weight: frontendData.weight,
        trainer: frontendData.trainer,
      },
      
      vitalSigns: {
        systolicBP: frontendData.systolicBP,
        diastolicBP: frontendData.diastolicBP,
        restingHR: frontendData.restingHR,
        bodyTemperature: frontendData.bodyTemperature,
      },
      
      bodyComposition: {
        bodyFatPercentage: frontendData.bodyFatPercentage,
        muscleMass: frontendData.muscleMass,
        visceralFat: frontendData.visceralFat,
        waistCircumference: frontendData.waistCircumference,
        hipCircumference: frontendData.hipCircumference,
      },
      
      respiratory: {
        respiratoryRate: frontendData.respiratoryRate,
        peakFlowRate: frontendData.peakFlowRate,
        breathHoldTime: frontendData.breathHoldTime,
        chestExpansion: frontendData.chestExpansion,
        respiratoryDysfunction: frontendData.respiratoryDysfunction,
      },
      
      biomechanical: {
        shoulderFlexion: frontendData.shoulderFlexion,
        shoulderExtension: frontendData.shoulderExtension,
        spinalRotation: frontendData.spinalRotation,
        hipFlexibility: frontendData.hipFlexibility,
        ankleFlexibility: frontendData.ankleFlexibility,
      },
      
      balance: {
        staticBalance: frontendData.staticBalance,
        singleLegBalance: {
          kneeRotation: frontendData.singleLegBalanceKneeRotation,
          hipShift: frontendData.singleLegBalanceHipShift,
          trunkRotation: frontendData.singleLegBalanceTrunkRotation,
        },
      },
      
      gaitAnalysis: {
        footStrike: {
          left: frontendData.walkingFootStrikeLeft,
          right: frontendData.walkingFootStrikeRight,
          type: frontendData.footStrikeType,
        },
      },
      
      mobility: {
        shoulderMobility: {
          left: frontendData.shoulderMobilityLeft,
          right: frontendData.shoulderMobilityRight,
        },
        trunkFlexibility: {
          forward: frontendData.trunkFlexibilityForward,
          backward: frontendData.trunkFlexibilityBackward,
        },
        sitReachTime: frontendData.sitReachTime,
      },
      
      posture: {
        static: frontendData.staticPosture,
        dynamic: frontendData.dynamicPosture,
        details: {
          anterior: frontendData.staticPostureAnterior,
          lateral: frontendData.staticPostureLateral,
          posterior: frontendData.staticPosturePosterior,
        },
        conditions: {
          forwardHeadPosture: frontendData.forwardHeadPosture,
          roundedShoulders: frontendData.roundedShoulders,
          kyphosis: frontendData.kyphosis,
          lordosis: frontendData.lordosis,
          scoliosis: frontendData.scoliosis,
          pelvicTilt: frontendData.pelvicTilt,
        },
        syndromes: {
          upperCrossed: frontendData.upperCrossedSyndrome,
          lowerCrossed: frontendData.lowerCrossedSyndrome,
          xLegs: frontendData.xLegsSyndrome,
          other: frontendData.otherSyndromes,
        },
      },
      
      dynamicPosture: {
        overheadSquat: {
          left: frontendData.overheadSquatLeft,
          right: frontendData.overheadSquatRight,
        },
      },
      
      strengthTests: {
        pushUps: frontendData.pushUps,
        plankTime: frontendData.plankTime,
        squats: frontendData.squats,
        wallSitTime: frontendData.wallSitTime,
      },
      
      clinicalAssessment: {
        overallRisk: frontendData.overallRisk,
        fitnessLevel: frontendData.fitnessLevel,
        recommendations: frontendData.recommendations,
        clinicalExamination: frontendData.clinicalExamination,
        rehabilitationArea: frontendData.rehabilitationArea,
        medicalFitnessExpert: frontendData.medicalFitnessExpert,
        personalTraining: frontendData.personalTraining,
        fitnessGroupActivities: frontendData.fitnessGroupActivities,
        instructor: frontendData.instructor,
        overallResult: frontendData.overallResult,
      },
    };
  };

  const handleAssessmentSave = async (assessmentData: AssessmentData, isCompleted: boolean = false) => {
    try {
      const backendData = transformFrontendToBackend(assessmentData);
      
      // Update status based on completion
      backendData.status = isCompleted ? 'completed' : 'draft';
      
      let response;
      
      // Create-once-then-update pattern
      if (actualMode === 'create' && !createdAssessmentId) {
        // First save - create new assessment
        response = await assessmentAPI.createAssessment(backendData);
        const newAssessmentId = response.data.data.assessment._id;
        setCreatedAssessmentId(newAssessmentId);
        setActualMode('edit'); // Switch to edit mode after creation
      } else {
        // Subsequent saves - update existing assessment
        const idToUse = createdAssessmentId || assessmentId;
        response = await assessmentAPI.updateAssessment(idToUse!, backendData);
      }
      
      if (isCompleted) {
        // Navigate to client detail page or assessment list
        if (clientId) {
          navigate(`/dashboard/clients/${clientId}`);
        } else {
          navigate('/dashboard/assessments');
        }
      }
      
      return response.data.data.assessment;
    } catch (error: any) {
      console.error('Assessment save error:', error);
      throw new Error('Assessment kaydedilirken hata oluştu.');
    }
  };

  const handleAssessmentComplete = (assessmentData: AssessmentData) => {
    handleAssessmentSave(assessmentData, true);
  };

  const handleExit = () => {
    if (clientId) {
      navigate(`/dashboard/clients/${clientId}`);
    } else {
      navigate('/dashboard/assessments');
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        fontSize: '18px',
        color: '#6E6E73'
      }}>
        Assessment yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        gap: '16px'
      }}>
        <div style={{ color: '#ff4444', fontSize: '18px' }}>{error}</div>
        <button 
          onClick={handleExit}
          style={{
            padding: '12px 24px',
            backgroundColor: '#000',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {mode === 'edit' && (
        <div style={{
          background: '#1D1D1F',
          color: 'white',
          padding: '0.5rem 1rem',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Düzenleme Modu - Değişiklikler otomatik kaydedilir
        </div>
      )}
      <AssessmentContainer
        initialData={initialData}
        onComplete={handleAssessmentComplete}
        onSave={handleAssessmentSave}
        onExit={handleExit}
        isReadOnly={mode === 'view'}
        mode={actualMode}
      />
    </div>
  );
};

export default DashboardAssessmentContainer;