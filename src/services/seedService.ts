import { supabase } from '../lib/supabase';
import { initialServices, initialSpecialists, initialPortfolio } from '../data/mockData';

export async function syncMockDataToSupabase() {
  if (!supabase) return;

  try {
    console.log('🔄 Verificando datos en Supabase...');

    // 1. Sincronizar Servicios
    const { data: existingServices, error: errServices } = await supabase
      .from('services')
      .select('id');

    if (!errServices && (!existingServices || existingServices.length === 0)) {
      console.log('📦 Poblando tabla "services" desde mockData local...');
      const servicesToInsert = initialServices.map(s => ({
        name: s.name,
        description: s.description,
        price: s.price,
        duration_minutes: s.durationMinutes || 60,
        category: s.category,
        is_active: s.isActive ?? true,
        popular: s.popular ?? false,
        image: s.image || s.imageUrl,
        rating: s.rating || 5.0,
        reviews_count: s.reviewsCount || 1
      }));

      await supabase.from('services').insert(servicesToInsert);
    }

    // 2. Sincronizar Especialistas (Excluimos el comodín 'spec-any' si es dinámico)
    const { data: existingSpecialists, error: errSpec } = await supabase
      .from('specialists')
      .select('id');

    if (!errSpec && (!existingSpecialists || existingSpecialists.length === 0)) {
      console.log('👩‍🎨 Poblando tabla "specialists" desde mockData local...');
      const specialistsToInsert = initialSpecialists
        .filter(sp => sp.id !== 'spec-any') // Filtramos el comodín si no lo quieres como fila estática en DB
        .map(sp => ({
          name: sp.name,
          role: sp.role || sp.title,
          phone: sp.phone || '+58 412 9876543',
          avatar_url: sp.avatarUrl || sp.photo,
          is_active: sp.isActive ?? true,
          specialty: sp.specialty || sp.role,
          rating: sp.rating || 5.0,
          reviews_count: sp.reviewsCount || 1,
          bio: sp.bio || '',
          available_days: sp.availableDays || ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        }));

      await supabase.from('specialists').insert(specialistsToInsert);
    }

    // 3. Sincronizar Portafolio
    const { data: existingPortfolio, error: errPort } = await supabase
      .from('portfolio_items')
      .select('id');

    if (!errPort && (!existingPortfolio || existingPortfolio.length === 0)) {
      console.log('🖼️ Poblando tabla "portfolio_items" desde mockData local...');
      const portfolioToInsert = initialPortfolio.map(p => ({
        title: p.title,
        image_url: p.imageUrl || p.image,
        category: p.category,
        artist: p.artist || 'Valeria Mendoza',
        likes: p.likes || 0
      }));

      await supabase.from('portfolio_items').insert(portfolioToInsert);
    }

    console.log('✅ Verificación y sincronización con Supabase completada.');
  } catch (error) {
    console.error('Error durante la sincronización de datos:', error);
  }
}