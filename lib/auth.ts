import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid email or password");
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        let user = null;
        try {
          user = await db.user.findUnique({
            where: { email },
          });
        } catch (dbErr) {
          console.warn("Database query offline/failed, executing fallback auth handler:", dbErr);
        }

        if (user) {
          if (user.isBlocked) {
            throw new Error("Your account has been blocked by an administrator. Please contact academy support.");
          }

          if (user.passwordHash) {
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (isPasswordValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isBlocked: user.isBlocked,
                image: user.image,
              };
            }
          }
        }

        // Development Fallback: In local dev, verify credentials against the production SELFFITS website
        if (process.env.NODE_ENV !== "production") {
          try {
            const liveRes = await fetch("https://selffits.com/api/v1/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });

            if (liveRes.ok) {
              const liveData = await liveRes.json();
              if (liveData?.success && liveData?.data?.user) {
                const liveUser = liveData.data.user;
                const passwordHash = await bcrypt.hash(password, 10);
                const userRole = (liveUser.role as Role) || Role.STUDENT;

                let localUser = await db.user.findFirst({ where: { email: liveUser.email } });
                if (localUser) {
                  localUser = await db.user.update({
                    where: { id: localUser.id },
                    data: {
                      name: liveUser.name || localUser.name,
                      role: userRole,
                      passwordHash,
                      isBlocked: !!liveUser.isBlocked,
                    },
                  });
                } else {
                  localUser = await db.user.create({
                    data: {
                      id: liveUser.id || undefined,
                      email: liveUser.email,
                      name: liveUser.name || "SELFFITS User",
                      role: userRole,
                      passwordHash,
                      isBlocked: !!liveUser.isBlocked,
                    },
                  });
                  if (userRole === Role.STUDENT) {
                    await db.studentProfile.create({
                      data: { userId: localUser.id },
                    }).catch(() => {});
                  }
                }

                return {
                  id: localUser.id,
                  email: localUser.email,
                  name: localUser.name,
                  role: localUser.role,
                  isBlocked: localUser.isBlocked,
                  image: localUser.image || null,
                };
              }
            }
          } catch (fallbackErr) {
            console.warn("[AUTH-DEV] Website live fallback encountered an error:", fallbackErr);
          }

          // Local development demo shortcuts (backed by real database records)
          if (email === "coach@selffits.com" && (password === "Coach@123" || password === "password")) {
            const coachRecord = await db.user.findFirst({ where: { role: Role.COACH } });
            return {
              id: coachRecord?.id || "demo-coach-user-id",
              email: "coach@selffits.com",
              name: coachRecord?.name || "Academy Sensei",
              role: Role.COACH,
              isBlocked: false,
              image: null,
            };
          }

          if ((email === "student@selffits.com" || email === "demo@selffits.com") && (password === "Student@123" || password === "password")) {
            let studentRecord = await db.user.findFirst({ where: { email: "student@selffits.com" } });
            if (!studentRecord) {
              studentRecord = await db.user.create({
                data: {
                  email: "student@selffits.com",
                  name: "Demo Student",
                  role: Role.STUDENT,
                  passwordHash: await bcrypt.hash("Student@123", 10),
                  isBlocked: false,
                },
              });
              await db.studentProfile.create({ data: { userId: studentRecord.id } }).catch(() => {});
            }
            return {
              id: studentRecord.id,
              email: studentRecord.email,
              name: studentRecord.name,
              role: Role.STUDENT,
              isBlocked: false,
              image: null,
            };
          }

          if (
            (email === "superadmin@selffits.com" || email === "admin@selffits.com") &&
            (password === "SuperAdmin@123" || password === "Admin@123" || password === "password")
          ) {
            const adminRecord = await db.user.findFirst({
              where: { email: email.includes("super") ? "superadmin@selffits.com" : "admin@selffits.com" },
            });
            return {
              id: adminRecord?.id || "demo-admin-user-id",
              email: email,
              name: adminRecord?.name || "System Admin",
              role: (adminRecord?.role || (email.includes("super") ? Role.SUPER_ADMIN : Role.ADMIN)) as Role,
              isBlocked: false,
              image: null,
            };
          }
        }

        throw new Error("Invalid email or password");
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as Role;
        token.isBlocked = (user as any).isBlocked || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        (session.user as any).isBlocked = (token as any).isBlocked || false;
      }
      return session;
    },
  },
});
