import { router, publicProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createRecruitmentApplication,
  getRecruitmentApplications,
  getRecruitmentApplicationById,
  updateRecruitmentApplicationStatus,
  createTutor,
  getTutorApplications,
  getPublishedTutors,
  getTutorById,
  updateTutorStatus,
  publishTutor,
} from "./db";

const recruitmentApplicationSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phone: z.string().min(1, "Le téléphone est requis"),
  email: z.string().email("Email invalide"),
  subject: z.string().min(1, "La matière est requise"),
  educationLevel: z.string().min(1, "Le niveau d'étude est requis"),
  diploma: z.string().min(1, "Le diplôme est requis"),
  yearsOfExperience: z.number().min(0, "L'expérience doit être positive"),
  diplomaCopyUrl: z.string().optional(),
});

const tutorApplicationSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phone: z.string().min(1, "Le téléphone est requis"),
  email: z.string().email("Email invalide"),
  subject: z.string().min(1, "La matière est requise"),
  educationLevel: z.string().min(1, "Le niveau d'étude est requis"),
  diploma: z.string().min(1, "Le diplôme est requis"),
  yearsOfExperience: z.number().min(0, "L'expérience doit être positive"),
  diplomaCopyUrl: z.string().optional(),
});

export const recruitmentRouter = router({
  // RECRUITMENT APPLICATIONS
  submitApplication: publicProcedure
    .input(recruitmentApplicationSchema)
    .mutation(async ({ input }) => {
      try {
        await createRecruitmentApplication({
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          email: input.email,
          subject: input.subject,
          educationLevel: input.educationLevel,
          diploma: input.diploma,
          yearsOfExperience: input.yearsOfExperience,
          diplomaCopyUrl: input.diplomaCopyUrl,
          status: "pending",
        });

        return {
          success: true,
          message: "Candidature soumise avec succès. Nous vous contacterons bientôt.",
        };
      } catch (error) {
        console.error("[Recruitment] Error submitting application:", error);
        throw new Error("Erreur lors de la soumission de la candidature");
      }
    }),

  getApplications: adminProcedure.query(async () => {
    try {
      return await getRecruitmentApplications();
    } catch (error) {
      console.error("[Recruitment] Error getting applications:", error);
      throw new Error("Erreur lors de la récupération des candidatures");
    }
  }),

  getApplicationById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        return await getRecruitmentApplicationById(input.id);
      } catch (error) {
        console.error("[Recruitment] Error getting application:", error);
        throw new Error("Erreur lors de la récupération de la candidature");
      }
    }),

  updateApplicationStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected"]),
        rejectionReason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await updateRecruitmentApplicationStatus(input.id, input.status, input.rejectionReason);
        return { success: true, message: "Statut mis à jour avec succès" };
      } catch (error) {
        console.error("[Recruitment] Error updating application status:", error);
        throw new Error("Erreur lors de la mise à jour du statut");
      }
    }),

  // TUTORS (RÉPÉTITEURS)
  submitTutorApplication: publicProcedure
    .input(tutorApplicationSchema)
    .mutation(async ({ input }) => {
      try {
        await createTutor({
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          email: input.email,
          subject: input.subject,
          educationLevel: input.educationLevel,
          diploma: input.diploma,
          yearsOfExperience: input.yearsOfExperience,
          diplomaCopyUrl: input.diplomaCopyUrl,
          status: "pending",
          isPublished: false,
        });

        return {
          success: true,
          message: "Candidature de répétiteur soumise avec succès. Nous vous contacterons bientôt.",
        };
      } catch (error) {
        console.error("[Tutors] Error submitting application:", error);
        throw new Error("Erreur lors de la soumission de la candidature");
      }
    }),

  getPublishedTutors: publicProcedure.query(async () => {
    try {
      return await getPublishedTutors();
    } catch (error) {
      console.error("[Tutors] Error getting published tutors:", error);
      throw new Error("Erreur lors de la récupération des répétiteurs");
    }
  }),

  getTutorApplications: adminProcedure.query(async () => {
    try {
      return await getTutorApplications();
    } catch (error) {
      console.error("[Tutors] Error getting applications:", error);
      throw new Error("Erreur lors de la récupération des candidatures");
    }
  }),

  getTutorById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        return await getTutorById(input.id);
      } catch (error) {
        console.error("[Tutors] Error getting tutor:", error);
        throw new Error("Erreur lors de la récupération du répétiteur");
      }
    }),

  updateTutorStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected"]),
        rejectionReason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await updateTutorStatus(input.id, input.status, input.rejectionReason);
        return { success: true, message: "Statut mis à jour avec succès" };
      } catch (error) {
        console.error("[Tutors] Error updating status:", error);
        throw new Error("Erreur lors de la mise à jour du statut");
      }
    }),

  publishTutor: adminProcedure
    .input(
      z.object({
        id: z.number(),
        isPublished: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await publishTutor(input.id, input.isPublished);
        return { success: true, message: "Répétiteur publié/dépublié avec succès" };
      } catch (error) {
        console.error("[Tutors] Error publishing tutor:", error);
        throw new Error("Erreur lors de la publication du répétiteur");
      }
    }),
});
