interface AIAnalysisResponse {
  material_detected: string
  risk_score: number
  reasons: string[]
}

interface AnalysisResult {
  material: string
  miteScore: number
  reasons: string[]
}

export async function analyzeDuvet(
  imageUrl: string,
  temperature: number,
  humidity: number
): Promise<AnalysisResult | null> {
  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SILICONFLOW_API_KEY}`
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-VL-72B-Instruct",
        stream: false,
        max_tokens: 512,
        enable_thinking: true,
        thinking_budget: 4096,
        min_p: 0.05,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        frequency_penalty: 0.5,
        n: 1,
        stop: [],
        response_format: {
          type: "text"
        },
        messages: [
          {
            role: "user",
            content: [
              {
                text: `I have uploaded a photo of my quilt. Here is my current environmental information: * Temperature: ${temperature}℃ * Humidity: ${humidity}% Please help me analyze the quilt based on the image and the environmental conditions. Your tasks: 1. Identify the quilt's material (e.g., cotton, polyester, down, soybean fiber, or unknown) based on the photo. 2. Estimate the quilt's thickness (thin, medium, or thick) according to its appearance. 3. Combine this with the temperature and humidity to calculate the dust mite risk score, from 0 to 100. Higher means higher risk of dust mite growth. 4. Return a structured JSON result that includes the material, risk score, and reasons for the risk. 【Risk Scoring Rules】 (for your internal calculation only — do not mention scores, points, or formulas in the reasons): * Humidity: * ≥75% → +40 * 60–74% → +20 * <60% → +0 * Temperature: * 20–30℃ → +20 * Otherwise → +5 * Material: * Cotton, soybean fiber, bamboo fiber → +20 * Polyester, synthetic fiber → +10 * Down, silk → +5 * Thickness (visually estimated): * Thick → +15 * Medium → +8 * Thin → +0 * Label: * If the label includes "anti-mite" or "antibacterial" → reduce risk by -20 【Output format】: \`\`\`json { "material_detected": "cotton/polyester/down/soybean fiber/unknown", "risk_score": 0-100, "reasons": [ "Brief reason 1", "Brief reason 2", ... ] } \`\`\``,
                type: "text"
              },
              {
                image_url: {
                  detail: "auto",
                  url: imageUrl
                },
                type: "image_url"
              }
            ]
          }
        ]
      })
    })

    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      console.error('No content in API response')
      return null
    }

    // Extract JSON from response
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
    if (!jsonMatch) {
      console.error('No JSON found in response')
      return null
    }

    const aiResponse: AIAnalysisResponse = JSON.parse(jsonMatch[1])
    
    return {
      material: aiResponse.material_detected,
      miteScore: aiResponse.risk_score,
      reasons: aiResponse.reasons
    }
  } catch (error) {
    console.error('Error analyzing duvet:', error)
    return null
  }
}