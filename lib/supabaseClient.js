import { createClient } from '@supabase/supabase-js'
import { Database } from '../supabase'; // 방금 생성한 파일 경로

// 이 두 정보는 나중에 Vercel 설정(Environment Variables)에 넣을 겁니다.
// 지금은 이 코드 그대로 복사해서 저장만 해두세요.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
