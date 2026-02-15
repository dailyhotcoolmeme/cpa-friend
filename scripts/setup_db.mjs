import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setup() {
    console.log('Setting up menus...')

    // Clear existing menus
    await supabase.from('site_menu').delete().neq('id', 0)

    const menus = [
        { name: '운영자 소개', path: '/team', sort_order: 1, is_visible: true },
        { name: '업무 문의', path: '/services', sort_order: 2, is_visible: true },
        { name: '정보 광장', path: '/info', sort_order: 3, is_visible: true }
    ]

    const { error } = await supabase.from('site_menu').insert(menus)
    if (error) console.error('Error inserting menus:', error)
    else console.log('Menus updated successfully!')
}

setup()
