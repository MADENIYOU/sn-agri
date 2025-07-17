
'use server';

import { createAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';
import type { Post, ProductionDetails, ProductionRecord } from '@/lib/types';
import axios from 'axios';
import { revalidatePath } from 'next/cache';

export async function getDashboardData() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const adminSupabase = createAdminClient();

  // Fetch all data in parallel
  const [
    profilesCountResult,
    postsResult,
    productionDetailsResult,
    weatherDataResult,
    productionRecordsResult,
  ] = await Promise.all([
    adminSupabase.from('profiles').select('*', { count: 'exact', head: true }),
    adminSupabase.rpc('get_posts_with_details', { current_user_id: user.id }).limit(3),
    supabase.from('production_details').select('*').eq('user_id', user.id).maybeSingle(),
    fetchWeatherData(user.user_metadata.region),
    supabase.from('production_records').select('*').eq('user_id', user.id).order('year').order('month'),
  ]);

  // Process profiles count
  const { count: profilesCount, error: profilesCountError } = profilesCountResult;
  if (profilesCountError) console.error('Error fetching profiles count:', profilesCountError.message);

  // Process posts
  const { data: postsData, error: postsError } = postsResult;
  if (postsError) console.error('Error fetching recent posts:', postsError.message);
  const posts: Post[] = postsData?.map((post: any) => ({
    id: post.id,
    content: post.content,
    image_url: post.image_url,
    created_at: post.created_at,
    user_id: post.user_id,
    author: {
        name: post.author?.name || 'Utilisateur inconnu',
        avatar: post.author?.avatar || '',
    },
    likes: post.likes_count,
    comments: post.comments_count,
    user_has_liked: post.user_has_liked
  })) || [];

  // Process production details
  const { data: productionDetails, error: productionDetailsError } = productionDetailsResult;
  if (productionDetailsError) console.error('Error fetching production details:', productionDetailsError.message);

  // Process production records
  const { data: productionRecords, error: productionRecordsError } = productionRecordsResult;
  if (productionRecordsError) console.error('Error fetching production records:', productionRecordsError.message);

  return {
    profilesCount,
    posts,
    productionDetails: productionDetails as ProductionDetails | null,
    weatherData: weatherDataResult,
    productionRecords: (productionRecords as ProductionRecord[]) || [],
  };
}

async function fetchWeatherData(region: string) {
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

export async function upsertProductionDetails(details: { crop_name: string; soil_type: string; surface_area: number }) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Utilisateur non authentifié.' };
  }

  const { data, error } = await supabase
    .from('production_details')
    .upsert({
      user_id: user.id,
      ...details,
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting production details:', error);
    return { error: 'Impossible de mettre à jour les détails de production.' };
  }
  revalidatePath('/dashboard');
  return { data };
}


export async function addProductionRecord(record: { crop_name: string; year: number; month: number, quantity_tonnes: number }) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Utilisateur non authentifié.' };
    }

    const { data, error } = await supabase
        .from('production_records')
        .insert({
            user_id: user.id,
            ...record,
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error adding production record:', error);
        return { error: "Impossible d'ajouter l'enregistrement de production. Il se peut qu'un enregistrement pour cette culture et ce mois existe déjà." };
    }

    revalidatePath('/dashboard');
    return { data };
}
