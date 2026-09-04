"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { Star, Award, PlayCircle } from "lucide-react";

export default function SuccessStoriesPage() {
  const stories = [
    {
      name: "Priya & Rahul Nair",
      role: "Parents of Arjun (Kid Student)",
      achievement: "Level 3 Mastery Earned",
      quote: "SELFFITS changed my 12-year-old son's routine completely. He passed his martial arts curriculum evaluation right from our living room! Sensei Rahul corrects every kick posture live.",
      image: "/images/kids_martial_arts.png",
      location: "Bengaluru, India",
    },
    {
      name: "David Miller",
      role: "Adult Martial Arts & HIIT Student",
      achievement: "5-Day/Wk Transformation",
      quote: "The 5 Days / Week Weight Loss program helped me lose 6 kg while boosting my stamina. Having a live coach watch my form prevented any back pain.",
      image: "/images/adults_martial_arts.png",
      location: "London, UK",
    },
    {
      name: "Ananya Roy",
      role: "Ladies Only Batch Student",
      achievement: "Advanced Martial Scholar",
      quote: "The Ladies Only batch is super comfortable and high energy. I feel so much stronger, toned, and confident in self-defense tactics.",
      image: "/images/ladies_fitness.png",
      location: "Dubai, UAE",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E50914]">
            Student Transformations
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-[family-name:var(--font-outfit)]">
            Success Stories & Reviews
          </h1>
          <p className="text-gray-400 text-base max-w-2xl mx-auto">
            Discover how students around the world achieve official belt ranks and fitness milestones with SELFFITS live virtual academy.
          </p>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, idx) => (
            <div key={idx} className="bg-[#14161D] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between p-6 space-y-4">
              <div>
                <div className="relative h-48 rounded-xl overflow-hidden mb-4 border border-white/10">
                  <Image src={story.image} alt={story.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white/80 hover:text-[#E50914] transition-colors cursor-pointer" />
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#F59E0B] mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <p className="text-xs text-gray-300 italic leading-relaxed mb-4">
                  &quot;{story.quote}&quot;
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{story.name}</h4>
                  <p className="text-[11px] text-gray-400">{story.role} • {story.location}</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#E50914]/15 text-[#E50914] text-[10px] font-bold">
                  {story.achievement}
                </span>
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
