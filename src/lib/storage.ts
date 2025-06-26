import { supabase } from './supabase'

export async function uploadDuvetImage(file: File, userId: string): Promise<{ url: string; path: string } | null> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `duvets/${fileName}`

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file)

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return {
      url: publicUrl,
      path: data.path
    }
  } catch (error) {
    console.error('Upload error:', error)
    return null
  }
}