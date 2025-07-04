import { OptimalTimeWindow } from './weather-analysis'

interface SunDryingAIResponse {
  effectiveness_score: number
  mite_score_reduction: number
  final_mite_score: number
}

export interface SunDryingAnalysisResult {
  effectivenessScore: number
  miteScoreReduction: number
  finalMiteScore: number
}

export async function analyzeSunDryingEffectiveness(
  imageUrl: string,
  beforeMiteScore: number,
  weatherConditions: OptimalTimeWindow,
  sunDryingDuration: number // in hours
): Promise<SunDryingAnalysisResult | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_SILICONFLOW_API_KEY
    if (!apiKey) {
      console.error('SiliconFlow API key is not set')
      return null
    }

    console.log("imageUrl", imageUrl)
    console.log("beforeMiteScore", beforeMiteScore)
    console.log("weatherConditions", JSON.stringify(weatherConditions,null, 2))
    console.log("sunDryingDuration", sunDryingDuration)

    const requestBody = {
      model: "Qwen/Qwen2.5-VL-72B-Instruct",
      max_tokens: 512,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: [
              {
                text: `I have sun-dried my duvet and uploaded a photo of it. Please analyze the effectiveness of the sun-drying process based on the image and environmental conditions.

**Current Information:**
- Original mite risk score: ${beforeMiteScore}/100
- Sun-drying duration: ${sunDryingDuration} hours
- Weather conditions during sun-drying:
  - Temperature: ${weatherConditions.temperature.toFixed(1)}°C
  - Humidity: ${weatherConditions.humidity.toFixed(0)}%
  - Precipitation probability: ${weatherConditions.precipitationProbability.toFixed(0)}%

**Your Analysis Tasks:**
1. Examine the photo to assess the sun-drying quality (proper sunlight exposure, duvet condition, drying environment)
2. Evaluate the effectiveness of the sun-drying process (0-100 score)
3. Calculate the mite score reduction based on the sun-drying conditions and photo analysis
4. Determine the final mite score after sun-drying

**Sun-Drying Effectiveness Analysis**:
Analyze the sun-drying effectiveness based on:
- Photo quality and sunlight exposure
- Weather conditions (temperature, humidity)
- Duration of sun exposure
- Overall drying environment

Provide a mite score reduction between 10-40 points based on the combined effectiveness of these factors. Do NOT include calculation details, formulas, or point breakdowns in your response.

**Output Format:**
\`\`\`json
{
  "effectiveness_score": 0-100,
  "mite_score_reduction": 10-40,
  "final_mite_score": ${Math.max(0, beforeMiteScore - 40)}-${Math.max(0, beforeMiteScore - 10)}
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
    }

    // console.log('Sending request to SiliconFlow:', JSON.stringify(requestBody, null, 2)) // Remove in production

    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Sun-drying AI analysis failed:', response.status, response.statusText)
      console.error('Error response:', errorText)
      console.log('Falling back to basic analysis')
      return calculateBasicSunDryingReduction(beforeMiteScore, weatherConditions, sunDryingDuration)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      console.error('No content in sun-drying AI response')
      return null
    }

    // Extract JSON from response
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
    if (!jsonMatch) {
      console.error('No JSON found in sun-drying AI response')
      return null
    }

    const aiResponse: SunDryingAIResponse = JSON.parse(jsonMatch[1])
    
    // Validate and constrain the response values
    const rawReduction = Math.max(10, Math.min(40, aiResponse.mite_score_reduction))
    const finalMiteScore = Math.max(0, beforeMiteScore - rawReduction)
    const actualReduction = beforeMiteScore - finalMiteScore // Calculate actual reduction applied
    
    return {
      effectivenessScore: Math.max(0, Math.min(100, aiResponse.effectiveness_score)),
      miteScoreReduction: actualReduction,
      finalMiteScore
    }
  } catch (error) {
    console.error('Error analyzing sun-drying effectiveness:', error)
    console.log('Falling back to basic analysis due to error')
    return calculateBasicSunDryingReduction(beforeMiteScore, weatherConditions, sunDryingDuration)
  }
}

// Fallback analysis for when AI is not available
export function calculateBasicSunDryingReduction(
  beforeMiteScore: number,
  weatherConditions: OptimalTimeWindow,
  sunDryingDuration: number
): SunDryingAnalysisResult {
  let reduction = 15 // Base reduction
  
  // Temperature bonus
  if (weatherConditions.temperature > 25) reduction += 5
  else if (weatherConditions.temperature > 20) reduction += 3
  else if (weatherConditions.temperature > 15) reduction += 1
  
  // Humidity bonus
  if (weatherConditions.humidity < 50) reduction += 5
  else if (weatherConditions.humidity < 65) reduction += 3
  else if (weatherConditions.humidity < 80) reduction += 1
  
  // Duration bonus
  if (sunDryingDuration > 6) reduction += 5
  else if (sunDryingDuration > 4) reduction += 3
  else if (sunDryingDuration > 2) reduction += 1
  
  // No rain bonus
  if (weatherConditions.precipitationProbability < 10) reduction += 3
  
  // Constrain reduction
  const rawReduction = Math.max(10, Math.min(40, reduction))
  const finalMiteScore = Math.max(0, beforeMiteScore - rawReduction)
  const actualReduction = beforeMiteScore - finalMiteScore // Calculate actual reduction applied
  
  // Calculate effectiveness score
  const effectivenessScore = Math.min(100, (actualReduction - 10) * 3 + 60)
  
  return {
    effectivenessScore,
    miteScoreReduction: actualReduction,
    finalMiteScore
  }
}