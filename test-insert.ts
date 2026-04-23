import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "missing";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "missing";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabaseAdmin.from('products').insert({
    id: 'my-custom-test-id',
    name: 'Test Product',
    price: 100,
    main_image: '',
    images: [],
    videos: [],
    description: '',
    promo_code: '',
    variants: [],
    stock: 10,
    is_active: false,
    is_featured: false,
    order: 0,
    sizes: '',
    size_guide: '',
    show_out_of_stock_badge: false,
    show_preorder_badge: false,
    detailed_description: '',
    shipping_info: '',
    faqs: [],
    city_pricing: [],
    categories: []
  }).select();
  console.log('Error:', error);
  console.log('Data:', data);
  if (!error) {
     await supabaseAdmin.from('products').delete().eq('id', 'my-custom-test-id');
  }
}
test();
