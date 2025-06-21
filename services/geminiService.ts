// waygo-freight/services/geminiService.ts
import { Alert } from 'react-native';

interface RouteOptimizationData {
  totalMiles: number;
  fuelEfficiency: number;
  emptyMiles: number;
  onTimePercentage: number;
  costPerMile: number;
  loadCount: number;
}

interface GeminiInsight {
  type: 'fuel_savings' | 'time_reduction' | 'cost_optimization' | 'efficiency_improvement';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialSavings: number;
  implementationEffort: 'easy' | 'medium' | 'complex';
  confidence: number;
}

class GeminiService {
  private static instance: GeminiService;
  private apiKey: string | null = null;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  private constructor() {
    // In production, this would come from environment variables
    this.apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || null;
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  private async callGeminiAPI(prompt: string): Promise<string | null> {
    if (!this.apiKey) {
      console.warn('Gemini API key not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return null;
    }
  }

  public async generateRouteOptimizationInsights(
    routes: RouteOptimizationData[]
  ): Promise<GeminiInsight[]> {
    const prompt = `
You are a logistics and transportation optimization expert. Analyze the following route performance data and provide actionable optimization insights.

Route Data:
${routes.map((route, index) => `
Route ${index + 1}:
- Total Miles: ${route.totalMiles}
- Fuel Efficiency: ${route.fuelEfficiency} MPG
- Empty Miles: ${route.emptyMiles}
- On-Time Percentage: ${route.onTimePercentage}%
- Cost per Mile: $${route.costPerMile}
- Load Count: ${route.loadCount}
`).join('\n')}

Please provide 3-5 specific, actionable optimization insights in this exact JSON format:
[
  {
    "type": "fuel_savings|time_reduction|cost_optimization|efficiency_improvement",
    "severity": "high|medium|low",
    "title": "Brief insight title",
    "description": "Detailed actionable recommendation",
    "potentialSavings": number (in dollars),
    "implementationEffort": "easy|medium|complex",
    "confidence": number (0-100)
  }
]

Focus on practical recommendations like route consolidation, fuel optimization, load planning improvements, maintenance scheduling, driver training, or technology upgrades.
`;

    try {
      const response = await this.callGeminiAPI(prompt);
      if (!response) {
        return this.getFallbackInsights();
      }

      // Extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.warn('Could not parse Gemini response as JSON');
        return this.getFallbackInsights();
      }

      const insights = JSON.parse(jsonMatch[0]) as GeminiInsight[];
      return insights.map(insight => ({
        ...insight,
        // Ensure all required fields are present
        type: insight.type || 'efficiency_improvement',
        severity: insight.severity || 'medium',
        title: insight.title || 'Optimization Opportunity',
        description: insight.description || 'AI-generated optimization recommendation',
        potentialSavings: Math.max(0, insight.potentialSavings || 1000),
        implementationEffort: insight.implementationEffort || 'medium',
        confidence: Math.min(100, Math.max(0, insight.confidence || 75))
      }));
    } catch (error) {
      console.error('Error parsing Gemini insights:', error);
      return this.getFallbackInsights();
    }
  }

  private getFallbackInsights(): GeminiInsight[] {
    return [
      {
        type: 'fuel_savings',
        severity: 'medium',
        title: 'Route Consolidation Opportunity',
        description: 'Consider consolidating routes with low load factors to reduce fuel consumption and improve efficiency.',
        potentialSavings: 2500,
        implementationEffort: 'medium',
        confidence: 80
      },
      {
        type: 'efficiency_improvement',
        severity: 'high',
        title: 'Empty Miles Reduction',
        description: 'Implement backhaul optimization to reduce empty miles and increase revenue per trip.',
        potentialSavings: 5000,
        implementationEffort: 'complex',
        confidence: 85
      }
    ];
  }

  public async generateMaintenanceInsights(vehicleData: any[]): Promise<GeminiInsight[]> {
    const prompt = `
Analyze this fleet maintenance data and provide optimization insights:
${JSON.stringify(vehicleData, null, 2)}

Provide maintenance optimization recommendations in the same JSON format focusing on preventive maintenance, cost reduction, and uptime improvement.
`;

    try {
      const response = await this.callGeminiAPI(prompt);
      if (!response) {
        return this.getFallbackMaintenanceInsights();
      }

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as GeminiInsight[];
      }
    } catch (error) {
      console.error('Error generating maintenance insights:', error);
    }

    return this.getFallbackMaintenanceInsights();
  }

  private getFallbackMaintenanceInsights(): GeminiInsight[] {
    return [
      {
        type: 'cost_optimization',
        severity: 'medium',
        title: 'Preventive Maintenance Scheduling',
        description: 'Optimize maintenance intervals based on vehicle usage patterns to reduce unexpected breakdowns.',
        potentialSavings: 3000,
        implementationEffort: 'easy',
        confidence: 90
      }
    ];
  }

  public isConfigured(): boolean {
    return this.apiKey !== null;
  }
}

export default GeminiService.getInstance();
