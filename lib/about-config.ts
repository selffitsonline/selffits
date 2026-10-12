export interface AboutPageFeatureItem {
  id: string;
  text: string;
  color?: string;
}

export interface AboutPagePillarItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color?: string;
}

export interface AboutPageConfig {
  hero: {
    badge: string;
    heading: string;
    subtitle: string;
  };
  story: {
    heading: string;
    paragraphs: string[];
    imageUrl: string;
    imageAlt: string;
    features: AboutPageFeatureItem[];
  };
  pillars: {
    heading: string;
    subtitle: string;
    items: AboutPagePillarItem[];
  };
  cta: {
    buttonText: string;
    buttonLink: string;
  };
}

export const DEFAULT_ABOUT_PAGE_CONFIG: AboutPageConfig = {
  hero: {
    badge: "Our Story & Mission",
    heading: "About SELFFITS Academy",
    subtitle:
      "Democratizing authentic martial arts & high-intensity fitness training globally through real-time virtual classrooms.",
  },
  story: {
    heading: "From Local Studio to Global Live Virtual Academy",
    paragraphs: [
      "SELFFITS began with a simple observation: millions of kids, adults, and women around the world want to learn genuine martial arts and achieve peak fitness, but lack access to local high-caliber instructors or face schedule constraints.",
      "We pioneered an interactive live academy framework over Google Meet and Zoom where students receive instant form feedback from certified black belt senseis and master trainers. No pre-recorded videos — every session is live, engaging, and disciplined.",
    ],
    imageUrl: "/images/adults_martial_arts.png",
    imageAlt: "SELFFITS Master Martial Arts Instructor teaching live class",
    features: [
      {
        id: "feat_1",
        text: "Over 2,000 active students trained across 15+ countries.",
        color: "#E50914",
      },
      {
        id: "feat_2",
        text: "Dedicated skills evaluation system & official downloadable certificates.",
        color: "#0080FF",
      },
      {
        id: "feat_3",
        text: "Tailored programs for Kids, Adults, and Ladies Only batches.",
        color: "#10B981",
      },
    ],
  },
  pillars: {
    heading: "Our Core Pillars",
    subtitle: "",
    items: [
      {
        id: "pillar_1",
        title: "100% Live Streaming",
        description:
          "Interactive virtual sessions ensuring accountability and real-time guidance.",
        icon: "Video",
        color: "#E50914",
      },
      {
        id: "pillar_2",
        title: "Strict Form Standards",
        description:
          "Coaches correct postures live to prevent injury and build real martial technique.",
        icon: "ShieldCheck",
        color: "#0080FF",
      },
      {
        id: "pillar_3",
        title: "Recognized Progression",
        description:
          "Clear curriculum progression with verifiable program completion certificates.",
        icon: "Award",
        color: "#10B981",
      },
      {
        id: "pillar_4",
        title: "Inclusive Environment",
        description:
          "Safe, empowering batches for kids, adults, and women of all fitness levels.",
        icon: "Heart",
        color: "#F59E0B",
      },
    ],
  },
  cta: {
    buttonText: "Start Your Training Today",
    buttonLink: "/programs",
  },
};

export function normalizeAboutPageConfig(data: any): AboutPageConfig {
  if (!data || typeof data !== "object") {
    return DEFAULT_ABOUT_PAGE_CONFIG;
  }

  const hero = {
    badge: typeof data.hero?.badge === "string" ? data.hero.badge : DEFAULT_ABOUT_PAGE_CONFIG.hero.badge,
    heading: typeof data.hero?.heading === "string" ? data.hero.heading : DEFAULT_ABOUT_PAGE_CONFIG.hero.heading,
    subtitle: typeof data.hero?.subtitle === "string" ? data.hero.subtitle : DEFAULT_ABOUT_PAGE_CONFIG.hero.subtitle,
  };

  const paragraphs = Array.isArray(data.story?.paragraphs) && data.story.paragraphs.length > 0
    ? data.story.paragraphs.map((p: any) => String(p))
    : DEFAULT_ABOUT_PAGE_CONFIG.story.paragraphs;

  const features: AboutPageFeatureItem[] = Array.isArray(data.story?.features)
    ? data.story.features.map((f: any, idx: number) => ({
        id: f?.id || `feat_${idx + 1}`,
        text: typeof f?.text === "string" ? f.text : "",
        color: typeof f?.color === "string" ? f.color : "#E50914",
      }))
    : DEFAULT_ABOUT_PAGE_CONFIG.story.features;

  const story = {
    heading: typeof data.story?.heading === "string" ? data.story.heading : DEFAULT_ABOUT_PAGE_CONFIG.story.heading,
    paragraphs,
    imageUrl: typeof data.story?.imageUrl === "string" && data.story.imageUrl.trim() ? data.story.imageUrl : DEFAULT_ABOUT_PAGE_CONFIG.story.imageUrl,
    imageAlt: typeof data.story?.imageAlt === "string" ? data.story.imageAlt : DEFAULT_ABOUT_PAGE_CONFIG.story.imageAlt,
    features,
  };

  const pillarItems: AboutPagePillarItem[] = Array.isArray(data.pillars?.items)
    ? data.pillars.items.map((p: any, idx: number) => ({
        id: p?.id || `pillar_${idx + 1}`,
        title: typeof p?.title === "string" ? p.title : `Pillar #${idx + 1}`,
        description: typeof p?.description === "string" ? p.description : "",
        icon: typeof p?.icon === "string" ? p.icon : "Award",
        color: typeof p?.color === "string" ? p.color : "#E50914",
      }))
    : DEFAULT_ABOUT_PAGE_CONFIG.pillars.items;

  const pillars = {
    heading: typeof data.pillars?.heading === "string" ? data.pillars.heading : DEFAULT_ABOUT_PAGE_CONFIG.pillars.heading,
    subtitle: typeof data.pillars?.subtitle === "string" ? data.pillars.subtitle : DEFAULT_ABOUT_PAGE_CONFIG.pillars.subtitle,
    items: pillarItems,
  };

  const cta = {
    buttonText: typeof data.cta?.buttonText === "string" ? data.cta.buttonText : DEFAULT_ABOUT_PAGE_CONFIG.cta.buttonText,
    buttonLink: typeof data.cta?.buttonLink === "string" ? data.cta.buttonLink : DEFAULT_ABOUT_PAGE_CONFIG.cta.buttonLink,
  };

  return { hero, story, pillars, cta };
}
