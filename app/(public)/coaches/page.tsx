"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { Award, ShieldCheck, Video, Star } from "lucide-react";

export default function CoachesPage() {
  const coaches = [
    {
      name: "Sensei Rahul Sharma",
      role: "Head Martial Arts Instructor & Master Black Belt",
      experience: "14+ Years Teaching Experience",
      rank: "4th Dan Black Belt",
      image: "/images/adults_martial_arts.png",
      bio: "Former National Martial Arts Champion specializing in Taekwondo, Karate, and virtual stance evaluation. Sensei Rahul has trained over 1,500 students globally from Yellow Belt to Brown Belt.",
      certifications: ["World Taekwondo Federation Certified", "Black Belt 4th Degree", "First Aid & Youth Fitness Accredited"],
      expertise: ["Kids Martial Arts", "Adult Striking Combos", "Kata & Sparring Drills"],
    },
    {
      name: "Sarah Jenkins",
      role: "Lead Fitness & HIIT Transformation Coach",
      experience: "9+ Years High-Performance Coaching",
      rank: "Certified Master Trainer",
      image: "/images/ladies_fitness.png",
      bio: "Master fitness coach dedicated to high-energy HIIT workouts, fat loss challenges, and ladies-only empowerment conditioning. Sarah brings infectious energy and real-time form correction to every live class.",
      certifications: ["ACE Certified Personal Trainer", "HIIT & Functional Movement Specialist", "Precision Nutrition Coach"],
      expertise: ["Weight Loss Challenges", "Ladies Only Fitness", "Core & Metabolism Conditioning"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E50914]">
            World Class Instructors
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-[family-name:var(--font-outfit)]">
            Meet Our Master Coaches
          </h1>
          <p className="text-gray-400 text-base max-w-2xl mx-auto">
            Learn from certified black belt instructors and master fitness trainers dedicated to guiding your form and technique in real time.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {coaches.map((coach, idx) => (
            <div
              key={idx}
              className="bg-[#14161D] border border-white/10 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch"
            >
              <div className="relative w-full h-64 sm:h-80 lg:h-full min-h-[280px] overflow-hidden shrink-0">
                <Image src={coach.image} alt={coach.name} fill className="object-cover" />
              </div>

              <div className="lg:col-span-2 p-6 sm:p-8 lg:p-10 space-y-4 flex flex-col justify-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0080FF]">
                    {coach.rank}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-[family-name:var(--font-outfit)] mt-1">
                    {coach.name}
                  </h2>
                  <p className="text-sm font-semibold text-[#E50914]">{coach.role}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{coach.experience}</p>
                </div>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {coach.bio}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-2 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#10B981]" /> Certifications
                    </h4>
                    <ul className="space-y-1">
                      {coach.certifications.map((c, i) => (
                        <li key={i} className="text-xs text-gray-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0080FF]" /> Expertise
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {coach.expertise.map((exp, i) => (
                        <span key={i} className="px-2.5 py-1 rounded bg-[#0080FF]/15 text-[#0080FF] text-[11px] font-semibold">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
