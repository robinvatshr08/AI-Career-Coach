"use server"

import { industries } from "@/data/industries";
import { MarketOutlook } from "@/lib/generated/prisma";
import { DemandLevel } from "@/lib/generated/prisma";
import { auth } from "@clerk/nextjs/server";
import { Select } from "@radix-ui/react-select";
import { TimerOff } from "lucide-react";
import { db } from "@/lib/prisma";
import { generateAIInsights } from "./dashboard";


export async function updateUser(data) {
    const {userId}=await auth();
    if(!userId) throw new Error("unauthorized user");

    const user= await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    });
    
    if (!user) throw new Error ("User not found");

    try {
        const result = await db.$transaction(
            async (tx) => {
            // find if the industry exists
            
                let industryInsight = await tx.industryInsight.findUnique({
                    where: {
                      industry: data.industry,
                    },
            });
            // If industry doesn't exist, create it with default values - will replace itwith ai later
            if (!industryInsight) {
                const insights = await generateAIInsights(data.industry);
      
                industryInsight = await db.industryInsight.create({
                  data: {
                    industry: data.industry,
                    ...insights,
                    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  },
                });
              }
                
            console.log("hello")
            // update the user
            const updatedUser = await tx.user.update ({
                where: {
                id: user.id,
                }, 
                data: {
                    industry: data.industry, 
                    experience: data.experience, 
                    bio: data.bio, 
                    skills: data.skills,
                },
                });
                console.log("hello")
                return {updatedUser, industryInsight};
            },
                {
                 timeout: 10000, // default: 500
                }
            );

           
           
            return { success: true, ...result };
    } 
    catch (error) {
        console.error("Error updating user and industry!", error.message);
        throw new Error(`Failed to update profile: ${error.message}`);
    }
    
    
}

export async function getUserOnboardingStatus() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
  
  

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
  
  
    if (!user) throw new Error("User not found");
  
    try {
      const user = await db.user.findUnique({
        where: {
          clerkUserId: userId,
        },
        select: {
          industry: true,
        },
      });
  
      return {
        isOnboarded: !!user?.industry,
      };
    } catch (error) {
      console.error("Error checking onboarding status:", error.message);
      throw new Error("Failed to check onboarding status"+error.message);
    }
  }