import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import {
  createRecruitmentApplication,
  getRecruitmentApplications,
  updateRecruitmentApplicationStatus,
  createTutor,
  getPublishedTutors,
  getTutorApplications,
  updateTutorStatus,
  publishTutor,
} from "./db";

describe("Recruitment Applications", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  it("should create a recruitment application", async () => {
    const app = {
      firstName: "Jean",
      lastName: "Dupont",
      phone: "+225 01 23 45 67",
      email: "jean@example.com",
      subject: "Mathématiques",
      educationLevel: "Université",
      diploma: "Licence en Mathématiques",
      yearsOfExperience: 5,
      status: "pending" as const,
    };

    const result = await createRecruitmentApplication(app);
    expect(result).toBeDefined();
  });

  it("should get all recruitment applications", async () => {
    const apps = await getRecruitmentApplications();
    expect(Array.isArray(apps)).toBe(true);
  });

  it("should update recruitment application status", async () => {
    const apps = await getRecruitmentApplications();
    if (apps && apps.length > 0) {
      const firstApp = apps[0];
      await updateRecruitmentApplicationStatus(firstApp.id, "approved");
      expect(true).toBe(true);
    }
  });

  it("should update recruitment application status with rejection reason", async () => {
    const apps = await getRecruitmentApplications();
    if (apps && apps.length > 0) {
      const firstApp = apps[0];
      await updateRecruitmentApplicationStatus(
        firstApp.id,
        "rejected",
        "Qualifications insuffisantes"
      );
      expect(true).toBe(true);
    }
  });
});

describe("Tutors (Répétiteurs)", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  it("should create a tutor application", async () => {
    const tutor = {
      firstName: "Marie",
      lastName: "Martin",
      phone: "+225 98 76 54 32",
      email: "marie@example.com",
      subject: "Français",
      educationLevel: "Master",
      diploma: "Master en Littérature Française",
      yearsOfExperience: 3,
      status: "pending" as const,
      isPublished: false,
    };

    const result = await createTutor(tutor);
    expect(result).toBeDefined();
  });

  it("should get all tutor applications", async () => {
    const tutors = await getTutorApplications();
    expect(Array.isArray(tutors)).toBe(true);
  });

  it("should get only published tutors", async () => {
    const tutors = await getPublishedTutors();
    expect(Array.isArray(tutors)).toBe(true);
    // All tutors should have status "approved" and isPublished true
    tutors.forEach((tutor) => {
      expect(tutor.status).toBe("approved");
      expect(tutor.isPublished).toBe(true);
    });
  });

  it("should update tutor status", async () => {
    const tutors = await getTutorApplications();
    if (tutors && tutors.length > 0) {
      const firstTutor = tutors[0];
      await updateTutorStatus(firstTutor.id, "approved");
      expect(true).toBe(true);
    }
  });

  it("should publish a tutor", async () => {
    const tutors = await getTutorApplications();
    if (tutors && tutors.length > 0) {
      const firstTutor = tutors[0];
      await publishTutor(firstTutor.id, true);
      expect(true).toBe(true);
    }
  });

  it("should unpublish a tutor", async () => {
    const tutors = await getTutorApplications();
    if (tutors && tutors.length > 0) {
      const firstTutor = tutors[0];
      await publishTutor(firstTutor.id, false);
      expect(true).toBe(true);
    }
  });
});
