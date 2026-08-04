import './AIRecomendationPage.css';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCardData } from '../slices/cardSlice/cardSlice';
import type { AppDispatch, RootState } from '../store/store';
import SelectedCoins from '../Components/SelectedCoins';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_CANDIDATE_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-pro'];

export default function AIRecomendationPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { coins, isLoading: isCardLoading } = useSelector((state: RootState) => state.card);
  const selectedCoins = coins.filter((coin) => coin.isSelected);
  const [recommendation, setRecommendation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (coins.length === 0) {
      dispatch(fetchCardData());
    }
  }, [coins.length, dispatch]);

  const handleRecommendation = async () => {
    if (selectedCoins.length === 0) {
      setError('Select at least one coin first.');
      setRecommendation('');
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError('Missing VITE_GEMINI_API_KEY in environment variables.');
      setRecommendation('');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const coinDataForPrompt = selectedCoins.map((coin) => ({
        name: coin.name,
        current_price_usd: coin.current_price,
        market_cap_usd: coin.market_cap,
        volume_24h_usd: coin.total_volume,
        price_change_percentage_30d_in_currency: coin.price_change_percentage_30d_in_currency,
        price_change_percentage_60d_in_currency: coin.price_change_percentage_60d_in_currency,
        price_change_percentage_200d_in_currency: coin.price_change_percentage_200d_in_currency,
      }));

      const prompt = [
        'You are a crypto market analysis assistant.',
        'Based only on the following coin data, provide a concise and practical recommendation (not financial advice).',
        'For each coin, provide a clear verdict: Buy / Hold / Avoid.',
        'For each verdict, explain in 2-3 bullet points: strengths, key risks, and momentum trend (30/60/200 days).',
        'Use the exact fields provided and do not invent missing data.',
        'Then add a short portfolio-level summary across all selected coins.',
        '',
        'Selected coins data:',
        JSON.stringify(coinDataForPrompt, null, 2),
      ].join('\n');

      const genAI = new GoogleGenerativeAI(apiKey);
      let generatedText = '';
      let lastModelError: unknown;

      for (const modelName of GEMINI_CANDIDATE_MODELS) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          generatedText = result.response.text();
          break;
        } catch (modelError) {
          lastModelError = modelError;
        }
      }

      if (!generatedText) {
        const message = lastModelError instanceof Error ? lastModelError.message : '';
        if (message.includes('401') || message.toLowerCase().includes('api key')) {
          throw new Error('Gemini API key is invalid, missing, or not enabled for the Generative Language API.');
        }

        throw lastModelError ?? new Error('Failed to generate recommendation.');
      }

      setRecommendation(generatedText);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Failed to generate recommendation.';
      setError(message);
      setRecommendation('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <h1>AI Recommendation Page</h1>
      <p>This page provides AI-based recommendations for cryptocurrency investments.</p>
      {isCardLoading && <p className="ai-status">Loading selected coins...</p>}
      <SelectedCoins />
      <button className="ai-generate-btn" onClick={handleRecommendation} disabled={isLoading || isCardLoading}>
        {isLoading ? 'Generating...' : 'Get AI Recommendation'}
      </button>
      {error && <p className="ai-error">{error}</p>}
      {recommendation && (
        <section className="ai-response" aria-label="AI recommendation response">
          <h2>AI Recommendation</h2>
          <pre>{recommendation}</pre>
        </section>
      )}
    </div>
  );
}
