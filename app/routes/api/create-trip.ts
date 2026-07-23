import {type ActionFunctionArgs, data} from "react-router";
import {GoogleGenerativeAI} from "@google/generative-ai";
import {parseMarkdownToJson, parseTripData} from "~/lib/utils";
import {appwriteConfig, getDatabase} from "~/appwrite/client";
import {ID} from "appwrite";
import {createProduct} from "~/lib/stripe";
import * as Sentry from "@sentry/react-router";

export const action = async ({ request }: ActionFunctionArgs) => {
    const {
        country,
        numberOfDays,
        travelStyle,
        interests,
        budget,
        groupType,
        userId,
    } = await request.json();

    Sentry.setTag("api.action", "create-trip");
    Sentry.setContext("trip-form", { country, numberOfDays, travelStyle, interests, budget, groupType, userId });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const pexelsApiKey = process.env.PEXELS_API_KEY!;

    try {
        const prompt = `Generate a ${numberOfDays}-day travel itinerary for ${country} based on the following user information:
        Budget: '${budget}'
        Interests: '${interests}'
        TravelStyle: '${travelStyle}'
        GroupType: '${groupType}'
        Return the itinerary and lowest estimated price in a clean, non-markdown JSON format with the following structure:
        {
        "name": "A descriptive title for the trip",
        "description": "A brief description of the trip and its highlights not exceeding 100 words",
        "estimatedPrice": "Lowest average price for the trip in USD, e.g.$price",
        "duration": ${numberOfDays},
        "budget": "${budget}",
        "travelStyle": "${travelStyle}",
        "country": "${country}",
        "interests": ${interests},
        "groupType": "${groupType}",
        "bestTimeToVisit": [
          '🌸 Season (from month to month): reason to visit',
          '☀️ Season (from month to month): reason to visit',
          '🍁 Season (from month to month): reason to visit',
          '❄️ Season (from month to month): reason to visit'
        ],
        "weatherInfo": [
          '☀️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '🌦️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '🌧️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '❄️ Season: temperature range in Celsius (temperature range in Fahrenheit)'
        ],
        "location": {
          "city": "name of the city or region",
          "coordinates": [latitude, longitude],
          "openStreetMap": "link to open street map"
        },
        "itinerary": [
        {
          "day": 1,
          "location": "City/Region Name",
          "activities": [
            {"time": "Morning", "description": "🏰 Visit the local historic castle and enjoy a scenic walk"},
            {"time": "Afternoon", "description": "🖼️ Explore a famous art museum with a guided tour"},
            {"time": "Evening", "description": "🍷 Dine at a rooftop restaurant with local wine"}
          ]
        },
        ...
        ]
    }`;

        const textResult = await genAI
            .getGenerativeModel({ model: 'gemini-2.0-flash' })
            .generateContent([prompt])

        const trip = parseMarkdownToJson(textResult.response.text());

        const imageResponse = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(`${country} ${interests} ${travelStyle}`)}&per_page=3`,
            {
                headers: {
                    Authorization: pexelsApiKey,
                },
            }
        );

        const imageData = await imageResponse.json();
        const imageUrls = (imageData.photos || [])
            .slice(0, 3)
            .map((photo: any) => photo?.src?.medium || null);

        const result = await getDatabase().createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            ID.unique(),
            {
                tripDetails: JSON.stringify(trip),
                createdAt: new Date().toISOString(),
                imageUrls,
                userId,
            }
        )

        const tripDetail = parseTripData(result.tripDetails) as Trip;
        const tripPrice = parseInt(tripDetail.estimatedPrice.replace('$', ''), 10)
        const paymentLink = await createProduct(
            tripDetail.name,
            tripDetail.description,
            imageUrls,
            tripPrice,
            result.$id
        )

        await getDatabase().updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            result.$id,
            {
                payment_link: paymentLink.url
            }
        )

        Sentry.captureMessage("Trip created successfully", "info");
        return data({ id: result.$id })
    } catch (e) {
        Sentry.captureException(e as Error, {
            tags: { location: "create-trip-action", country, travelStyle },
            extra: { numberOfDays, interests, budget, groupType },
        });
        console.error('Error generating travel plan: ', e);
        return data({ error: 'Failed to generate travel plan' }, { status: 500 });
    }
}
