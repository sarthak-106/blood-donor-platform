'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Heart,
  AlertTriangle,
  Clock,
  Shield,
  Droplets,
} from 'lucide-react';

interface Question {
  id: string;
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  yesLabel?: string;
  noLabel?: string;
  yesIsDefer?: boolean; // if yes → deferred
  noIsDefer?: boolean;  // if no → deferred
  deferReason?: string;
  deferDays?: number;
  inputType?: 'yesno' | 'weight';
}

const QUESTIONS: Question[] = [
  {
    id: 'last_donation',
    step: 1,
    icon: <Clock className="w-6 h-6 text-amber-400" />,
    title: 'Recent Donation',
    description: 'Have you donated blood in the last 90 days?',
    yesLabel: 'Yes, I donated recently',
    noLabel: 'No, it has been longer',
    yesIsDefer: true,
    deferReason: 'You must wait at least 90 days between whole blood donations.',
    deferDays: 90,
  },
  {
    id: 'weight',
    step: 2,
    icon: <Shield className="w-6 h-6 text-blue-400" />,
    title: 'Body Weight',
    description: 'Do you weigh at least 50 kg (110 lbs)?',
    yesLabel: 'Yes, 50 kg or more',
    noLabel: 'No, I weigh less than 50 kg',
    noIsDefer: true,
    deferReason: 'Donors must weigh at least 50 kg to safely donate blood.',
  },
  {
    id: 'health',
    step: 3,
    icon: <Heart className="w-6 h-6 text-red-400" />,
    title: 'Current Health',
    description: 'Do you currently have fever, cold, flu, or any active infection?',
    yesLabel: 'Yes, I am unwell right now',
    noLabel: 'No, I feel healthy today',
    yesIsDefer: true,
    deferReason: 'You must be fully recovered from any illness before donating.',
    deferDays: 7,
  },
  {
    id: 'medications',
    step: 4,
    icon: <AlertTriangle className="w-6 h-6 text-orange-400" />,
    title: 'Current Medications',
    description: 'Are you currently on antibiotics, blood thinners (e.g. warfarin), or steroid medication?',
    yesLabel: 'Yes, I am on such medication',
    noLabel: 'No, I am not on those medications',
    yesIsDefer: true,
    deferReason: 'Certain medications disqualify donation. Please consult your doctor or the blood bank.',
    deferDays: 14,
  },
  {
    id: 'travel',
    step: 5,
    icon: <Droplets className="w-6 h-6 text-teal-400" />,
    title: 'Recent Travel',
    description: 'Have you traveled to a malaria-prone zone in the last 12 months?',
    yesLabel: 'Yes, I have traveled to such an area',
    noLabel: 'No, I have not',
    yesIsDefer: true,
    deferReason: 'Travel to malaria-endemic regions requires a 12-month deferral period.',
    deferDays: 365,
  },
  {
    id: 'tattoo',
    step: 6,
    icon: <Shield className="w-6 h-6 text-purple-400" />,
    title: 'Tattoo / Piercing',
    description: 'Have you had a tattoo, ear piercing, or body piercing in the last 6 months?',
    yesLabel: 'Yes, within the last 6 months',
    noLabel: 'No, or it was more than 6 months ago',
    yesIsDefer: true,
    deferReason: 'Tattoos and piercings require a 6-month waiting period to prevent bloodborne disease risk.',
    deferDays: 180,
  },
  {
    id: 'pregnancy',
    step: 7,
    icon: <Heart className="w-6 h-6 text-pink-400" />,
    title: 'Pregnancy / Breastfeeding',
    description: 'Are you currently pregnant or breastfeeding?',
    yesLabel: 'Yes',
    noLabel: 'No',
    yesIsDefer: true,
    deferReason: 'Pregnant and breastfeeding individuals should not donate blood for health and safety reasons.',
    deferDays: 180,
  },
];

type Answer = 'yes' | 'no';

export default function EligibilityPage() {
  const [currentStep, setCurrentStep] = useState(0); // 0 = intro
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [deferInfo, setDeferInfo] = useState<{ reason: string; days?: number } | null>(null);
  const [showResult, setShowResult] = useState(false);

  const totalSteps = QUESTIONS.length;
  const currentQuestion = currentStep > 0 && currentStep <= totalSteps ? QUESTIONS[currentStep - 1] : null;
  const progress = currentStep === 0 ? 0 : Math.round((currentStep / totalSteps) * 100);

  function handleAnswer(questionId: string, answer: Answer) {
    const q = QUESTIONS.find((q) => q.id === questionId)!;
    const isDeferred =
      (answer === 'yes' && q.yesIsDefer) || (answer === 'no' && q.noIsDefer);

    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    if (isDeferred) {
      setDeferInfo({ reason: q.deferReason!, days: q.deferDays });
      setShowResult(true);
    } else if (currentStep >= totalSteps) {
      // All answered, no deferral
      setShowResult(true);
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    } else {
      setCurrentStep(0);
    }
  }

  function handleRestart() {
    setCurrentStep(0);
    setAnswers({});
    setDeferInfo(null);
    setShowResult(false);
  }

  // ── INTRO SCREEN ──────────────────────────────────────────────────────────
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
              <CheckCircle2 className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Pre-Donation Eligibility Check
            </h1>
            <p className="text-gray-400">
              Answer 7 quick questions to find out if you&apos;re ready to save lives today.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 mb-6 space-y-3">
            {[
              'Takes about 2 minutes',
              'Based on NBTC & WHO guidelines',
              'Your answers are not stored',
              'Consult a doctor for medical advice',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentStep(1)}
            className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 font-semibold text-lg transition-colors flex items-center justify-center gap-2"
          >
            Start Check <ChevronRight className="w-5 h-5" />
          </button>

          <p className="text-center text-xs text-gray-600 mt-4">
            This is a self-screening tool only — not a medical assessment.
          </p>
        </div>
      </div>
    );
  }

  // ── RESULT SCREEN ──────────────────────────────────────────────────────────
  if (showResult) {
    const isEligible = !deferInfo;

    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          {isEligible ? (
            <>
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500 mb-6 animate-pulse">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-emerald-400 mb-2">You Are Eligible! ✅</h2>
              <p className="text-gray-300 mb-8">
                Based on your answers, you appear to be eligible to donate blood today. Visit a nearby
                blood bank or donation camp to make a difference.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Link
                  href="/find-donor"
                  className="py-3 rounded-2xl bg-red-600 hover:bg-red-500 font-semibold transition-colors text-sm"
                >
                  Respond to a Request
                </Link>
                <Link
                  href="/camps"
                  className="py-3 rounded-2xl bg-gray-800 hover:bg-gray-700 font-semibold transition-colors text-sm"
                >
                  Find a Camp
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500 mb-6">
                <Clock className="w-12 h-12 text-amber-400" />
              </div>
              <h2 className="text-3xl font-bold text-amber-400 mb-2">Please Wait — Deferred</h2>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mb-6 text-left">
                <p className="text-amber-300 font-medium mb-1">Reason</p>
                <p className="text-gray-300 text-sm">{deferInfo?.reason}</p>
                {deferInfo?.days && (
                  <p className="text-amber-400 text-sm font-semibold mt-3">
                    Suggested wait: ~{deferInfo.days} days
                  </p>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Deferral protects both you and the recipient. Please check back when your waiting period
                is over — your donation will be invaluable then! 💪
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/camps"
                  className="py-3 rounded-2xl bg-gray-800 hover:bg-gray-700 font-semibold transition-colors text-sm"
                >
                  Upcoming Camps
                </Link>
                <Link
                  href="/"
                  className="py-3 rounded-2xl bg-gray-800 hover:bg-gray-700 font-semibold transition-colors text-sm"
                >
                  Back to Home
                </Link>
              </div>
            </>
          )}

          <button
            onClick={handleRestart}
            className="mt-6 text-sm text-gray-500 hover:text-gray-300 underline transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  // ── QUESTION SCREEN ────────────────────────────────────────────────────────
  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-800">
        <div
          className="h-full bg-red-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          {/* Step counter */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <span className="text-sm text-gray-500">
              Question {currentStep} of {totalSteps}
            </span>
            <div className="w-14" /> {/* spacer */}
          </div>

          {/* Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-gray-800">
                {currentQuestion.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Step {currentStep}
                </p>
                <h3 className="font-semibold text-white">{currentQuestion.title}</h3>
              </div>
            </div>

            <p className="text-xl text-white font-medium mb-8 leading-relaxed">
              {currentQuestion.description}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleAnswer(currentQuestion.id, 'yes')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-700 hover:border-red-500/50 hover:bg-red-500/5 transition-all group text-left"
              >
                <div className="w-8 h-8 rounded-full border-2 border-gray-600 group-hover:border-red-500 flex items-center justify-center shrink-0 transition-colors">
                  <XCircle className="w-4 h-4 text-gray-600 group-hover:text-red-400 transition-colors" />
                </div>
                <span className="text-gray-200">{currentQuestion.yesLabel ?? 'Yes'}</span>
              </button>

              <button
                onClick={() => handleAnswer(currentQuestion.id, 'no')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group text-left"
              >
                <div className="w-8 h-8 rounded-full border-2 border-gray-600 group-hover:border-emerald-500 flex items-center justify-center shrink-0 transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
                </div>
                <span className="text-gray-200">{currentQuestion.noLabel ?? 'No'}</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600 mt-4">
            Self-screening only · Not a medical diagnosis
          </p>
        </div>
      </div>
    </div>
  );
}
