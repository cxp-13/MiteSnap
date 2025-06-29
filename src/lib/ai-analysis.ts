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
  temperature: number = 25,
  humidity: number = 50
): Promise<AnalysisResult | null> {
  try {
    console.log('Starting AI analysis with:', { imageUrl, temperature, humidity })
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SILICONFLOW_API_KEY || 'sk-test-key'}`
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
                text: `Analyze this duvet/quilt photo. Environment: Temperature ${temperature}°C, Humidity ${humidity}%.

Tasks:
1. Identify material (cotton, polyester, down, soybean fiber, or unknown)
2. Calculate dust mite risk score 0-100 based on material and environment
3. Provide reasons for the risk assessment

Return JSON format:
\`\`\`json
{
  "material_detected": "material_name",
  "risk_score": 0-100,
  "reasons": ["reason1", "reason2"]
}
\`\`\``,
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
      const errorText = await response.text()
      console.error('API request failed:', response.status, response.statusText)
      console.error('Error details:', errorText)
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