'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { GratitudePost, BloodGroup, BloodComponent } from '@/lib/types';
import { ALL_BLOOD_GROUPS } from '@/lib/compatibility';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import {
  Heart,
  Trophy,
  MessageSquareHeart,
  MapPin,
  Sparkles,
  PlusCircle,
  ThumbsUp,
  Hospital,
  Users,
  Award,
  Share2,
  Calendar,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CommunityPage() {
  const [gratitudePosts, setGratitudePosts] = useState<GratitudePost[]>([]);
  const [cityLeaderboard, setCityLeaderboard] = useState<
    { city: string; totalDonors: number; totalDonations: number; livesSaved: number }[]
  >([]);
  const [selectedCityFilter, setSelectedCityFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for posting a thank you note
  const [authorName, setAuthorName] = useState('');
  const [recipientCity, setRecipientCity] = useState('New Delhi');
  const [hospital, setHospital] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('B+');
  const [component, setComponent] = useState<BloodComponent>('Whole Blood');
  const [donorAlias, setDonorAlias] = useState('');
  const [patientStory, setPatientStory] = useState('');

  const refreshCommunity = () => {
    setGratitudePosts(db.getGratitudePosts());
    setCityLeaderboard(db.getCityLeaderboard());
  };

  useEffect(() => {
    refreshCommunity();
    document.title = 'Community Leaderboards & Gratitude Wall | BloodDonor Platform';
  }, []);

  const handleLike = (id: string) => {
    db.likeGratitudePost(id);
    refreshCommunity();
  };

  const handlePostGratitude = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !patientStory.trim() || !hospital.trim()) return;

    db.addGratitudePost({
      author_name: authorName,
      recipient_city: recipientCity,
      hospital,
      blood_group: bloodGroup,
      component,
      donor_alias: donorAlias || 'Selfless Volunteer Donor',
      patient_story: patientStory,
      units_received: 1,
    });

    setIsModalOpen(false);
    setAuthorName('');
    setHospital('');
    setDonorAlias('');
    setPatientStory('');
    refreshCommunity();

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const filteredPosts =
    selectedCityFilter === 'All'
      ? gratitudePosts
      : gratitudePosts.filter((p) => p.recipient_city.toLowerCase().includes(selectedCityFilter.toLowerCase()));

  const topDonors = db.getDonors().slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white p-8 sm:p-12 border border-red-900/40 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Celebrating India's Everyday Lifesavers</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            City Leaderboard & The Wall of Gratitude
          </h1>

          <p className="text-xs sm:text-sm text-red-100/80 leading-relaxed">
            Every donation has a heartbeat behind it. Explore regional donation milestones and read heartfelt stories from patients whose lives were saved by voluntary blood donors.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-medical-red hover:bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-600/40 transition flex items-center space-x-2"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>Post a Thank You Message</span>
            </button>
            <Link
              href="/find-donor"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Find Nearby Donors</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: City Leaderboard & Top Heroes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* City Leaderboard */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-black text-lg text-slate-900 dark:text-white flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Regional Impact & City Leaderboard</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cities ranked by voluntary blood donation drives and registered donors.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cityLeaderboard.map((item, idx) => (
              <div
                key={item.city}
                className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between hover:border-red-200 dark:hover:border-red-900 transition"
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                      idx === 0
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : idx === 1
                        ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                        : idx === 2
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1">
                      <span>{item.city}</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.totalDonors} registered donors
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-medical-red block">
                    {item.totalDonations} units
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                    ~{item.livesSaved} lives saved
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top LifeSavers Column */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-medical-red" />
              <span>Honor Roll Donors</span>
            </h3>
            <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold px-2 py-0.5 rounded-full">
              Hall of Fame
            </span>
          </div>

          <div className="space-y-3">
            {topDonors.map((d, index) => (
              <div
                key={d.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {d.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white truncate block">
                      {d.name}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {d.city} • {d.total_donations} donations
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center space-x-1.5">
                  <BloodGroupBadge bloodGroup={d.blood_group} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wall of Gratitude */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <MessageSquareHeart className="w-6 h-6 text-medical-red" />
              <span>Wall of Gratitude</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Heartwarming thank you notes from families and patients to voluntary donors.
            </p>
          </div>

          {/* City Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'New Delhi', 'Mumbai', 'Pune', 'Bengaluru'].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCityFilter(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCityFilter === city
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BloodGroupBadge bloodGroup={post.blood_group} size="sm" />
                    {post.component && post.component !== 'Whole Blood' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {post.component}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(post.created_at).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{post.patient_story}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {post.author_name}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <Hospital className="w-3 h-3 text-slate-400" />
                      <span>{post.hospital}, {post.recipient_city}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-medical-red font-bold text-xs transition"
                    title="Say Thanks"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>{post.likes}</span>
                  </button>
                </div>

                {post.donor_alias && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl text-[10px] text-slate-500 dark:text-slate-400">
                    Dedicated to: <span className="font-bold text-slate-800 dark:text-slate-200">{post.donor_alias}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Post a Thank You Note */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Heart className="w-4 h-4 text-medical-red fill-current" />
                <span>Post a Gratitude Message</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostGratitude} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name / Family *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Ramesh K. (Patient's Brother)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City / Hospital Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientCity}
                    onChange={(e) => setRecipientCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    placeholder="e.g. Tata Memorial Hospital"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Blood Group *
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-medical-red focus:outline-none"
                  >
                    {ALL_BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Component Received
                </label>
                <select
                  value={component}
                  onChange={(e) => setComponent(e.target.value as BloodComponent)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-medical-red focus:outline-none"
                >
                  <option value="Whole Blood">Whole Blood</option>
                  <option value="Platelets (PRP/SDP)">Platelets (PRP/SDP)</option>
                  <option value="Plasma (FFP)">Plasma (FFP)</option>
                  <option value="Packed Red Cells (PRBC)">Packed Red Cells (PRBC)</option>
                  <option value="Cryoprecipitate">Cryoprecipitate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Donor Alias / Dedication (Optional)
                </label>
                <input
                  type="text"
                  value={donorAlias}
                  onChange={(e) => setDonorAlias(e.target.value)}
                  placeholder="e.g. Volunteer Donor Sneha or All voluntary lifesavers"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Gratitude Message & Story *
                </label>
                <textarea
                  rows={3}
                  required
                  value={patientStory}
                  onChange={(e) => setPatientStory(e.target.value)}
                  placeholder="Share how the donor's timely help saved your patient or gave your family hope..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-medical-red focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-medical-red hover:bg-red-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  <span>Publish to Wall of Gratitude</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
