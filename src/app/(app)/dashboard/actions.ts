'use server';

import { prisma } from '@/lib/prisma';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import type { Post, ProductionDetails, ProductionRecord } from '@/lib/types';
import axios from 'axios';

// Helper to get the current session and user profile from the database
async function getSessionAndUser() {
  const session = await getIronSession(cookies(), sessionOptions);
  if (!session.user?.isLoggedIn) {
    throw new Error('User not authenticated');
  }
  const user = await prisma.profile.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    throw new Error('User not found in database');
  }
  return { session, user };
}

// This external API call function remains unchanged
async function fetchWeatherData(region: string | null) {
  if (!region) return null;
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!apiKey) {
      console.error("OpenWeather API key is missing.");
      return null;
  };
  
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${region},SN&appid=${apiKey}&units=metric&lang=fr`;
  try {
    const response = await axios.get(url);
    return {
      temperature: Math.round(response.data.main.temp),
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
    };
  } catch (error) {
    console.error("Error fetching weather for dashboard:", error);
    return null;
  }
}

export async function getDashboardData() {
  const { user } = await getSessionAndUser();

  // Fetch all data in parallel using Prisma
  const [
    profilesCount,
    postsData,
    productionDetails,
    weatherData,
    productionRecords,
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.post.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { fullName: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.productionDetails.findUnique({ where: { userId: user.id } }),
    fetchWeatherData(user.region),
    prisma.productionRecord.findMany({
      where: { userId: user.id },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    }),
  ]);



  // Get likes for the fetched posts by the current user to determine `user_has_liked`
  const postIds = postsData.map(p => p.id);
  const userLikes = await prisma.like.findMany({
    where: { authorId: user.id, postId: { in: postIds } },
    select: { postId: true },
  });
  const likedPostIds = new Set(userLikes.map(l => l.postId));

  // Map posts to the required structure for the frontend
  const posts: Post[] = postsData.map(post => ({
    id: post.id,
    content: post.content,
    image_url: post.imageUrl,
    created_at: post.createdAt.toISOString(),
    user_id: post.authorId,
    author: {
      name: post.author.fullName || 'Utilisateur inconnu',
      avatar: post.author.avatarUrl || '',
    },
    likes: post._count.likes,
    comments: post._count.comments,
    user_has_liked: likedPostIds.has(post.id),
  }));

  return {
    profilesCount,
    posts,
    productionDetails: productionDetails as ProductionDetails | null,
    weatherData,
    productionRecords: (productionRecords as ProductionRecord[]) || [],
  };
}

export async function upsertProductionDetails(details: { crop_name: string; soil_type: string; surface_area: number }) {
  try {
    const { user } = await getSessionAndUser();
    const { crop_name, soil_type, surface_area } = details;

    const data = await prisma.productionDetails.upsert({
      where: { userId: user.id },
      update: { cropName: crop_name, soilType: soil_type, surfaceArea: surface_area },
      create: { userId: user.id, cropName: crop_name, soilType: soil_type, surfaceArea: surface_area },
    });

    return { data };
  } catch (error: any) {
    if (error.message === 'User not authenticated') {
      return { error: 'User not authenticated' };
    }
    console.error('Error upserting production details:', error);
    return { error: 'Impossible de mettre à jour les détails de production.' };
  }
}

export async function addProductionRecord(record: { crop_name: string; year: number; month: number, quantity_tonnes: number }) {
  try {
    const { user } = await getSessionAndUser();
    const { crop_name, year, month, quantity_tonnes } = record;

    const newRecord = await prisma.productionRecord.create({
      data: {
        userId: user.id,
        cropName: crop_name,
        year: year,
        month: month,
        quantityTonnes: quantity_tonnes,
      },
    });

    return { data: newRecord as ProductionRecord };
  } catch (error: any) {
    if (error.message === 'User not authenticated') {
      return { error: 'User not authenticated' };
    }
    // Prisma throws a specific error for unique constraint violations
    if (error.code === 'P2002') {
      return { error: "Impossible d'ajouter l'enregistrement. Un enregistrement pour cette culture et ce mois existe déjà." };
    }
    console.error('Error adding production record:', error);
    return { error: "Impossible d'ajouter l'enregistrement de production." };
  }
}